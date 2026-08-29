"use client";

import React from "react";
import { MapPin, Phone, Mail, Store, Heart, Calendar, CreditCard, User, ExternalLink } from "lucide-react";

interface A4PrintableInvoiceProps {
  order: any;
  language?: "es" | "en";
}

export function A4PrintableInvoice({ order, language = "es" }: A4PrintableInvoiceProps) {
  if (!order) return null;

  const isEn = language === "en";
  const isPickup = (order.deliveryMethod || "").toLowerCase().includes("pickup") || (order.deliveryMethod || "").toLowerCase().includes("retiro");

  const subtotal = (order.items || []).reduce((acc: number, item: any) => {
    const itemTotal = item.price * item.quantity;
    const addonsTotal = (item.addons || []).reduce((adAcc: number, ad: any) => adAcc + (ad.price || 0), 0);
    return acc + itemTotal + addonsTotal;
  }, 0);

  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleString(isEn ? "en-US" : "es-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const t = {
    invoiceTitle: isEn ? "SALES INVOICE & RECEIPT" : "FACTURA DE VENTA",
    subtitle: isEn ? "Floral Boutique & Exclusive Design" : "Boutique Floral & Diseño Exclusivo",
    status: isEn ? "Status" : "Estado",
    customerInfo: isEn ? "Customer Information" : "Información del Cliente",
    paymentMethod: isEn ? "Payment Method" : "Método de Pago",
    deliveryAddress: isPickup
      ? (isEn ? "Delivery Method: Boutique Pickup" : "Método de Entrega: Retiro en Boutique")
      : (isEn ? "Delivery Address" : "Dirección de Despacho"),
    distance: isEn ? "Calculated Distance:" : "Distancia Calculada:",
    miles: isEn ? "Miles" : "Millas",
    deliveryMode: isEn ? "Shipping Option:" : "Modalidad:",
    giftCardTitle: isEn ? "Gift Card Dedication Message:" : "Tarjeta de Dedicatoria Impresa para el Arreglo:",
    tableDesc: isEn ? "Arrangement / Product Description" : "Descripción del Arreglo / Producto",
    tableQty: isEn ? "Qty" : "Cant.",
    tableUnitPrice: isEn ? "Unit Price" : "Precio Unit.",
    tableTotal: isEn ? "Total" : "Total",
    addonsTitle: isEn ? "Customizations & Included Addons:" : "Personalizaciones / Adicionales incluidos:",
    customTextLabel: isEn ? "Custom Text / Print:" : "Texto personalizado:",
    included: isEn ? "Included" : "Incluido",
    subtotalLabel: isEn ? "Arrangements Subtotal:" : "Subtotal Arreglos:",
    couponDiscount: isEn ? "Coupon Discount" : "Descuento Cupón",
    salesTax: isEn ? "Sales Tax (8.25%):" : "Impuestos de Ley (Sales Tax 8.25%):",
    deliveryFee: isEn ? "Delivery Fee:" : "Costo de Envío / Despacho:",
    free: isEn ? "Free" : "Gratis",
    totalInvoiced: isEn ? "TOTAL INVOICED:" : "TOTAL FACTURADO:",
    footerThanks: isEn ? "Thank you for choosing Flowers For You LLC!" : "¡Gracias por tu preferencia en Flowers For You LLC!",
    footerQuality: isEn ? "Freshness Guarantee & Boutique Quality • Houston, Texas • Live Support +1 (657) 698-8586" : "Garantía de Frescura & Calidad Boutique • Houston, Texas • Atención en Vivo +1 (657) 698-8586",
  };

  return (
    <div className="bg-white text-gray-900 font-sans max-w-[210mm] mx-auto p-8 border border-gray-200 shadow-sm print:border-none print:shadow-none print:p-0 print:max-w-none print:w-full print:m-0 print:text-black">
      
      {/* Estilos específicos para Impresión A4 */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          header, nav, footer, sidebar, .no-print {
            display: none !important;
          }
          .page-break {
            page-break-after: always;
          }
        }
      `}</style>

      {/* Encabezado Principal de Factura */}
      <div className="flex justify-between items-start border-b-2 border-[#1A1C1C] pb-6 mb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#FF97A4] flex-shrink-0">
              <img src="/logo.jpg" alt="Flowers For You Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-black tracking-tight text-[#1A1C1C]">
                Flowers For You LLC
              </h1>
              <span className="text-xs font-bold text-[#FF97A4] uppercase tracking-widest block">
                {t.subtitle}
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-600 space-y-0.5 pt-1 font-medium">
            <p className="flex items-center gap-1.5">
              <MapPin size={12} className="text-[#FF97A4]" /> 6705 Fairway Dr., Houston, Texas 77087
            </p>
            <p className="flex items-center gap-1.5">
              <Phone size={12} className="text-[#FF97A4]" /> +1 (657) 698-8586
            </p>
          </div>
        </div>

        <div className="text-right space-y-1">
          <span className="inline-block bg-[#1A1C1C] text-white px-3 py-1 rounded-md text-xs font-extrabold tracking-wider uppercase mb-1">
            {t.invoiceTitle}
          </span>
          <h2 className="text-lg font-mono font-black text-[#1A1C1C]">{order.orderId}</h2>
          <p className="text-xs text-gray-500 font-medium capitalize">{formattedDate}</p>
          <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border border-emerald-500 text-emerald-700 bg-emerald-50">
            {t.status}: {order.status || "Confirmado"}
          </span>
        </div>
      </div>

      {/* Grid Información de Cliente y Entrega */}
      <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
        {/* Columna 1: Cliente */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FF97A4] block border-b pb-1 border-gray-200">
            {t.customerInfo}
          </span>
          <p className="font-bold text-sm text-[#1A1C1C] flex items-center gap-1.5">
            <User size={14} className="text-[#FF97A4]" />
            {order.customerName}
          </p>
          <p className="text-gray-600 flex items-center gap-1.5">
            <Phone size={12} className="text-gray-400" />
            <strong className="font-mono">{order.customerPhone}</strong>
          </p>
          {order.customerEmail && (
            <p className="text-gray-600 flex items-center gap-1.5">
              <Mail size={12} className="text-gray-400" />
              {order.customerEmail}
            </p>
          )}
          <p className="text-gray-600 flex items-center gap-1.5 pt-1">
            <CreditCard size={12} className="text-gray-400" />
            {t.paymentMethod}: <strong className="uppercase text-gray-900">{order.paymentMethod}</strong>
            {order.paymentRef && <span className="font-mono text-[10px] text-gray-500">({order.paymentRef})</span>}
          </p>
        </div>

        {/* Columna 2: Destino / Entrega */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#FF97A4] block border-b pb-1 border-gray-200">
            {t.deliveryAddress}
          </span>
          <p className="font-bold text-gray-900 flex items-start gap-1.5">
            {isPickup ? <Store size={14} className="text-purple-600 flex-shrink-0 mt-0.5" /> : <MapPin size={14} className="text-[#FF97A4] flex-shrink-0 mt-0.5" />}
            <span>{order.address}</span>
          </p>
          {order.distanceMiles > 0 && (
            <p className="text-[11px] font-bold text-gray-600">
              {t.distance} <span className="text-purple-700 font-mono">{order.distanceMiles} {t.miles}</span>
            </p>
          )}
          {order.deliveryMethod && (
            <p className="text-[11px] text-gray-600">
              {t.deliveryMode} <strong>{order.deliveryMethod}</strong>
            </p>
          )}
        </div>
      </div>

      {/* Tarjeta de Dedicatoria Impresa si existe */}
      {order.cardMessage && (
        <div className="bg-pink-50/70 p-4 rounded-xl border-2 border-pink-200/80 mb-6 text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-[#FF97A4] font-black uppercase text-[10px] tracking-wider">
            <Heart size={14} className="fill-[#FF97A4]" />
            <span>{t.giftCardTitle}</span>
          </div>
          <p className="font-serif italic text-sm font-semibold text-gray-900 pl-4 border-l-2 border-[#FF97A4]">
            "{order.cardMessage}"
          </p>
        </div>
      )}

      {/* Tabla de Productos / Arreglos Florales */}
      <div className="mb-6">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#1A1C1C] text-white uppercase text-[10px] tracking-wider font-extrabold">
              <th className="p-3 rounded-tl-lg">{t.tableDesc}</th>
              <th className="p-3 text-center">{t.tableQty}</th>
              <th className="p-3 text-right">{t.tableUnitPrice}</th>
              <th className="p-3 text-right rounded-tr-lg">{t.tableTotal}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 border-b border-gray-200">
            {(order.items || []).map((item: any, idx: number) => {
              const itemTotal = item.price * item.quantity;
              return (
                <React.Fragment key={idx}>
                  <tr className="hover:bg-gray-50/50">
                    <td className="p-3 font-bold text-gray-900">
                      <span>{item.name}</span>
                    </td>
                    <td className="p-3 text-center font-bold">{item.quantity}</td>
                    <td className="p-3 text-right font-mono">${item.price.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono font-bold text-gray-900">${itemTotal.toFixed(2)}</td>
                  </tr>

                  {/* Adicionales / Personalizaciones */}
                  {item.addons && item.addons.length > 0 && (
                    <tr className="bg-pink-50/30">
                      <td colSpan={4} className="px-6 py-2">
                        <div className="text-[11px] space-y-1">
                          <span className="font-bold text-[#FF97A4] text-[10px] uppercase block">{t.addonsTitle}</span>
                          {item.addons.map((add: any, aIdx: number) => (
                            <div key={aIdx} className="flex justify-between items-center text-gray-700 pl-2 border-l-2 border-[#FF97A4]">
                              <span>
                                • <strong>{add.name || add.value}</strong>
                                {add.customText && (
                                  <span className="block text-[10px] text-gray-600 italic">
                                    {t.customTextLabel} "{add.customText}"
                                  </span>
                                )}
                              </span>
                              <span className="font-mono text-[10px] text-gray-600">
                                {add.price ? `+$${(add.price * item.quantity).toFixed(2)}` : t.included}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Desglose de Totales e Impuestos */}
      <div className="flex justify-end mb-8">
        <div className="w-64 space-y-2 text-xs">
          <div className="flex justify-between text-gray-600 pb-1 border-b border-gray-100">
            <span>{t.subtotalLabel}</span>
            <span className="font-mono font-bold text-gray-800">${subtotal.toFixed(2)}</span>
          </div>

          {order.discountAmount ? (
            <div className="flex justify-between text-emerald-700 pb-1 border-b border-gray-100 font-bold">
              <span>{t.couponDiscount} {order.couponCode ? `(${order.couponCode})` : ''}:</span>
              <span className="font-mono">-${order.discountAmount.toFixed(2)}</span>
            </div>
          ) : null}

          <div className="flex justify-between text-gray-600 pb-1 border-b border-gray-100">
            <span>{t.salesTax}</span>
            <span className="font-mono font-bold text-purple-700">
              +${(order.taxAmount || 0).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-gray-600 pb-1 border-b border-gray-100">
            <span>{t.deliveryFee}</span>
            <span className="font-mono font-bold text-gray-800">
              {order.deliveryFee ? `+$${order.deliveryFee.toFixed(2)}` : t.free}
            </span>
          </div>

          <div className="flex justify-between text-sm font-black text-[#1A1C1C] pt-2 border-t-2 border-[#1A1C1C]">
            <span>{t.totalInvoiced}</span>
            <span className="font-mono text-base text-emerald-700">${(order.total || 0).toFixed(2)} USD</span>
          </div>
        </div>
      </div>

      {/* Pie de Página de Factura A4 */}
      <div className="border-t border-gray-200 pt-4 text-center text-[10px] text-gray-500 space-y-1">
        <p className="font-bold text-gray-700">{t.footerThanks}</p>
        <p>{t.footerQuality}</p>
      </div>

    </div>
  );
}
