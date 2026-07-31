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

      // Destinatarios: Administradores y opcionalmente el cliente
      const recipients = [...adminEmails];
      if (savedOrder.customerEmail && savedOrder.customerEmail.trim()) {
        recipients.push(savedOrder.customerEmail.trim());
      }
      const toEmails = Array.from(new Set(recipients)).join(", ");

      const cleanPhoneDigits = (savedOrder.customerPhone || "").replace(/\D/g, "");
      const waLink = cleanPhoneDigits ? `https://wa.me/${cleanPhoneDigits.length === 10 ? '1' + cleanPhoneDigits : cleanPhoneDigits}` : "https://wa.me/16576988586";

      const orderTotal = savedOrder.total || 0;
      const taxAmount = orderTotal * 0.0825;
      const deliveryFee = savedOrder.deliveryFee || 0;
      const discountAmount = savedOrder.discountAmount || 0;
      const netSubtotal = Math.max(0, orderTotal - taxAmount - deliveryFee + discountAmount);

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://flowersforyou.vercel.app";
      const logoUrl = `${siteUrl.replace(/\/$/, "")}/logo.jpg`;

      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background-color: #FF97A4; padding: 20px 25px; text-align: center;">
            <table role="presentation" style="margin: 0 auto; border-collapse: collapse;">
              <tr>
                <td style="vertical-align: middle; padding-right: 14px;">
                  <img src="${logoUrl}" alt="Flowers For You Logo" style="width: 46px; height: 46px; border-radius: 50%; border: 2px solid #ffffff; display: block; object-fit: cover; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />
                </td>
                <td style="vertical-align: middle; text-align: left;">
                  <h1 style="color: #ffffff; margin: 0; font-family: Georgia, serif; font-size: 24px; font-weight: bold; line-height: 1.1;">Flowers For You LLC</h1>
                  <p style="color: rgba(255,255,255,0.92); margin: 3px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-family: Arial, sans-serif; font-weight: bold;">Boutique Digital & Alta Floristería</p>
                </td>
              </tr>
            </table>
          </div>
          
          <div style="padding: 25px;">
            <h2 style="color: #1A1C1C;">¡Comprobante de Pedido / Receipt! 🌸</h2>
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 5px 0;"><strong>ID Pedido:</strong> ${savedOrder.orderId}</p>
              <p style="margin: 5px 0;"><strong>Cliente:</strong> ${savedOrder.customerName}</p>
              <p style="margin: 5px 0;"><strong>Correo Electrónico:</strong> <a href="mailto:${savedOrder.customerEmail || ''}" style="color: #FF97A4; font-weight: bold;">${savedOrder.customerEmail || 'No especificado'}</a></p>
              <p style="margin: 5px 0;"><strong>Teléfono / WhatsApp:</strong> ${savedOrder.customerPhone}</p>
              <p style="margin: 5px 0;"><strong>Opción de Entrega:</strong> ${savedOrder.deliveryMethod || orderData.deliveryMethod || "Envío a Domicilio"}</p>
              <p style="margin: 5px 0;"><strong>Dirección de Entrega:</strong> ${savedOrder.address}</p>
              ${savedOrder.distanceMiles ? `<p style="margin: 5px 0; color: #6b21a8; font-weight: bold;"><strong>📍 Distancia Calculada desde Boutique:</strong> ${savedOrder.distanceMiles} Millas</p>` : ''}
              ${savedOrder.googleMapsUrl ? `
                <div style="margin-top: 10px;">
                  <a href="${savedOrder.googleMapsUrl}" 
                     target="_blank"
                     style="background-color: #4285F4; color: white; padding: 10px 18px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 12px; display: inline-block;">
                     🗺️ Abrir Ubicación en Google Maps (Navegación GPS)
                  </a>
                </div>
              ` : ''}
            </div>

            <h3 style="color: #1A1C1C; border-bottom: 2px solid #FF97A4; padding-bottom: 5px;">Detalle de Productos:</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
              ${savedOrder.items.map((item: any) => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <strong>${item.name}</strong><br>
                    <small>Cantidad: ${item.quantity}</small>
                    ${item.addons && item.addons.length > 0 ? `<br><small style="color: #FF97A4; font-weight: bold;">+ Adicionales: ${item.addons.map((a: any) => `${a.name || a.value} ${a.price ? `(+$${a.price.toFixed(2)})` : ''}`).join(', ')}</small>` : ''}
                  </td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">$${(item.price * item.quantity).toFixed(2)} USD</td>
                </tr>
              `).join('')}
            </table>

            {/* Desglose Fiscal e Impuestos */}
            <div style="background-color: #fafafa; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 13px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Subtotal Base (sin impuestos):</span>
                <strong>$${netSubtotal.toFixed(2)} USD</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Impuestos de Ley / Taxes (8.25% incl.):</span>
                <strong>$${taxAmount.toFixed(2)} USD</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Costo de Envío:</span>
                <strong style="color: #FF97A4;">${deliveryFee > 0 ? `$${deliveryFee.toFixed(2)} USD` : "Gratis / Incluido"}</strong>
              </div>
              ${savedOrder.couponCode ? `
                <div style="display: flex; justify-content: space-between; color: #22C55E; margin-bottom: 5px;">
                  <span>Cupón Aplicado (${savedOrder.couponCode}):</span>
                  <strong>-$${discountAmount.toFixed(2)} USD</strong>
                </div>
              ` : ''}
              <div style="border-top: 1px solid #ddd; padding-top: 8px; margin-top: 8px; display: flex; justify-content: space-between; font-size: 16px;">
                <strong>TOTAL FINAL PAGADO:</strong>
                <strong style="color: #FF97A4;">$${orderTotal.toFixed(2)} USD</strong>
              </div>
            </div>

            <div style="padding: 15px; background: #fdf2f7; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 5px 0;"><strong>Método de Pago:</strong> ${savedOrder.paymentMethod}</p>
              <p style="margin: 5px 0;"><strong>Referencia de Transacción:</strong> ${savedOrder.paymentRef}</p>
            </div>

            <div style="text-align: center; margin-top: 25px;">
              <a href="${waLink}" 
                 target="_blank"
                 style="background-color: #25D366; color: white; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; font-size: 14px;">
                 Contactar por WhatsApp 💬
              </a>
            </div>
          </div>
          
          <div style="background-color: #1A1C1C; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">Flowers For You LLC • Boutique Digital</p>
          </div>
        </div>
      `;

      const info = await transporter.sendMail({
        from: sender,
        to: toEmails,
        subject: `Factura / Confirmación de Pedido: ${savedOrder.orderId}`,
        html: emailContent,
      });

      console.log("Email enviado con éxito a", toEmails, "MessageId:", info.messageId);

      console.log("Email enviado con éxito por SMTP. MessageId:", info.messageId);
    }
  } catch (error) {
    console.error("Error enviando email SMTP:", error);
  }

  return { success: true, orderId: savedOrder.orderId };
}
