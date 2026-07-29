"use server";

import dbConnect from "@/lib/db";
import { Order } from "@/lib/models/Order";
import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("Missing SMTP credentials (SMTP_HOST, SMTP_USER, SMTP_PASS)");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function createOrder(orderData: any, existingOrderId?: string) {
  await dbConnect();
  let savedOrder: any;

  if (existingOrderId) {
    const originalOrder = await Order.findOne({ orderId: existingOrderId });
    
    if (originalOrder) {
      const parts = existingOrderId.split('-');
      const baseId = `${parts[0]}-${parts[1]}`;
      const currentVersion = parseInt(parts[2]) || 1;
      const newVersion = currentVersion + 1;
      const newOrderId = `${baseId}-${newVersion}`;

      savedOrder = await Order.create({
        ...orderData,
        orderId: newOrderId,
        items: [...originalOrder.items, ...orderData.items],
        total: originalOrder.total + orderData.total,
        createdAt: new Date(),
      });
    }
  }

  if (!savedOrder) {
    savedOrder = new Order({
      ...orderData,
      orderId: "FFY-" + Math.floor(Math.random() * 100000) + "-1",
      createdAt: new Date(),
    });
    await savedOrder.save();
  }

  // Incrementar contador de uso de cupón si aplica
  if (orderData.couponCode) {
    try {
      const { Coupon } = await import("@/lib/models/Coupon");
      await Coupon.findOneAndUpdate(
        { code: orderData.couponCode.toUpperCase() },
        { $inc: { usedCount: 1 } }
      );
    } catch (err) {
      console.error("Error incrementando contador de uso de cupón:", err);
    }
  }

  // Notificación por Email usando Nodemailer
  try {
    const rawAdminEmails = process.env.ADMIN_EMAILS;
    let adminEmails = rawAdminEmails
      ? rawAdminEmails.split(',').map(e => e.trim()).filter(Boolean)
      : [];

    if (adminEmails.length === 0 && process.env.SMTP_USER) {
      adminEmails = [process.env.SMTP_USER];
    }

    if (adminEmails.length === 0) {
      console.error("Error enviando email SMTP: No se encontraron destinatarios válidos en ADMIN_EMAILS ni SMTP_USER.");
    } else {
      const transporter = getTransporter();
      const sender = process.env.SMTP_USER ? `"Flowers For You" <${process.env.SMTP_USER}>` : '"Flowers For You"';

      const cleanPhoneDigits = (savedOrder.customerPhone || "").replace(/\D/g, "");
      const waLink = cleanPhoneDigits ? `https://wa.me/${cleanPhoneDigits.length === 10 ? '1' + cleanPhoneDigits : cleanPhoneDigits}` : "https://wa.me/16576988586";

      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #FF97A4; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-family: Georgia, serif;">Flowers For You LLC</h1>
          </div>
          
          <div style="padding: 20px;">
            <h2 style="color: #1A1C1C;">¡Nuevo Pedido Recibido! 🌸</h2>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 5px 0;"><strong>ID Pedido:</strong> ${savedOrder.orderId}</p>
              <p style="margin: 5px 0;"><strong>Cliente:</strong> ${savedOrder.customerName}</p>
              <p style="margin: 5px 0;"><strong>Correo Electrónico:</strong> <a href="mailto:${savedOrder.customerEmail || ''}" style="color: #FF97A4; font-weight: bold;">${savedOrder.customerEmail || 'No especificado'}</a></p>
              <p style="margin: 5px 0;"><strong>Teléfono / WhatsApp:</strong> ${savedOrder.customerPhone}</p>
              <p style="margin: 5px 0;"><strong>Opción de Entrega:</strong> ${savedOrder.deliveryMethod || orderData.deliveryMethod || "Envío a Domicilio"}</p>
              <p style="margin: 5px 0;"><strong>Costo de Envío:</strong> ${savedOrder.deliveryFee > 0 ? `$${savedOrder.deliveryFee.toFixed(2)} USD` : "Gratis / Incluido"}</p>
              ${savedOrder.couponCode ? `<p style="margin: 5px 0; color: #22C55E;"><strong>Cupón Aplicado:</strong> ${savedOrder.couponCode} (-$${(savedOrder.discountAmount || 0).toFixed(2)} USD)</p>` : ''}
              <p style="margin: 5px 0;"><strong>Dirección / Punto de Retiro:</strong> ${savedOrder.address}</p>
            </div>

            <h3 style="color: #1A1C1C; border-bottom: 2px solid #FF97A4; padding-bottom: 5px;">Detalle del Pedido:</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              ${savedOrder.items.map((item: any) => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <strong>${item.name}</strong><br>
                    <small>Cantidad: ${item.quantity}</small>
                    ${item.addons && item.addons.length > 0 ? `<br><small style="color: #FF97A4; font-weight: bold;">+ Adicionales: ${item.addons.map((a: any) => `${a.name || a.value} ${a.price ? `(+$${a.price.toFixed(2)})` : ''}`).join(', ')}</small>` : ''}
                  </td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">$${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </table>

            <p style="font-size: 20px; font-weight: bold; text-align: right; color: #FF97A4;">Total: $${savedOrder.total.toFixed(2)} USD</p>
            
            <div style="margin-top: 20px; padding: 15px; background: #fdf2f7; border-radius: 8px;">
              <p style="margin: 5px 0;"><strong>Método de Pago:</strong> ${savedOrder.paymentMethod}</p>
              <p style="margin: 5px 0;"><strong>Referencia:</strong> ${savedOrder.paymentRef}</p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${waLink}" 
                 target="_blank"
                 style="background-color: #25D366; color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
                 Contactar Cliente por WhatsApp 💬
              </a>
            </div>
          </div>
          
          <div style="background-color: #1A1C1C; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>Flowers For You LLC - Boutique Digital</p>
          </div>
        </div>
      `;

      const info = await transporter.sendMail({
        from: sender,
        to: adminEmails.join(", "),
        subject: `Nuevo Pedido: ${savedOrder.orderId}`,
        html: emailContent,
      });

      console.log("Email enviado con éxito por SMTP. MessageId:", info.messageId);
    }
  } catch (error) {
    console.error("Error enviando email SMTP:", error);
  }

  return { success: true, orderId: savedOrder.orderId };
}
