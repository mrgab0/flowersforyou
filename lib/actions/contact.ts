"use server";

import { sendEmail, getAdminEmails, getCorporateEmailConfig } from "@/lib/email";
import dbConnect from "@/lib/db";
import { EmailMessage } from "@/lib/models/EmailMessage";

export async function sendContactEmail(formData: {
  name: string;
  email: string;
  phone?: string;
  message: string;
}) {
  try {
    await dbConnect();
    const adminEmails = getAdminEmails();
    const emailCfg = await getCorporateEmailConfig();

    // Guardar en la bandeja de entrada de MongoDB (EmailMessage)
    try {
      await EmailMessage.create({
        direction: "inbound",
        type: "contact_form",
        from: `"${formData.name}" <${formData.email}>`,
        to: ["sales@flowerforyoullc.com"],
        replyTo: formData.email,
        subject: `🌸 Consulta de Contacto: ${formData.name}`,
        bodyHtml: `<div style="font-family: Arial, sans-serif; line-height: 1.6;"><h3 style="color: #FF97A4; margin-top: 0;">Mensaje recibido a través de la web:</h3><p><strong>Cliente:</strong> ${formData.name}</p><p><strong>Correo:</strong> ${formData.email}</p><p><strong>Teléfono:</strong> ${formData.phone || "No especificado"}</p><div style="padding: 14px; background: #fdf2f7; border-left: 4px solid #FF97A4; border-radius: 6px; margin-top: 12px;">${(formData.message || "").replace(/\n/g, "<br>")}</div></div>`,
        bodyText: formData.message,
        status: "received",
        isRead: false,
        customerName: formData.name,
        customerPhone: formData.phone || "",
        customerEmail: formData.email,
        createdAt: new Date(),
      });
    } catch (saveErr) {
      console.error("Error guardando mensaje de contacto en MongoDB:", saveErr);
    }

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background-color: #FF97A4; color: white; padding: 22px; text-align: center;">
          <h1 style="margin: 0; font-family: Georgia, serif; font-size: 22px;">🌸 Nuevo Mensaje de Contacto</h1>
          <p style="margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.95;">Flowers For You LLC</p>
        </div>
        <div style="padding: 25px; background-color: #ffffff;">
          <h3 style="color: #1A1C1C; margin-top: 0; border-bottom: 2px solid #FF97A4; padding-bottom: 5px;">Detalles del Cliente:</h3>
          <p style="margin: 8px 0;"><strong>Nombre:</strong> ${formData.name}</p>
          <p style="margin: 8px 0;"><strong>Correo Electrónico:</strong> <a href="mailto:${formData.email}" style="color: #FF97A4; font-weight: bold;">${formData.email}</a></p>
          <p style="margin: 8px 0;"><strong>Teléfono / WhatsApp:</strong> ${formData.phone || "No especificado"}</p>
          
          <h3 style="color: #1A1C1C; margin-top: 20px; border-bottom: 2px solid #FF97A4; padding-bottom: 5px;">Mensaje / Consulta:</h3>
          <div style="padding: 15px; background-color: #fdf2f7; border-left: 4px solid #FF97A4; border-radius: 6px; color: #333; line-height: 1.6;">
            ${(formData.message || "").replace(/\n/g, '<br>')}
          </div>
        </div>
        <div style="background-color: #1A1C1C; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">Flowers For You LLC • Boutique Digital</p>
        </div>
      </div>
    `;

    // 1. Enviar notificación a los 3 administradores (iirockalonso, hernandezmiriamcalifornia, flowersforyou403)
    const result = await sendEmail({
      to: adminEmails,
      replyTo: formData.email,
      subject: `🌸 Nuevo Mensaje de Contacto: ${formData.name}`,
      html: emailContent,
    });

    // 2. Si el cliente proporcionó correo válido, enviarle una confirmación automática de recibido
    if (formData.email && formData.email.includes("@")) {
      const customerConfirmationContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background-color: #FF97A4; color: white; padding: 22px; text-align: center;">
            <h1 style="margin: 0; font-family: Georgia, serif; font-size: 22px;">Flowers For You LLC</h1>
            <p style="margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.95;">Boutique Digital & Alta Floristería</p>
          </div>
          <div style="padding: 25px; background-color: #ffffff;">
            <h2 style="color: #1A1C1C; margin-top: 0;">¡Hola ${formData.name}! 🌸</h2>
            <p style="color: #444; line-height: 1.6; font-size: 14px;">
              Hemos recibido tu mensaje correctamente. Nuestro equipo de diseño floral y atención al cliente se pondrá en contacto contigo a la brevedad posible.
            </p>
            <div style="background-color: #fdf2f7; border-left: 4px solid #FF97A4; padding: 15px; margin: 20px 0; border-radius: 6px; font-size: 13px; color: #555;">
              <strong>Resumen de tu mensaje:</strong><br>
              <em>"${(formData.message || "").replace(/\n/g, '<br>')}"</em>
            </div>
            <p style="color: #666; font-size: 13px;">
              Si necesitas atención urgente o personalizar un arreglo especial de inmediato, puedes escribirnos por WhatsApp:
            </p>
            <div style="text-align: center; margin-top: 20px;">
              <a href="https://wa.me/16576988586" target="_blank" style="background-color: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; font-size: 13px;">
                Contactar por WhatsApp 💬
              </a>
            </div>
          </div>
          <div style="background-color: #1A1C1C; color: white; padding: 15px; text-align: center; font-size: 11px;">
            Flowers For You LLC • Houston, Texas
          </div>
        </div>
      `;

      await sendEmail({
        to: formData.email.trim(),
        subject: `🌸 Hemos recibido tu mensaje - Flowers For You LLC`,
        html: customerConfirmationContent,
        replyTo: emailCfg.replyTo,
      }).catch((e) => console.error("Error enviando confirmación a cliente:", e));
    }

    return result;
  } catch (error: any) {
    console.error("Error enviando correo de contacto:", error);
    return { success: false, error: "Error enviando correo. " + (error?.message || "") };
  }
}
