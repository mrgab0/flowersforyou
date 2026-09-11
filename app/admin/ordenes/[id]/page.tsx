"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrderById, updateOrderStatusAction } from "@/lib/actions/order";
import { dispatchUberCourierAction, syncUberDeliveryStatusAction, cancelUberDeliveryAction } from "@/lib/actions/uberDirect";
import { A4PrintableInvoice } from "@/components/admin/A4PrintableInvoice";
import { ArrowLeft, Printer, MessageCircle, RefreshCw, CheckCircle2, Clock, MapPin, Store, Heart, Package, Globe, Car, ExternalLink, ShieldAlert, AlertTriangle, User, Phone, Navigation } from "lucide-react";

const UBER_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Buscando repartidor...", color: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-200" },
  pickup: { label: "Repartidor en camino a boutique", color: "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-200" },
  pickup_complete: { label: "Flores recogidas por repartidor", color: "bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-200" },
  dropoff: { label: "En camino al destinatario 🚀", color: "bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/60 dark:text-purple-200" },
  delivered: { label: "Entregado con éxito ✨", color: "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200" },
  canceled: { label: "Entrega Cancelada", color: "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200" },
  returned: { label: "Devuelto a Boutique", color: "bg-gray-100 text-gray-900 border-gray-300 dark:bg-gray-800 dark:text-gray-200" },
};

export default function SingleOrderDetailAdminPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState(false);
  const [invoiceLang, setInvoiceLang] = useState<"es" | "en">("es");

  // Estados para Uber Direct
  const [dispatchingUber, setDispatchingUber] = useState(false);
  const [cancelingUber, setCancelingUber] = useState(false);
  const [syncingUber, setSyncingUber] = useState(false);
  const [uberMsg, setUberMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [specialInstructions, setSpecialInstructions] = useState("");

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

  const handleDispatchUber = async () => {
    if (!order) return;
    const confirmDispatch = window.confirm(
      `¿Deseas despachar un repartidor de Uber Direct a la dirección:\n${order.address}?`
    );
    if (!confirmDispatch) return;

    setDispatchingUber(true);
    setUberMsg(null);
    const res = await dispatchUberCourierAction(order.orderId, specialInstructions);
    setDispatchingUber(false);

    if (res.success && res.data) {
      setOrder(res.data);
      setUberMsg({ type: "success", text: "¡Repartidor de Uber Direct solicitado con éxito!" });
    } else {
      setUberMsg({ type: "error", text: res.error || "No se pudo solicitar el repartidor." });
    }
  };

  const handleSyncUber = async () => {
    if (!order?.uberDeliveryId) return;
    setSyncingUber(true);
    setUberMsg(null);
    const res = await syncUberDeliveryStatusAction(order.orderId);
    setSyncingUber(false);

    if (res.success && res.data) {
      setOrder(res.data);
      setUberMsg({ type: "success", text: "Estado sincronizado con Uber en vivo." });
      setTimeout(() => setUberMsg(null), 3000);
    } else {
      setUberMsg({ type: "error", text: res.error || "No se pudo sincronizar el estado." });
    }
  };

  const handleCancelUber = async () => {
    if (!order?.uberDeliveryId) return;
    const confirmCancel = window.confirm(
      "¿Estás seguro de que deseas cancelar la entrega con Uber Direct? Esta acción no se puede deshacer."
    );
    if (!confirmCancel) return;

    setCancelingUber(true);
    setUberMsg(null);
    const res = await cancelUberDeliveryAction(order.orderId, "Cancelado por el administrador de la boutique");
    setCancelingUber(false);

    if (res.success && res.data) {
      setOrder(res.data);
      setUberMsg({ type: "success", text: "Entrega de Uber Direct cancelada." });
    } else {
      setUberMsg({ type: "error", text: res.error || "No se pudo cancelar la entrega." });
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

      {/* WIDGET DE DESPACHO Y RASTREO UBER DIRECT (DaaS) (No se imprime) */}
      <div className="no-print bg-white dark:bg-[#12131A] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4 border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-pink-500 to-[#FF97A4] text-white rounded-2xl shadow-md shadow-pink-500/20">
              <Car size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-black text-lg text-[#1A1C1C] dark:text-white">
                  Uber Direct (Delivery as a Service)
                </h2>
                {order.uberStatus && (
                  <span className={`px-3 py-1 rounded-full text-[11px] font-black border ${UBER_STATUS_CONFIG[order.uberStatus]?.color || "bg-gray-100 text-gray-800 border-gray-200"}`}>
                    {UBER_STATUS_CONFIG[order.uberStatus]?.label || order.uberStatus}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">
                Logística de repartidores a demanda y seguimiento GPS en tiempo real
              </p>
            </div>
          </div>

          {order.uberTrackingUrl && (
            <a
              href={order.uberTrackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-2xl font-black text-xs flex items-center gap-2 shadow-md transition-all hover:scale-105"
            >
              <Navigation size={14} className="text-[#FF97A4]" />
              <span>🗺️ Ver Chofer en Mapa de Uber Live</span>
              <ExternalLink size={12} className="text-gray-400" />
            </a>
          )}
        </div>

        {/* Mensaje de Resultado de Acción */}
        {uberMsg && (
          <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            uberMsg.type === "success" 
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900" 
              : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900"
          }`}>
            {uberMsg.type === "success" ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertTriangle size={16} className="text-red-600" />}
            <span>{uberMsg.text}</span>
          </div>
        )}

        {/* CASO: Retiro en Boutique */}
        {isPickup && !order.uberDeliveryId && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/40 flex items-start gap-3">
            <Store className="text-amber-600 dark:text-amber-400 mt-0.5" size={18} />
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block">
                Esta orden está marcada como "Retiro en Tienda / Boutique"
              </span>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                No requiere despacho de repartidor a menos que el cliente solicite cambiar la entrega a domicilio.
              </p>
            </div>
          </div>
        )}

        {/* CASO 1: Aún NO Despachado */}
        {!order.uberDeliveryId ? (
          <div className="bg-gray-50 dark:bg-gray-900/60 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Dirección de Destino:</span>
                <p className="text-xs font-extrabold text-[#1A1C1C] dark:text-white flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#FF97A4]" />
                  {order.address || "Dirección no especificada"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Destinatario:</span>
                <p className="text-xs font-bold text-[#1A1C1C] dark:text-white flex items-center gap-1.5">
                  <User size={14} className="text-gray-400" />
                  {order.customerName} ({order.customerPhone})
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Instrucciones Especiales para el Repartidor de Uber (Opcional):
              </label>
              <input
                type="text"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="Ej: Arreglo floral delicado, transportar en vertical, código de timbre 4B"
                className="w-full p-3 border rounded-xl text-xs font-medium dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF97A4]"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
              <span className="text-[11px] text-gray-400 font-medium">
                Al despachar, Uber asignará un repartidor cercano y enviará su ubicación satelital en vivo.
              </span>
              <button
                type="button"
                onClick={handleDispatchUber}
                disabled={dispatchingUber || !order.address}
                className="w-full sm:w-auto bg-[#FF97A4] hover:bg-[#B0004A] text-white px-7 py-3 rounded-full font-black text-xs shadow-lg shadow-pink-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 hover:scale-105"
              >
                <Car size={16} />
                {dispatchingUber ? "Solicitando a Uber..." : "🚀 Despachar Repartidor con Uber Direct"}
              </button>
            </div>
          </div>
        ) : (
          /* CASO 2: YA Despachado con Uber */
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Información del Repartidor */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Repartidor Asignado</span>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-950/80 text-[#FF97A4] flex items-center justify-center font-bold text-xs">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-[#1A1C1C] dark:text-white">
                      {order.uberCourier?.name || "Asignando chofer..."}
                    </p>
                    {order.uberCourier?.phone && (
                      <a href={`tel:${order.uberCourier.phone}`} className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-1">
                        <Phone size={11} /> {order.uberCourier.phone}
                      </a>
                    )}
                  </div>
                </div>
                {order.uberCourier?.vehicle && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Vehículo: <strong className="text-gray-700 dark:text-gray-200">{order.uberCourier.vehicle}</strong>
                  </p>
                )}
              </div>

              {/* Hora Estimada de Llegada (ETA) */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Hora Estimada de Entrega</span>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-[#FF97A4]" />
                  <p className="text-sm font-black text-[#1A1C1C] dark:text-white">
                    {order.uberDropoffEta ? new Date(order.uberDropoffEta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Calculando..."}
                  </p>
                </div>
                <p className="text-[11px] text-gray-400">
                  {order.uberDropoffEta ? new Date(order.uberDropoffEta).toLocaleDateString() : "En proceso de cálculo por Uber"}
                </p>
              </div>

              {/* Costo y Referencia Uber */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">ID & Tarifa Uber</span>
                <p className="text-xs font-mono font-bold text-[#FF97A4] truncate" title={order.uberDeliveryId}>
                  {order.uberDeliveryId}
                </p>
                <p className="text-xs font-extrabold text-gray-700 dark:text-gray-200">
                  Tarifa: <span className="text-emerald-600 dark:text-emerald-400">${(order.uberFee || 0).toFixed(2)} USD</span>
                </p>
              </div>
            </div>

            {/* Botones de Acción para el Despacho */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleSyncUber}
                disabled={syncingUber}
                className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={14} className={syncingUber ? "animate-spin" : ""} />
                {syncingUber ? "Consultando a Uber..." : "🔄 Sincronizar Estado en Vivo"}
              </button>

              {order.uberStatus && !["delivered", "canceled"].includes(order.uberStatus) && (
                <button
                  type="button"
                  onClick={handleCancelUber}
                  disabled={cancelingUber}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900 px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <AlertTriangle size={14} />
                  {cancelingUber ? "Cancelando en Uber..." : "❌ Cancelar Repartidor de Uber"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* RENDERIZADO DE LA FACTURA A4 CON IDIOMA SELECCIONADO */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
        <A4PrintableInvoice order={order} language={invoiceLang} />
      </div>

    </div>
  );
}
