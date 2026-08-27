"use server";

import { sendEmail, DEFAULT_CORPORATE_SENDER } from "@/lib/email";

export async function sendTestCorporateEmailAction(targetEmail: string) {
  try {
    const destination = (targetEmail || "").trim();
    if (!destination || !destination.includes("@")) {
      return { success: false, error: "Por favor ingresa una dirección de correo válida." };
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background-color: #FF97A4; padding: 25px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-family: Georgia, serif; font-size: 24px;">Flowers For You LLC</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px;">Prueba de Correo Corporativo</p>
        </div>
        
        <div style="padding: 30px; text-align: center;">
          <h2 style="color: #1A1C1C; margin-top: 0;">¡Servicio de Correo Conectado con Éxito! ✉️🌸</h2>
          <p style="color: #555555; font-size: 14px; line-height: 1.6;">
            Este es un correo de prueba enviado desde tu servidor de <strong>Flowers For You LLC</strong> a través del remitente corporativo oficial:
          </p>
          
          <div style="background-color: #fdf2f7; border-left: 4px solid #FF97A4; padding: 15px; text-align: left; margin: 20px 0; border-radius: 6px;">
            <p style="margin: 3px 0; font-size: 13px; color: #1A1C1C;"><strong>Remitente Oficial:</strong> ${DEFAULT_CORPORATE_SENDER}</p>
            <p style="margin: 3px 0; font-size: 13px; color: #1A1C1C;"><strong>Destinatario de Prueba:</strong> ${destination}</p>
            <p style="margin: 3px 0; font-size: 13px; color: #1A1C1C;"><strong>Fecha & Hora:</strong> ${new Date().toLocaleString("es-US", { timeZone: "America/Chicago" })} (Houston Time)</p>
          </div>

          <p style="color: #888888; font-size: 12px;">
            Los recibos de compra, notificaciones de pedidos y mensajes de contacto se enviarán automáticamente con este formato corporativo.
          </p>
        </div>

        <div style="background-color: #1A1C1C; color: white; padding: 15px; text-align: center; font-size: 11px;">
          Flowers For You LLC • Boutique Digital & Alta Floristería • Houston, Texas
        </div>
      </div>
    `;

    const result = await sendEmail({
      to: destination,
      subject: "🌸 Prueba de Correo Corporativo - Flowers For You LLC",
      html: htmlContent,
      replyTo: "sales@flowersforyou.org",
    });

    if (result.success) {
      return { success: true, message: `Correo de prueba enviado con éxito a ${destination}` };
    } else {
      return { success: false, error: result.error || "No se pudo entregar el correo." };
    }
  } catch (error: any) {
    console.error("Error en sendTestCorporateEmailAction:", error);
    return { success: false, error: error?.message || "Error al enviar correo de prueba." };
  }
}
