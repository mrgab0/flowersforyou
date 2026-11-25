/**
 * Motor de Impresión POS 100% JavaScript para Impresoras de Matriz de Punto / Star Micronics TSP100
 * y Facturación A4.
 *
 * Ejecución 100% en el navegador (Client-Side) sin requerir software adicional.
 * Incluye calibración dinámica de altura milimétrica para evitar desperdicio de metros de papel.
 * Branded for Flowers For You.
 */

export interface POSOrderItem {
  name: string;
  price: number;
  quantity: number;
  addons?: Array<{
    name?: string;
    value?: string;
    price?: number;
    customText?: string;
  }>;
}

export interface POSOrderData {
  orderId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  address?: string;
  deliveryMethod?: string;
  cardMessage?: string;
  items?: POSOrderItem[];
  subtotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  deliveryFee?: number;
  total: number;
  createdAt?: string | Date;
  status?: string;
  isPrintedToPOS?: boolean;
  paymentMethod?: string;
  paymentRef?: string;
}

const AUTOPRINT_STORAGE_KEY = "ffy_pos_autoprint_enabled";
export const POS_PRINT_EVENT = "ffy:pos-print";

export function isAutoPrintEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(AUTOPRINT_STORAGE_KEY);
  if (stored === null) return true;
  return stored === "true";
}

export function setAutoPrintEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTOPRINT_STORAGE_KEY, enabled ? "true" : "false");
  window.dispatchEvent(new CustomEvent("ffy:pos-autoprint-toggled", { detail: { enabled } }));
}

export function triggerPosPrintEvent(
  order: POSOrderData,
  format: "ticket80" | "a4" = "ticket80",
  lang: "es" | "en" = "es"
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(POS_PRINT_EVENT, {
      detail: { order, format, lang },
    })
  );
}

export function listenToPosPrintEvents(
  callback: (detail: { order: POSOrderData; format: "ticket80" | "a4"; lang: "es" | "en" }) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (e: Event) => {
    const custom = e as CustomEvent;
    if (custom.detail) {
      callback(custom.detail);
    }
  };

  window.addEventListener(POS_PRINT_EVENT, handler);
  return () => {
    window.removeEventListener(POS_PRINT_EVENT, handler);
  };
}

export function getClientPreferredLanguage(): "es" | "en" {
  if (typeof window === "undefined") return "es";

  try {
    const pathname = window.location.pathname || "";
    if (pathname.startsWith("/en/") || pathname === "/en") return "en";
    if (pathname.startsWith("/es/") || pathname === "/es") return "es";

    const saved = localStorage.getItem("ffy_preferred_lang") || localStorage.getItem("locale");
    if (saved === "en" || saved === "es") return saved;

    const navLang = (navigator.language || (navigator as any).userLanguage || "").toLowerCase();
    if (navLang.startsWith("es")) return "es";
  } catch (_) {}

  return "es";
}

export function translateOrderStatus(status?: string, lang: "es" | "en" = "es"): string {
  if (!status) return lang === "en" ? "Confirmed" : "Confirmado";
  if (lang === "es") return status;

  const s = status.toLowerCase();
  if (s.includes("entregado") || s.includes("delivered")) return "Delivered";
  if (s.includes("retirado") || s.includes("picked up")) return "Picked Up";
  if (s.includes("en camino") || s.includes("out for delivery")) return "Out for Delivery";
  if (s.includes("listo")) return "Ready for Pickup";
  if (s.includes("en diseño") || s.includes("preparando")) return "In Floral Design";
  if (s.includes("completado")) return "Completed";
  if (s.includes("cancelado")) return "Cancelled";
  return status;
}

export function translateDeliveryMethod(method?: string, lang: "es" | "en" = "es"): string {
  if (!method) return lang === "en" ? "Standard Home Delivery" : "Entrega Estándar a Domicilio";
  if (lang === "es") return method;

  const m = method.toLowerCase();
  if (m.includes("pickup") || m.includes("retiro") || m.includes("tienda")) {
    return "Retiro en Tienda";
  }
  return "Entrega a Domicilio";
}

export function translatePaymentMethod(pm?: string, lang: "es" | "en" = "es"): string {
  if (!pm) return lang === "en" ? "Card / Cash / Transfer" : "Tarjeta / Efectivo / Transferencia";
  return pm;
}

export function getPosTestOrder(): POSOrderData {
  return {
    orderId: "TEST-FFY-80MM",
    customerName: "Cliente de Prueba (Flowers For You)",
    customerPhone: "+58 412 0000000",
    customerEmail: "cliente@flowersforyou.com",
    address: "Av. Principal, Edificio Floral, Piso 2",
    deliveryMethod: "Entrega a Domicilio",
    cardMessage: "¡Feliz Cumpleaños! Que este hermoso arreglo llene tu día de alegría y amor. Con todo cariño. 🌸💖",
    items: [
      {
        name: "Ramo Magenta de 50 Rosas",
        price: 85.00,
        quantity: 1,
        addons: [
          { name: "Caja de Bombones Finos", price: 15.00 },
          { name: "Listón Personalizado", price: 5.00, customText: "Para la reina de la casa" },
        ],
      },
    ],
    subtotal: 105.00,
    discountAmount: 0,
    taxAmount: 8.40,
    deliveryFee: 5.00,
    total: 118.40,
    createdAt: new Date().toISOString(),
    status: "Confirmado (Test)",
  };
}

/**
 * Genera el documento HTML para la COMANDA DE TALLER & PREPARACIÓN (70mm / 80mm)
 * Diseñada para impresoras de matriz de puntos y térmicas: calibrada al milímetro exacto
 * sin avance excesivo ni desperdicio de papel.
 */
export function generate70mmComandaHtml(order: POSOrderData, lang: "es" | "en" = "es"): string {
  const isEn = lang === "en";
  const dateFormatted = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString(isEn ? "en-US" : "es-VE", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString();

  const items = order.items || [];
  const itemsSubtotal =
    order.subtotal ??
    items.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0);

  const itemsHtml = items
    .map((item, idx) => {
      const addons = item.addons || [];

      return `
        <div style="margin-bottom: 4px; padding-bottom: 3px; border-bottom: 1px dashed #000;">
          <div style="font-size: 11px; font-weight: 900; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 1px 2px; text-transform: uppercase;">
            >> ${isEn ? "ARRANGEMENT" : "ARREGLO"} #${idx + 1}: ${item.quantity || 1}x ${item.name}
          </div>

          <div style="padding: 2px 1px; font-size: 9.5px; line-height: 1.2;">
            ${
              addons.length > 0
                ? `<div style="margin-top: 2px;">
                    <strong style="text-decoration: underline;">✨ ${isEn ? "ADDONS / EXTRAS:" : "ADICIONALES:"}</strong>
                    ${addons
                      .map(
                        (a) =>
                          `<div style="padding-left: 6px; font-weight: bold;">
                            • ${a.name || a.value || ""}${a.price ? ` (+$${a.price.toFixed(2)})` : ""}
                            ${a.customText ? `<div style="font-weight: 900; border: 1px solid #000; padding: 1px 3px; margin-top: 1px;">"${a.customText}"</div>` : ""}
                          </div>`
                      )
                      .join("")}
                  </div>`
                : ""
            }
          </div>

          <div style="text-align: right; font-weight: bold; font-size: 9px; margin-top: 1px;">
            ${isEn ? "Subtotal:" : "Subtotal:"} $${((item.price || 0) * (item.quantity || 1)).toFixed(2)} USD
          </div>
        </div>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Comanda Matriz #${order.orderId}</title>
  <style>
    @page {
      size: 70mm auto;
      margin: 0mm !important;
    }
    @media print {
      html, body {
        width: 68mm !important;
        max-width: 70mm !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
        color: #000 !important;
        height: auto !important;
        min-height: 0 !important;
        overflow: visible !important;
        page-break-after: avoid !important;
        page-break-before: avoid !important;
        break-after: avoid !important;
        break-before: avoid !important;
      }
      #comanda-root {
        width: 68mm !important;
        max-width: 70mm !important;
        margin: 0 auto !important;
        padding: 1mm !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: 'Consolas', 'Courier New', 'Lucida Console', monospace, sans-serif;
      font-size: 9px;
      line-height: 1.15;
      color: #000;
      background: #fff;
      width: 68mm;
      max-width: 70mm;
      margin: 0 auto;
      padding: 1mm;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .font-black { font-weight: 900; }
    .uppercase { text-transform: uppercase; }
    .border-b-dashed { border-bottom: 1px dashed #000; }
    .border-b-solid { border-bottom: 1.5px solid #000; }
    .py-05 { padding-top: 1px; padding-bottom: 1px; }
    .flex-between { display: flex; justify-content: space-between; align-items: flex-start; }
    .highlight-box {
      border: 1px solid #000;
      padding: 3px 2px;
      margin: 2px 0;
    }
  </style>
</head>
<body>
  <div id="comanda-root">
    <div class="text-center" style="border-bottom: 1.5px solid #000; padding-bottom: 2px; margin-bottom: 2px;">
      <div class="font-black uppercase" style="font-size: 13px; letter-spacing: 0.5px;">FLOWERS FOR YOU</div>
      <div class="font-black uppercase" style="font-size: 9.5px; border-top: 1px dashed #000; border-bottom: 1px dashed #000; padding: 1px 0; margin: 1px 0;">
        ${isEn ? "*** WORKSHOP TICKET (DOT MATRIX / 80MM) ***" : "*** COMANDA DE TALLER (MATRIZ / 80MM) ***"}
      </div>
      <div style="font-size: 8px; font-weight: bold;">Boutique Floral • Flowers For You</div>
    </div>

    <div class="py-05 border-b-dashed" style="font-size: 9.5px;">
      <div class="flex-between font-black" style="font-size: 10.5px;">
        <span>${isEn ? "ORDER:" : "ORDEN:"} #${order.orderId}</span>
        <span style="font-size: 8.5px; font-weight: bold;">${dateFormatted}</span>
      </div>
      <div style="margin-top: 1px;">
        <span class="font-bold">${isEn ? "CUSTOMER:" : "CLIENTE:"}</span> ${order.customerName}
      </div>
      <div style="margin-top: 1px;">
        <span class="font-bold">${isEn ? "PHONE:" : "TEL:"}</span> ${order.customerPhone || "N/A"}
      </div>
      <div style="margin-top: 1px; word-break: break-word;">
        <span class="font-bold">${isEn ? "DELIVERY:" : "MODALIDAD:"}</span> ${translateDeliveryMethod(order.deliveryMethod, lang)}
      </div>
      <div style="margin-top: 1px;">
        <span class="font-bold">${isEn ? "STATUS:" : "ESTADO:"}</span> ${translateOrderStatus(order.status, lang)}
      </div>
      ${
        order.address
          ? `<div style="margin-top: 1px; word-break: break-word; border: 1px dashed #000; padding: 2px;">
              <strong style="text-decoration: underline;">${isEn ? "DELIVERY ADDRESS:" : "DIRECCIÓN DE ENTREGA:"}</strong>
              <div>${order.address}</div>
            </div>`
          : ""
      }
    </div>

    ${
      order.cardMessage
        ? `<div class="highlight-box">
            <div style="font-weight: 900; font-size: 9.5px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 1px;">
              ${isEn ? "💌 GIFT CARD MESSAGE:" : "💌 MENSAJE PARA DEDICATORIA:"}
            </div>
            <div style="font-style: italic; font-weight: bold; font-size: 10px; margin: 2px 0; word-break: break-word; line-height: 1.2;">
              "${order.cardMessage}"
            </div>
          </div>`
        : ""
    }

    <div class="py-05">
      <div style="font-weight: 900; font-size: 9.5px; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 2px;">
        ${isEn ? "🌸 FLORAL ITEMS:" : "🌸 ARREGLOS FLORALES & ADICIONALES:"}
      </div>
      ${itemsHtml}
    </div>

    <div class="py-05 border-b-dashed" style="font-size: 9px;">
      <div class="flex-between">
        <span>Subtotal: $${itemsSubtotal.toFixed(2)}</span>
        <span>Tax: +$${(order.taxAmount || 0).toFixed(2)}</span>
      </div>
      <div class="flex-between">
        <span>${isEn ? "Shipping:" : "Envío:"} ${(order.deliveryFee || 0) > 0 ? `+$${(order.deliveryFee || 0).toFixed(2)}` : (isEn ? "Free" : "Gratis")}</span>
        ${order.discountAmount ? `<span>${isEn ? "Disc:" : "Desc:"} -$${order.discountAmount.toFixed(2)}</span>` : "<span></span>"}
      </div>
      <div class="flex-between font-black border-b-solid" style="font-size: 10.5px; margin-top: 1px; padding-top: 1px; border-top: 1px solid #000;">
        <span>${isEn ? "TOTAL CHARGED:" : "TOTAL COBRADO:"}</span>
        <span>$${(order.total || 0).toFixed(2)} USD</span>
      </div>
      <div style="font-size: 8px; margin-top: 1px;" class="flex-between">
        <span>${isEn ? "Method:" : "Método:"} ${translatePaymentMethod(order.paymentMethod, lang)}</span>
        <span>Ref: ${order.paymentRef || "N/A"}</span>
      </div>
    </div>

    <div class="text-center" style="font-size: 8px; padding-top: 2px; font-weight: bold;">
      ${isEn ? "*** END OF ORDER • FLOWERS FOR YOU ***" : "*** FIN DE COMANDA • FLOWERS FOR YOU ***"}
    </div>
  </div>
</body>
</html>`;
}

export const generate80mmTicketHtml = generate70mmComandaHtml;

/**
 * Genera el documento HTML completo para Factura Estándar A4 / Carta
 */
export function generateA4InvoiceHtml(order: POSOrderData, lang: "es" | "en" = "es"): string {
  const isEn = lang === "en";
  const dateFormatted = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString(isEn ? "en-US" : "es-VE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString();

  const items = order.items || [];
  const itemsSubtotal =
    order.subtotal ??
    items.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0);

  const itemsRows = items
    .map((item) => {
      const addons =
        item.addons && item.addons.length > 0
          ? `<div style="font-size: 11px; color: #D81B60; margin-top: 2px;">
              ${item.addons
                .map(
                  (a) =>
                    `<div>+ ${a.name || a.value || ""}${
                      a.price ? ` (+$${a.price.toFixed(2)})` : ""
                    }${a.customText ? `<div style="font-style: italic; color: #374151; padding-left: 6px;">"${a.customText}"</div>` : ""}</div>`
                )
                .join("")}
            </div>`
          : "";

      return `
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 12px;">
            <strong style="color: #111827;">${item.name}</strong>
            ${addons}
          </td>
          <td style="padding: 10px 12px; text-align: center; font-weight: bold;">${item.quantity || 1}</td>
          <td style="padding: 10px 12px; text-align: right;">$${(item.price || 0).toFixed(2)}</td>
          <td style="padding: 10px 12px; text-align: right; font-weight: bold; color: #111827;">$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
        </tr>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${isEn ? "Invoice" : "Factura"} #${order.orderId} - Flowers For You</title>
  <style>
    @page {
      size: letter portrait;
      margin: 12mm;
    }
    @media print {
      body {
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
      }
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      color: #1f2937;
      background: #fff;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header-box {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #fce7f3;
      padding-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div>
      <h1 style="font-size: 24px; font-weight: 800; color: #111827; margin: 0;">Flowers For You</h1>
      <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #D81B60; margin: 2px 0 0 0;">Boutique Floral Moderna</p>
      <p style="font-size: 11px; color: #6b7280; margin: 6px 0 0 0;">Diseño Floral de Lujo y Arreglos Exclusivos</p>
    </div>

    <div style="text-align: right;">
      <div style="display: inline-block; background: #fdf2f8; border: 1px solid #fce7f3; padding: 6px 14px; border-radius: 12px; color: #D81B60; font-family: monospace; font-size: 15px; font-weight: bold;">
        ${isEn ? "INVOICE #" : "FACTURA #"} ${order.orderId}
      </div>
      <p style="font-size: 11px; color: #6b7280; margin: 8px 0 0 0;">
        <strong>${isEn ? "Date:" : "Fecha:"}</strong> ${dateFormatted}
      </p>
      <p style="font-size: 11px; color: #6b7280; margin: 2px 0 0 0;">
        <strong>${isEn ? "Status:" : "Estado:"}</strong> ${translateOrderStatus(order.status, lang)}
      </p>
    </div>
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-top: 20px;">
    <div>
      <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.5px;">
        ${isEn ? "CUSTOMER DETAILS" : "DATOS DEL CLIENTE"}
      </div>
      <div style="font-size: 14px; font-weight: bold; color: #111827; margin-top: 4px;">${order.customerName}</div>
      ${order.customerPhone ? `<div style="font-family: monospace; color: #374151; margin-top: 2px;">${order.customerPhone}</div>` : ""}
      ${order.customerEmail ? `<div style="color: #6b7280;">${order.customerEmail}</div>` : ""}
    </div>

    <div>
      <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.5px;">
        ${isEn ? "DELIVERY & PAYMENT" : "DIRECCIÓN & ENTREGA"}
      </div>
      <div style="font-size: 13px; font-weight: 600; color: #111827; margin-top: 4px;">${order.address || (isEn ? "Boutique Pickup" : "Retiro en Boutique")}</div>
      <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">
        <strong>${isEn ? "Method:" : "Método:"}</strong> ${translateDeliveryMethod(order.deliveryMethod, lang)}
      </div>
      <div style="font-size: 11px; color: #6b7280; margin-top: 2px;">
        <strong>${isEn ? "Payment:" : "Pago:"}</strong> ${translatePaymentMethod(order.paymentMethod, lang)}
      </div>
    </div>
  </div>

  ${
    order.cardMessage
      ? `
    <div style="background: #fdf2f8; border: 1px solid #fce7f3; border-radius: 12px; padding: 14px; margin-top: 16px;">
      <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #D81B60; letter-spacing: 0.5px;">
        ${isEn ? "💌 DEDICATION MESSAGE" : "💌 MENSAJE DE DEDICATORIA IMPRESO"}
      </div>
      <div style="font-style: italic; font-weight: 600; color: #1f2937; margin-top: 4px; font-size: 13px;">
        "${order.cardMessage}"
      </div>
    </div>
  `
      : ""
  }

  <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
    <thead>
      <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb; font-size: 10px; text-transform: uppercase; font-weight: bold; color: #4b5563; text-align: left;">
        <th style="padding: 8px 12px;">${isEn ? "Item Description" : "Descripción del Arreglo"}</th>
        <th style="padding: 8px 12px; text-align: center;">${isEn ? "Qty" : "Cant."}</th>
        <th style="padding: 8px 12px; text-align: right;">${isEn ? "Unit Price" : "Precio Unit."}</th>
        <th style="padding: 8px 12px; text-align: right;">${isEn ? "Subtotal" : "Subtotal"}</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows}
    </tbody>
  </table>

  <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
    <div style="width: 280px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; font-size: 12px;">
      <div style="display: flex; justify-content: space-between; color: #4b5563; margin-bottom: 6px;">
        <span>${isEn ? "Subtotal:" : "Subtotal Ítems:"}</span>
        <span style="font-weight: bold;">$${itemsSubtotal.toFixed(2)}</span>
      </div>
      ${
        order.discountAmount
          ? `<div style="display: flex; justify-content: space-between; color: #059669; margin-bottom: 6px; font-weight: 600;">
              <span>${isEn ? "Discount:" : "Descuento:"}</span>
              <span>-$${order.discountAmount.toFixed(2)}</span>
            </div>`
          : ""
      }
      <div style="display: flex; justify-content: space-between; color: #7c3aed; margin-bottom: 6px; font-weight: 600;">
        <span>Impuestos / Tax:</span>
        <span>+$${(order.taxAmount || 0).toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; color: #4b5563; margin-bottom: 8px;">
        <span>${isEn ? "Delivery Fee:" : "Envío / Delivery:"}</span>
        <span>${(order.deliveryFee || 0) > 0 ? `+$${(order.deliveryFee || 0).toFixed(2)}` : (isEn ? "Free" : "Gratis")}</span>
      </div>
      <div style="display: flex; justify-content: space-between; border-top: 1.5px solid #d1d5db; padding-top: 8px; font-size: 15px; font-weight: 900; color: #111827;">
        <span>${isEn ? "TOTAL DUE:" : "TOTAL FINAL:"}</span>
        <span style="color: #D81B60;">$${(order.total || 0).toFixed(2)} USD</span>
      </div>
    </div>
  </div>

  <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 16px; text-align: center; font-size: 11px; color: #9ca3af;">
    <p style="font-weight: bold; color: #4b5563; margin: 0;">
      ${isEn ? "Thank you for choosing Flowers For You!" : "¡Gracias por elegir a Flowers For You para tus ocasiones especiales!"}
    </p>
    <p style="margin: 4px 0 0 0;">Flowers For You • Boutique Floral de Lujo</p>
  </div>
</body>
</html>`;
}

function printHtmlInHiddenIframe(htmlContent: string, isComanda70mm: boolean = true): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      resolve(false);
      return;
    }

    try {
      const iframe = document.createElement("iframe");
      iframe.setAttribute(
        "style",
        "position: fixed; top: 0; left: 0; width: 70mm; height: 100px; border: none; opacity: 0; z-index: -9999; pointer-events: none;"
      );
      iframe.setAttribute("aria-hidden", "true");
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!iframeDoc || !iframe.contentWindow) {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        resolve(false);
        return;
      }

      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      const triggerPrint = () => {
        try {
          if (isComanda70mm) {
            const root = iframeDoc.getElementById("comanda-root") || iframeDoc.body;
            const scrollH = root ? root.scrollHeight : 350;
            const calculatedMm = Math.max(45, Math.ceil((scrollH * 25.4) / 96) + 3);

            const pageStyle = iframeDoc.createElement("style");
            pageStyle.id = "dynamic-comanda-page-size";
            pageStyle.textContent = `
              @page {
                size: 70mm ${calculatedMm}mm !important;
                margin: 0mm !important;
              }
              @media print {
                @page {
                  size: 70mm ${calculatedMm}mm !important;
                  margin: 0mm !important;
                }
                html, body {
                  width: 68mm !important;
                  max-width: 70mm !important;
                  height: ${calculatedMm}mm !important;
                  max-height: ${calculatedMm}mm !important;
                  overflow: visible !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }
              }
            `;
            iframeDoc.head.appendChild(pageStyle);
            iframe.style.height = `${calculatedMm}mm`;
          }

          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();

          setTimeout(() => {
            try {
              if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
              }
            } catch (_) {}
            resolve(true);
          }, 2000);
        } catch (printErr) {
          console.warn("Fallo al invocar print() en iframe:", printErr);
          try {
            if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
          } catch (_) {}
          resolve(false);
        }
      };

      if (iframe.contentWindow.document.readyState === "complete") {
        setTimeout(triggerPrint, 180);
      } else {
        iframe.onload = () => setTimeout(triggerPrint, 180);
      }
    } catch (e) {
      console.warn("Error creando iframe de impresión:", e);
      resolve(false);
    }
  });
}

async function ackOrderPrinted(orderId: string): Promise<void> {
  if (!orderId || orderId.startsWith("TEST-")) return;
  try {
    await fetch("/api/pos/printer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ack", orderId }),
    });
  } catch (err) {
    console.warn("No se pudo enviar ACK de impresión POS:", err);
  }
}

/**
 * 1ra Manera de Imprimir: Comanda / Ticket 70-80mm para Matriz de Punto o Impresora Térmica
 */
export async function printTicket80mmDirect(order: POSOrderData, lang?: "es" | "en"): Promise<boolean> {
  const activeLang = lang || getClientPreferredLanguage();
  const html = generate80mmTicketHtml(order, activeLang);
  const success = await printHtmlInHiddenIframe(html, true);
  if (success && order.orderId) {
    ackOrderPrinted(order.orderId);
  }
  return success;
}

export const printComanda70mmDirect = printTicket80mmDirect;

/**
 * 2da Manera de Imprimir: Factura Oficial Estándar A4 / Carta
 */
export async function printInvoiceA4Direct(order: POSOrderData, lang?: "es" | "en"): Promise<boolean> {
  const activeLang = lang || getClientPreferredLanguage();
  const html = generateA4InvoiceHtml(order, activeLang);
  return await printHtmlInHiddenIframe(html, false);
}
