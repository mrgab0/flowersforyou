"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrderById, updateOrderStatusAction } from "@/lib/actions/order";
import { A4PrintableInvoice } from "@/components/admin/A4PrintableInvoice";
import { ArrowLeft, Printer, MessageCircle, RefreshCw, CheckCircle2, Clock, MapPin, Store, Heart, Package, Globe } from "lucide-react";

export default function SingleOrderDetailAdminPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState(false);
  const [invoiceLang, setInvoiceLang] = useState<"es" | "en">("es");

  useEffect(() => {
    if (orderId) {
      loadOrderData();
    }
  }, [orderId]);

  async function loadOrderData() {
    setLoading(true);
    const res = await getOrderById(orderId);
    if (res.success && res.data) {
      setOrder(res.data);
    }
    setLoading(false);
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    setUpdating(true);
    const res = await updateOrderStatusAction(order.orderId, newStatus);
    setUpdating(false);

    if (res.success) {
      setOrder((prev: any) => ({ ...prev, status: newStatus }));
      setStatusSuccess(true);
      setTimeout(() => setStatusSuccess(false), 3000);
    } else {
      alert("No se pudo actualizar el estado de la orden.");
    }
  };

  const handlePrintSpanish = () => {
    setInvoiceLang("es");
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handlePrintEnglish = () => {
    setInvoiceLang("en");
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const createWhatsAppNotifyUrl = (ord: any) => {
    const phone = (ord.customerPhone || "").replace(/\D/g, "");
    const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://flowersforyou.vercel.app";
    const trackUrl = `${siteUrl}/rastreo`;
    const statusText = ord.status || "En Proceso";

    const msg = `¡Hola ${ord.customerName}! 🌸 Te notificamos de Flowers For You que tu pedido *${ord.orderId}* se encuentra en estado: *${statusText}* ✨\n\nPuedes rastrear la entrega en tiempo real aquí: ${trackUrl}`;

    return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-gray-500 font-bold animate-pulse flex flex-col items-center justify-center gap-3">
        <RefreshCw className="animate-spin text-[#FF97A4]" size={28} />
        <span>Cargando detalle de la factura...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white dark:bg-[#12131A] rounded-3xl border border-gray-200 dark:border-gray-800 space-y-4">
        <Package className="mx-auto text-gray-400" size={40} />
        <h1 className="text-xl font-bold text-[#1A1C1C] dark:text-white">Pedido No Encontrado</h1>
        <p className="text-xs text-gray-500">No pudimos encontrar la orden con ID: <strong className="font-mono">{orderId}</strong></p>
        <button
          onClick={() => router.push("/admin/ordenes")}
          className="bg-[#1A1C1C] text-white px-5 py-2.5 rounded-full font-bold text-xs hover:bg-[#FF97A4] transition-colors"
        >
          Volver a Lista de Órdenes
        </button>
      </div>
    );
  }

  const isPickup = (order.deliveryMethod || "").toLowerCase().includes("pickup") || (order.deliveryMethod || "").toLowerCase().includes("retiro");

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      
      {/* Botones de Control Arriba (No se imprimen) */}
      <div className="no-print bg-white dark:bg-[#12131A] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/admin/ordenes")}
            className="p-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl transition-colors"
            title="Volver"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#1A1C1C] dark:text-white flex items-center gap-2">
              Detalle de Orden <span className="font-mono text-[#FF97A4]">{order.orderId}</span>
            </h1>
            <p className="text-xs text-gray-400">Cliente: {order.customerName} • {order.customerPhone}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Selector de Previsualización de Idioma */}
          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl text-xs font-bold">
            <Globe size={14} className="text-gray-400 ml-1.5" />
            <button
              onClick={() => setInvoiceLang("es")}
              className={`px-2.5 py-1 rounded-lg transition-all ${invoiceLang === "es" ? "bg-white dark:bg-gray-900 text-[#FF97A4] shadow-sm" : "text-gray-500"}`}
            >
              🇪🇸 ES
            </button>
            <button
              onClick={() => setInvoiceLang("en")}
              className={`px-2.5 py-1 rounded-lg transition-all ${invoiceLang === "en" ? "bg-white dark:bg-gray-900 text-[#FF97A4] shadow-sm" : "text-gray-500"}`}
            >
              🇺🇸 EN
            </button>
          </div>

          {/* Selector de Estado */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400">Estado:</span>
            <select
              value={order.status || (isPickup ? "En diseño" : "Confirmado")}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs font-bold text-[#1A1C1C] dark:text-white focus:ring-2 focus:ring-[#FF97A4] focus:outline-none"
            >
              <option value="Confirmado">🕒 Confirmado</option>
              <option value="En diseño">🌸 En diseño floral</option>
              <option value="En espera de despacho">📦 En espera de despacho</option>
              <option value="En camino">🚚 En camino a ubicación</option>
              <option value="Listo para retirar">🏪 Listo para retirar en boutique</option>
              <option value="Entregado">✅ Entregado exitosamente</option>
              <option value="Retirado">✅ Retirado por cliente</option>
            </select>
            {statusSuccess && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={14} /> Actualizado
              </span>
            )}
          </div>

          <a
            href={createWhatsAppNotifyUrl(order)}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <MessageCircle size={15} />
            <span>WhatsApp</span>
          </a>

          {/* DOS BOTONES DE IMPRESIÓN BILINGÜE */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintSpanish}
              className="bg-[#FF97A4] hover:bg-[#B0004A] text-white px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
              title="Imprimir Factura en Español"
            >
              <Printer size={15} />
              <span>🇪🇸 Imprimir Factura</span>
            </button>

            <button
              onClick={handlePrintEnglish}
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
              title="Print Invoice in English"
            >
              <Printer size={15} className="text-[#FF97A4]" />
              <span>🇺🇸 Print Invoice</span>
            </button>
          </div>
        </div>
      </div>

      {/* RENDERIZADO DE LA FACTURA A4 CON IDIOMA SELECCIONADO */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
        <A4PrintableInvoice order={order} language={invoiceLang} />
      </div>

    </div>
  );
}
