"use server";

import dbConnect from "@/lib/db";
import { ContactMessage } from "@/lib/models/ContactMessage";
import { headers } from "next/headers";
import { Resend } from "resend";

// Registro en memoria para control de flood / rate limiting (IP y Email)
const rateLimitMap = new Map<string, number>();
const COOLDOWN_MS = 60 * 1000; // 60 segundos de cooldown
const MIN_FILL_TIME_MS = 3000; // Mínimo 3 segundos entre carga y envío para frenar bots

// Limpieza periódica de entradas vencidas en memoria
function cleanupRateLimitMap() {
  const now = Date.now();
  for (const [key, timestamp] of rateLimitMap.entries()) {
    if (now - timestamp > COOLDOWN_MS * 2) {
      rateLimitMap.delete(key);
    }
  }
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  honeypot?: string; // Campo trampa para robots
  formLoadedAt?: number; // Timestamp de cuando se montó el formulario en cliente
}

export async function sendContactMessage(formData: ContactFormData) {
  try {
    cleanupRateLimitMap();
    const now = Date.now();

    // 1. Detección de Bots por Honeypot
    // Si el campo invisible fue completado por un bot, descartamos silenciosamente
    if (formData.honeypot && formData.honeypot.trim() !== "") {
      console.warn("DEBUG - Envío bloqueado por trampa Honeypot (bot detectado)");
      return { success: true, message: "Mensaje recibido correctamente." };
    }

    // 2. Detección de Bots por Tiempo de interacción (Time-trap)
    // Los robots envían el formulario de forma casi instantánea (< 3s)
    if (formData.formLoadedAt && now - formData.formLoadedAt < MIN_FILL_TIME_MS) {
      return {
        success: false,
        error: "Envío demasiado rápido. Por favor tómate unos segundos para redactar tu mensaje.",
      };
    }

    // 3. Obtención de IP para Rate Limiting
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    const realIp = headerList.get("x-real-ip");
    const clientIp = (forwardedFor?.split(",")[0] || realIp || "unknown").trim();

    // 4. Rate Limiting por IP y por Correo (Evitar dos mensajes seguidos)
    const emailKey = `email:${formData.email?.toLowerCase().trim()}`;
    const ipKey = `ip:${clientIp}`;

    const lastEmailSub = rateLimitMap.get(emailKey);
    const lastIpSub = clientIp !== "unknown" ? rateLimitMap.get(ipKey) : undefined;

    if (lastEmailSub && now - lastEmailSub < COOLDOWN_MS) {
      const remainingSec = Math.ceil((COOLDOWN_MS - (now - lastEmailSub)) / 1000);
      return {
        success: false,
        error: `Has enviado un mensaje recientemente. Por favor espera ${remainingSec} segundos antes de enviar otro.`,
      };
    }

    if (lastIpSub && now - lastIpSub < COOLDOWN_MS) {
      const remainingSec = Math.ceil((COOLDOWN_MS - (now - lastIpSub)) / 1000);
      return {
        success: false,
        error: `Demasiados envíos desde tu conexión. Por favor espera ${remainingSec} segundos.`,
      };
    }

    // 5. Validaciones de campos requeridos
    if (!formData.name?.trim()) {
      return { success: false, error: "El nombre es obligatorio." };
    }
    if (!formData.email?.trim() || !formData.email.includes("@")) {
      return { success: false, error: "Por favor ingresa un correo electrónico válido." };
    }
    if (!formData.message?.trim() || formData.message.trim().length < 5) {
      return { success: false, error: "El mensaje debe tener al menos 5 caracteres." };
    }

    // 6. Registro del envío en el rate limiter
    rateLimitMap.set(emailKey, now);
    if (clientIp !== "unknown") {
      rateLimitMap.set(ipKey, now);
    }

    // 7. Guardar en Base de Datos MongoDB
    await dbConnect();
    const newContactMessage = new ContactMessage({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone?.trim() || "",
      subject: formData.subject?.trim() || "Consulta general",
      message: formData.message.trim(),
      ip: clientIp,
      status: "unread",
      createdAt: new Date(),
    });

    await newContactMessage.save();

    // 8. Envío de Notificación por Email (Resend) si está configurado
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];

        if (adminEmails.length > 0) {
          await resend.emails.send({
            from: "contacto@flowersforyou.com",
            to: adminEmails,
            subject: `Nuevo mensaje de contacto: ${formData.subject || "Consulta general"}`,
            html: `
              <h2>Nuevo Mensaje de Contacto</h2>
              <p><strong>Nombre:</strong> ${newContactMessage.name}</p>
              <p><strong>Email:</strong> ${newContactMessage.email}</p>
              <p><strong>Teléfono:</strong> ${newContactMessage.phone || "No proporcionado"}</p>
              <p><strong>Asunto:</strong> ${newContactMessage.subject}</p>
              <p><strong>Mensaje:</strong></p>
              <blockquote style="background: #fdf2f7; padding: 12px; border-left: 4px solid #FF97A4;">
                ${newContactMessage.message.replace(/\n/g, "<br/>")}
              </blockquote>
              ${newContactMessage.phone ? `<p><a href="https://wa.me/${newContactMessage.phone.replace(/\D/g, "")}">Contactar por WhatsApp</a></p>` : ""}
            `,
          });
        }
      } catch (emailError) {
        console.error("DEBUG - Error enviando correo de notificación de contacto:", emailError);
      }
    }

    return {
      success: true,
      message: "¡Gracias por comunicarte con nosotros! Hemos recibido tu mensaje y te responderemos a la brevedad.",
    };
  } catch (error: any) {
    console.error("DEBUG - Error procesando mensaje de contacto:", error);
    return {
      success: false,
      error: "Ocurrió un error inesperado al procesar tu mensaje. Por favor intenta más tarde.",
    };
  }
}
