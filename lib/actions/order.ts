"use server";

import dbConnect from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { EmailMessage } from "@/lib/models/EmailMessage";
import { sendEmail, getAdminEmails, getCorporateEmailConfig } from "@/lib/email";
import { validateOrderSecurity } from "@/lib/captcha";

export async function createOrder(orderData: any, existingOrderId?: string) {
  // Verificación de seguridad Anti-Robots y Trampa Honeypot
  const securityCheck = validateOrderSecurity(orderData?.captchaToken, orderData?.honeypot);
  if (!securityCheck.valid) {
    console.warn(`[Security Alert] Automated bot or unverified order blocked: ${securityCheck.reason}`);
    return { success: false, error: "Verificación de seguridad requerida. Por favor completa el captcha." };
  }

  await dbConnect();
  let savedOrder: any;
  let originalOrder: any = null;
  let isConsolidatedWithin2Hours = false;
  let minutesElapsed = 0;

  if (existingOrderId) {
    originalOrder = await Order.findOne({ orderId: existingOrderId });
    
    if (originalOrder && originalOrder.createdAt) {
      const diffMs = Date.now() - new Date(originalOrder.createdAt).getTime();
      minutesElapsed = Math.floor(diffMs / (1000 * 60));
      const hoursElapsed = diffMs / (1000 * 60 * 60);

      const statusLower = (originalOrder.status || "").toLowerCase();
      // Solo agrupar si han pasado menos de 2 horas Y el pedido no ha sido enviado aún
      const isNotDispatched = !statusLower.includes("camino") && !statusLower.includes("entregado") && !statusLower.includes("retirado");

      if (hoursElapsed <= 2 && isNotDispatched) {
        isConsolidatedWithin2Hours = true;
      }
    }
  }

  if (isConsolidatedWithin2Hours && originalOrder && existingOrderId) {
    const parts = existingOrderId.split('-');
    const baseId = `${parts[0]}-${parts[1]}`;
    const currentVersion = parseInt(parts[2]) || 1;
    const newVersion = currentVersion + 1;
    const newOrderId = `${baseId}-${newVersion}`;

    savedOrder = await Order.create({
      ...orderData,
      orderId: newOrderId,
      // Se guardan ÚNICAMENTE los ítems y total de ESTA nueva transacción (Factura Limpia)
      items: orderData.items,
      total: orderData.total,
      createdAt: new Date(),
    });
  }

  if (!savedOrder) {
    savedOrder = new Order({
      ...orderData,
      orderId: "FFY-" + Math.floor(Math.random() * 100000) + "-1",
      items: orderData.items,
      total: orderData.total,
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

  // Notificación y Factura por Email (Resend API / SMTP)
  try {
    const adminEmails = getAdminEmails();
    const customerEmail = (savedOrder.customerEmail || orderData.customerEmail || "").trim();

    // Construir lista de destinatarios (cliente + ambos administradores iirockalonso y flowersforyou403)
    const recipientList: string[] = [];
    if (customerEmail && customerEmail.includes("@")) {
      recipientList.push(customerEmail);
    }
    for (const adm of adminEmails) {
      if (!recipientList.includes(adm)) {
        recipientList.push(adm);
      }
    }

    if (recipientList.length === 0) {
      console.warn("No hay destinatarios válidos para la notificación de orden.");
    } else {
      const emailCfg = await getCorporateEmailConfig();
      const cleanPhoneDigits = (savedOrder.customerPhone || "").replace(/\D/g, "");
      const waLink = cleanPhoneDigits ? `https://wa.me/${cleanPhoneDigits.length === 10 ? '1' + cleanPhoneDigits : cleanPhoneDigits}` : "https://wa.me/16576988586";

      const orderTotal = savedOrder.total || 0;
      const deliveryFee = savedOrder.deliveryFee || 0;
      const discountAmount = savedOrder.discountAmount || 0;
      const taxAmount = savedOrder.taxAmount || 0;

      const itemsSubtotal = (savedOrder.items || []).reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://flowerforyoullc.com";
      const logoSrc = `${siteUrl.replace(/\/$/, "")}/logo.jpg`;

      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background: #ffffff;">
          <div style="background-color: #FF97A4; padding: 20px 25px; text-align: center;">
            <table role="presentation" style="margin: 0 auto; border-collapse: collapse;">
              <tr>
                <td style="vertical-align: middle; padding-right: 14px;">
                  <img src="${logoSrc}" alt="Flowers For You Logo" style="width: 46px; height: 46px; border-radius: 50%; border: 2px solid #ffffff; display: block; object-fit: cover; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />
                </td>
                <td style="vertical-align: middle; text-align: left;">
                  <h1 style="color: #ffffff; margin: 0; font-family: Georgia, serif; font-size: 24px; font-weight: bold; line-height: 1.1;">Flowers For You LLC</h1>
                  <p style="color: rgba(255,255,255,0.92); margin: 3px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-family: Arial, sans-serif; font-weight: bold;">Boutique Digital & Alta Floristería</p>
                </td>
              </tr>
            </table>
          </div>
          
          <div style="padding: 25px;">
            <h2 style="color: #1A1C1C; margin-top: 0;">¡Comprobante de Pedido / Receipt! 🌸</h2>

            ${isConsolidatedWithin2Hours && originalOrder ? `
              <div style="margin-bottom: 20px; padding: 14px; background-color: #f3e8ff; border-left: 4px solid #9333ea; border-radius: 8px;">
                <strong style="color: #6b21a8; font-size: 13px;">📦 Nota de Envío Agrupado / Consolidado (< 2 horas):</strong><br>
                <span style="font-size: 12px; color: #4c1d95; display: block; margin-top: 4px;">
                  Esta compra fue realizada <strong>${minutesElapsed} min</strong> después de tu pedido previo (<strong>#${originalOrder.orderId}</strong>). Como tu primer pedido aún está en diseño en boutique, nuestros repartidores agruparán ambos paquetes en la misma ruta de entrega a tu ubicación.
                </span>
              </div>
            ` : ''}
            
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 5px 0;"><strong>ID Pedido:</strong> ${savedOrder.orderId}</p>
              <p style="margin: 5px 0;"><strong>Cliente:</strong> ${savedOrder.customerName}</p>
              <p style="margin: 5px 0;"><strong>Correo Electrónico:</strong> <a href="mailto:${savedOrder.customerEmail || ''}" style="color: #FF97A4; font-weight: bold;">${savedOrder.customerEmail || 'No especificado'}</a></p>
              <p style="margin: 5px 0;"><strong>Teléfono / WhatsApp:</strong> ${savedOrder.customerPhone}</p>
              <p style="margin: 5px 0;"><strong>Opción de Entrega:</strong> ${savedOrder.deliveryMethod || orderData.deliveryMethod || "Envío a Domicilio"}</p>
              <p style="margin: 5px 0;"><strong>Dirección de Entrega:</strong> ${savedOrder.address}</p>
              ${savedOrder.distanceMiles ? `<p style="margin: 5px 0; color: #6b21a8; font-weight: bold;"><strong>📍 Distancia Calculada desde Boutique:</strong> ${savedOrder.distanceMiles} Millas</p>` : ''}
              
              ${savedOrder.cardMessage ? `
                <div style="margin-top: 12px; padding: 12px; background-color: #fff0f3; border-left: 4px solid #ff97a4; border-radius: 6px;">
                  <strong style="color: #b0004a; font-size: 13px;">💌 Tarjeta de Dedicatoria Impresa Incluida:</strong><br>
                  <em style="color: #333333; font-size: 13px; display: block; margin-top: 4px;">"${savedOrder.cardMessage}"</em>
                </div>
              ` : ''}

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

            <h3 style="color: #1A1C1C; border-bottom: 2px solid #FF97A4; padding-bottom: 5px;">Detalle de Productos & Adicionales de esta Compra:</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
              ${savedOrder.items.map((item: any) => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <strong>${item.name}</strong><br>
                    <small>Cantidad: ${item.quantity}</small>
                    ${item.addons && item.addons.length > 0 ? `
                      <div style="margin-top: 6px; padding: 8px; background: #fff0f3; border-left: 3px solid #ff97a4; border-radius: 4px;">
                        <strong style="color: #b0004a; font-size: 11px;">Adicionales Seleccionados:</strong><br>
                        ${item.addons.map((a: any) => `
                          <div style="font-size: 11px; margin-top: 3px; color: #333;">
                            ✨ <strong>${a.name || a.value}</strong> ${a.price ? `(+$${a.price.toFixed(2)})` : ''}
                            ${a.customText ? `<div style="color: #d81b60; font-style: italic; font-weight: bold; margin-left: 10px;">💬 Texto / Dedicatoria: "${a.customText}"</div>` : ''}
                          </div>
                        `).join('')}
                      </div>
                    ` : ''}
                  </td>
                  <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; vertical-align: top;">$${(item.price * item.quantity).toFixed(2)} USD</td>
                </tr>
              `).join('')}
            </table>

            <!-- Desglose Fiscal e Impuestos Transparente -->
            <div style="background-color: #fafafa; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 13px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Subtotal Arreglos & Adicionales:</span>
                <strong>$${itemsSubtotal.toFixed(2)} USD</strong>
              </div>
              ${savedOrder.couponCode ? `
                <div style="display: flex; justify-content: space-between; color: #22C55E; margin-bottom: 5px;">
                  <span>Descuento Cupón (${savedOrder.couponCode}):</span>
                  <strong>-$${discountAmount.toFixed(2)} USD</strong>
                </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px; color: #6b21a8;">
                <span>🏛️ Impuestos de Ley / Sales Tax (8.25%):</span>
                <strong>+$${taxAmount.toFixed(2)} USD</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Costo de Envío:</span>
                <strong style="color: #FF97A4;">${deliveryFee > 0 ? `+$${deliveryFee.toFixed(2)} USD` : "Gratis / Incluido"}</strong>
              </div>
              <div style="border-top: 1px solid #ddd; padding-top: 8px; margin-top: 8px; display: flex; justify-content: space-between; font-size: 16px;">
                <strong>TOTAL FINAL PAGADO EN ESTA ORDEN:</strong>
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

      const emailRes = await sendEmail({
        to: recipientList,
        subject: `🌸 Factura / Confirmación de Pedido: ${savedOrder.orderId}`,
        html: emailContent,
        replyTo: emailCfg.replyTo,
      });

      // Registrar en la colección EmailMessage para visualización en el Panel Admin
      try {
        await EmailMessage.create({
          direction: "outbound",
          type: "order_receipt",
          from: emailRes.sender || emailCfg.senderFormatted,
          to: recipientList,
          replyTo: emailCfg.replyTo,
          subject: `🌸 Factura / Confirmación de Pedido: ${savedOrder.orderId}`,
          bodyHtml: emailContent,
          status: emailRes.success ? "sent" : "failed",
          isRead: true,
          customerName: savedOrder.customerName || "",
          customerPhone: savedOrder.customerPhone || "",
          customerEmail: savedOrder.customerEmail || "",
          orderId: savedOrder.orderId,
          resendMessageId: emailRes.messageId || "",
          bccAdmins: true,
          createdAt: new Date(),
        });
      } catch (logErr) {
        console.error("Error guardando registro de email de orden en MongoDB:", logErr);
      }

      console.log(`[Order Email] Notificación de orden ${savedOrder.orderId} enviada a: ${recipientList.join(", ")}`);
    }
  } catch (error) {
    console.error("Error enviando email de orden:", error);
  }

  return { success: true, orderId: savedOrder.orderId };
}

export async function getOrderById(orderIdOrPhone: string) {
  try {
    await dbConnect();
    const query = orderIdOrPhone.trim();

    const order = await Order.findOne({
      $or: [
        { orderId: query },
        { customerPhone: { $regex: query, $options: "i" } },
        { customerName: { $regex: query, $options: "i" } }
      ]
    }).lean();

    if (!order) {
      return { success: false, error: "Pedido no encontrado." };
    }

    return { success: true, data: JSON.parse(JSON.stringify(order)) };
  } catch (error) {
    console.error("Error al buscar pedido:", error);
    return { success: false, error: "Error al buscar el pedido." };
  }
}

export async function updateOrderStatusAction(orderId: string, status: string) {
  try {
    await dbConnect();
    const updated = await Order.findOneAndUpdate(
      { orderId },
      { status },
      { new: true }
    );
    if (!updated) {
      return { success: false, error: "Pedido no encontrado." };
    }
    return { success: true, data: JSON.parse(JSON.stringify(updated)) };
  } catch (error) {
    console.error("Error actualizando estado del pedido:", error);
    return { success: false, error: "Error al actualizar el estado del pedido." };
  }
}

export async function getAllOrdersAction() {
  try {
    await dbConnect();
    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(100).lean();
    return { success: true, data: JSON.parse(JSON.stringify(orders)) };
  } catch (error) {
    console.error("Error obteniendo lista de órdenes:", error);
    return { success: false, error: "No se pudieron obtener las órdenes." };
  }
}

export async function updateOrderInvoiceAction(
  orderId: string,
  data: {
    distanceMiles?: number;
    deliveryFee?: number;
    status?: string;
  }
) {
  try {
    await dbConnect();
    const order = await Order.findOne({ orderId });
    if (!order) {
      return { success: false, error: "Pedido no encontrado." };
    }

    const newMiles = typeof data.distanceMiles === "number" ? Math.max(0, data.distanceMiles) : (order.distanceMiles || 0);
    const newFee = typeof data.deliveryFee === "number" ? Math.max(0, data.deliveryFee) : (order.deliveryFee || 0);

    // Recalcular subtotal de items y addons
    const itemsSubtotal = (order.items || []).reduce((acc: number, item: any) => {
      const itemTotal = item.price * item.quantity;
      const addonsTotal = (item.addons || []).reduce((adAcc: number, ad: any) => adAcc + (ad.price || 0), 0);
      return acc + itemTotal + addonsTotal;
    }, 0);

    const discountAmount = order.discountAmount || 0;
    const taxableSubtotal = Math.max(0, itemsSubtotal - discountAmount);
    const taxAmount = order.taxAmount !== undefined && order.taxAmount !== null
      ? order.taxAmount
      : Math.round(taxableSubtotal * 0.0825 * 100) / 100;

    const newTotal = Math.round((taxableSubtotal + taxAmount + newFee) * 100) / 100;

    order.distanceMiles = newMiles;
    order.deliveryFee = newFee;
    order.total = newTotal;
    if (data.status) {
      order.status = data.status;
    }

    await order.save();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(order)),
      message: "Factura actualizada exitosamente."
    };
  } catch (error) {
    console.error("Error actualizando factura del pedido:", error);
    return { success: false, error: "Error al actualizar la factura del pedido." };
  }
}
