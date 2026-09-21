"use client";

import { useEffect, useState } from "react";
import { getAllOrdersAction, updateOrderStatusAction, updateOrderInvoiceAction } from "@/lib/actions/order";
import { Package, Truck, CheckCircle2, Clock, MapPin, User, MessageCircle, RefreshCw, ArrowLeft, Search, Filter, Store, ExternalLink, Calendar, MessageSquare, Heart, Printer, ArrowUpDown, DollarSign, Edit3, Save, X, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminOrdenesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Estados para Edición Manual de Factura / Envío
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [editMiles, setEditMiles] = useState<number | string>(0);
  const [editFee, setEditFee] = useState<number | string>(0);
  const [savingInvoice, setSavingInvoice] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    const res = await getAllOrdersAction();
    if (res.success && res.data) {
      setOrders(res.data);
    }
    setLoading(false);
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const res = await updateOrderStatusAction(orderId, newStatus);
    if (res.success) {
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
      );
    } else {
      alert("No se pudo actualizar el estado de la orden.");
    }
    setUpdatingId(null);
  };

  const openEditInvoice = (order: any) => {
    setEditingOrder(order);
    setEditMiles(order.distanceMiles || 0);
    setEditFee(order.deliveryFee || 0);
  };

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    setSavingInvoice(true);
    const milesNum = Math.max(0, parseFloat(editMiles.toString()) || 0);
    const feeNum = Math.max(0, parseFloat(editFee.toString()) || 0);

    const res = await updateOrderInvoiceAction(editingOrder.orderId, {
      distanceMiles: milesNum,
      deliveryFee: feeNum,
    });

    setSavingInvoice(false);

    if (res.success && res.data) {
      setOrders((prev) =>
        prev.map((o) => (o.orderId === editingOrder.orderId ? res.data : o))
      );
      setEditingOrder(null);
    } else {
      alert(res.error || "No se pudo actualizar la factura.");
    }
  };

  const createWhatsAppApprovalUrl = (order: any) => {
    const phone = (order.customerPhone || "").replace(/\D/g, "");
    const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://flowerforyoullc.com";
    const trackUrl = `${siteUrl}/rastreo`;
    const hasFee = (order.deliveryFee || 0) > 0;

    let msg = "";
    if (hasFee) {
      msg = `¡Hola ${order.customerName}! 🌸 Te escribimos de Flowers For You LLC.\n\nHemos cotizado el despacho de tu pedido *${order.orderId}*:\n📍 Distancia: *${order.distanceMiles || 0} Millas*\n🚚 Costo de Envío: *$${(order.deliveryFee || 0).toFixed(2)} USD*\n💰 Total Final Facturado: *$${(order.total || 0).toFixed(2)} USD*\n\n¿Nos confirmas tu aprobación para proceder con la entrega? ✨\nPuedes ver tu factura y rastreo aquí: ${trackUrl}`;
    } else {
      const statusText = order.status || "En Proceso";
      msg = `¡Hola ${order.customerName}! 🌸 Te notificamos de Flowers For You que tu pedido *${order.orderId}* se encuentra en estado: *${statusText}* ✨\n\nPuedes rastrear el avance en tiempo real aquí: ${trackUrl}`;
    }

    return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  // 1. Filtrado de Órdenes por Búsqueda y Estado
  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (order.orderId || "").toLowerCase().includes(term) ||
      (order.customerName || "").toLowerCase().includes(term) ||
      (order.customerPhone || "").toLowerCase().includes(term) ||
      (order.customerEmail || "").toLowerCase().includes(term) ||
      (order.address || "").toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (selectedFilter === "all") return true;
    const status = (order.status || "").toLowerCase();
    if (selectedFilter === "espera") return status.includes("espera") || status.includes("diseño") || status.includes("confirmado");
    if (selectedFilter === "camino") return status.includes("camino") || status.includes("listo");
    if (selectedFilter === "entregado") return status.includes("entregado") || status.includes("retirado");

    return true;
  });

  // 2. Ordenamiento Avanzado Multicriterio
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === "date-desc") {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }
    if (sortBy === "date-asc") {
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    }
    if (sortBy === "price-desc") {
      return (b.total || 0) - (a.total || 0);
    }
    if (sortBy === "price-asc") {
      return (a.total || 0) - (b.total || 0);
    }
    if (sortBy === "items-desc") {
      return (b.items?.length || 0) - (a.items?.length || 0);
    }
    if (sortBy === "distance-desc") {
      return (b.distanceMiles || 0) - (a.distanceMiles || 0);
    }
    return 0;
  });

  // Cálculo en vivo del nuevo total en el modal
  const calculateModalTotal = () => {
    if (!editingOrder) return 0;
    const itemsSubtotal = (editingOrder.items || []).reduce((acc: number, item: any) => {
      const itemTotal = item.price * item.quantity;
      const addonsTotal = (item.addons || []).reduce((adAcc: number, ad: any) => adAcc + (ad.price || 0), 0);
      return acc + itemTotal + addonsTotal;
    }, 0);
    const discount = editingOrder.discountAmount || 0;
    const taxable = Math.max(0, itemsSubtotal - discount);
    const tax = editingOrder.taxAmount !== undefined && editingOrder.taxAmount !== null
      ? editingOrder.taxAmount
      : Math.round(taxable * 0.0825 * 100) / 100;
    const fee = Math.max(0, parseFloat(editFee.toString()) || 0);
    return Math.round((taxable + tax + fee) * 100) / 100;
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 font-bold animate-pulse flex flex-col items-center justify-center gap-3">
        <RefreshCw className="animate-spin text-[#FF97A4]" size={28} />
        <span>Cargando Módulo de Despacho & Facturación A4...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#12131A] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-pink-50 dark:bg-pink-950/60 text-[#FF97A4] rounded-2xl border border-pink-100 dark:border-pink-900/50">
            <Package size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1C1C] dark:text-white flex items-center gap-2">
              Gestor de Órdenes & Facturas A4
            </h1>
            <p className="text-xs text-gray-400">Modifica costos de envío y millas manualmente para aprobación del cliente e imprime facturas A4</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={loadOrders}
            className="p-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl transition-colors"
            title="Recargar Pedidos"
          >
            <RefreshCw size={16} />
          </button>

          <Link
            href="/admin"
            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-2xl font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Volver al Admin
          </Link>
        </div>
      </div>

      {/* Buscador, Selector de Ordenamiento y Filtros de Estado */}
      <div className="flex flex-col lg:flex-row gap-3 bg-white dark:bg-[#12131A] p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        
        {/* Buscador Multicriterio */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por ID, Cliente, Teléfono, Correo o Dirección..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-2xl text-xs font-medium dark:bg-gray-900 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
          />
        </div>

        {/* Selector de Criterio de Ordenamiento */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
            <ArrowUpDown size={14} className="text-[#FF97A4]" /> Ordenar:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-3 py-2 text-xs font-bold text-[#1A1C1C] dark:text-white focus:ring-2 focus:ring-[#FF97A4] focus:outline-none"
          >
            <option value="date-desc">📅 Fecha (Más recientes primero)</option>
            <option value="date-asc">⏳ Fecha (Más antiguas primero)</option>
            <option value="price-desc">💰 Precio Total (Mayor a menor)</option>
            <option value="price-asc">💵 Precio Total (Menor a mayor)</option>
            <option value="items-desc">📦 Cantidad Productos (Mayor a menor)</option>
            <option value="distance-desc">📍 Distancia (Mayor a menor millas)</option>
          </select>
        </div>

        {/* Pestañas de Estado */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              selectedFilter === "all" ? "bg-white dark:bg-gray-900 text-[#FF97A4] shadow-sm" : "text-gray-500"
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setSelectedFilter("espera")}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              selectedFilter === "espera" ? "bg-white dark:bg-gray-900 text-[#FF97A4] shadow-sm" : "text-gray-500"
            }`}
          >
            En Preparación
          </button>
          <button
            onClick={() => setSelectedFilter("camino")}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              selectedFilter === "camino" ? "bg-white dark:bg-gray-900 text-[#FF97A4] shadow-sm" : "text-gray-500"
            }`}
          >
            En Camino / Listo
          </button>
          <button
            onClick={() => setSelectedFilter("entregado")}
            className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
              selectedFilter === "entregado" ? "bg-white dark:bg-gray-900 text-[#FF97A4] shadow-sm" : "text-gray-500"
            }`}
          >
            Entregados
          </button>
        </div>
      </div>

      {/* Lista de Órdenes */}
      <div className="space-y-4">
        {sortedOrders.length > 0 ? (
          sortedOrders.map((order) => {
            const isPickup = (order.deliveryMethod || "").toLowerCase().includes("pickup") || (order.deliveryMethod || "").toLowerCase().includes("retiro");
            const hasCustomDeliveryFee = (order.deliveryFee || 0) > 0;

            return (
              <div
                key={order._id || order.orderId}
                className="bg-white dark:bg-[#12131A] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 transition-all hover:border-[#FF97A4]/50 dark:hover:border-gray-700"
              >
                {/* Fila 1: Datos Principales */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b pb-4 border-gray-100 dark:border-gray-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/admin/ordenes/${order.orderId}`}
                        className="font-mono font-bold text-sm text-[#1A1C1C] dark:text-white hover:text-[#FF97A4] transition-colors underline"
                      >
                        {order.orderId}
                      </Link>
                      <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(order.createdAt).toLocaleString("es-MX", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {isPickup ? (
                        <span className="bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md text-[10px] font-bold border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                          <Store size={11} /> Retiro en Tienda
                        </span>
                      ) : hasCustomDeliveryFee ? (
                        <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-md text-[10px] font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          📍 {order.distanceMiles || 0} mi • Envío: +${order.deliveryFee.toFixed(2)} USD
                        </span>
                      ) : (
                        <span className="bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md text-[10px] font-bold border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                          <AlertCircle size={11} /> Envío: Sujeto a revisión
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <User size={13} className="text-[#FF97A4]" />
                        {order.customerName}
                      </span>
                      <span className="text-gray-400 font-mono">{order.customerPhone}</span>
                    </div>
                  </div>

                  {/* Acciones: Editar Factura + Imprimir Factura A4 + Selector de Estado + WhatsApp */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
                    
                    {/* BOTÓN EDITAR FACTURA / MILLAS MANUAL */}
                    <button
                      type="button"
                      onClick={() => openEditInvoice(order)}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-800 px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                      title="Modificar Millas y Costo de Envío Manualmente"
                    >
                      <Edit3 size={14} className="text-amber-600 dark:text-amber-400" />
                      <span>Editar Factura / Millas</span>
                    </button>

                    {/* BOTÓN DIRECTO VER FACTURA / IMPRIMIR A4 */}
                    <Link
                      href={`/admin/ordenes/${order.orderId}`}
                      className="bg-pink-50 dark:bg-pink-950/60 hover:bg-pink-100 dark:hover:bg-pink-900/60 text-[#B0004A] dark:text-pink-300 border border-pink-200 dark:border-pink-800 px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Printer size={14} />
                      <span>Ver Factura A4</span>
                    </Link>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-gray-400">Estado:</span>
                      <select
                        value={order.status || (isPickup ? "En diseño" : "Confirmado")}
                        onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                        disabled={updatingId === order.orderId}
                        className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-1.5 text-xs font-bold text-[#1A1C1C] dark:text-white focus:ring-2 focus:ring-[#FF97A4] focus:outline-none"
                      >
                        <option value="Confirmado">🕒 Confirmado</option>
                        <option value="En diseño">🌸 En diseño floral</option>
                        <option value="En espera de despacho">📦 En espera de despacho</option>
                        <option value="En camino">🚚 En camino a ubicación</option>
                        <option value="Listo para retirar">🏪 Listo para retirar en boutique</option>
                        <option value="Entregado">✅ Entregado exitosamente</option>
                        <option value="Retirado">✅ Retirado por cliente</option>
                      </select>
                    </div>

                    <a
                      href={createWhatsAppApprovalUrl(order)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                      title="Enviar cotización o notificación por WhatsApp"
                    >
                      <MessageCircle size={14} />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Fila 2: Dirección, Dedicatoria y Productos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Dirección / GPS / Tarjeta de Dedicatoria */}
                  <div className="p-3.5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl space-y-2 border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                      <span>{isPickup ? "Método: Retiro en Boutique" : "Dirección de Entrega:"}</span>
                      {order.distanceMiles > 0 ? (
                        <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">{order.distanceMiles} Millas</span>
                      ) : !isPickup ? (
                        <span className="text-amber-700 dark:text-amber-400 font-bold">Millas por definir</span>
                      ) : null}
                    </div>
                    <p className="font-bold text-gray-800 dark:text-gray-200 flex items-start gap-1">
                      {isPickup ? <Store size={14} className="text-purple-500 flex-shrink-0 mt-0.5" /> : <MapPin size={14} className="text-[#FF97A4] flex-shrink-0 mt-0.5" />}
                      <span>{order.address}</span>
                    </p>

                    {order.googleMapsUrl && (
                      <a
                        href={order.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1"
                      >
                        <ExternalLink size={12} />
                        <span>Abrir en Google Maps GPS</span>
                      </a>
                    )}

                    {order.cardMessage && (
                      <div className="bg-pink-50 dark:bg-pink-950/40 p-2.5 rounded-xl border border-pink-200 dark:border-pink-900/50 text-[11px] space-y-0.5 mt-2">
                        <span className="font-extrabold text-[#FF97A4] flex items-center gap-1">
                          <Heart size={12} className="fill-[#FF97A4]" /> Tarjeta de Dedicatoria Impresa:
                        </span>
                        <p className="font-semibold text-gray-800 dark:text-gray-200 italic">
                          "{order.cardMessage}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Arreglos de la Orden con Adicionales y Totales */}
                  <div className="p-3.5 bg-gray-50 dark:bg-gray-900/60 rounded-2xl space-y-2 border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                      <span>Arreglos Florales ({order.items?.length || 0})</span>
                      <div className="text-right">
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs block">Total: ${(order.total || 0).toFixed(2)} USD</span>
                        <span className="text-[9px] text-gray-500 dark:text-gray-400 font-semibold block">
                          Envío: {order.deliveryFee > 0 ? `+$${order.deliveryFee.toFixed(2)}` : isPickup ? "Gratis" : "Por cotizar"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 font-medium text-gray-700 dark:text-gray-300">
                      {(order.items || []).map((item: any, i: number) => (
                        <div key={i} className="space-y-1 border-b border-gray-200/50 dark:border-gray-800/50 pb-2 last:border-b-0 last:pb-0">
                          <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                            <span>• {item.name} (x{item.quantity})</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                          </div>

                          {item.addons && item.addons.length > 0 && (
                            <div className="pl-3 space-y-1 mt-1">
                              {item.addons.map((add: any, idx: number) => (
                                <div key={idx} className="bg-pink-50 dark:bg-pink-950/40 p-2 rounded-xl border border-pink-200 dark:border-pink-900/50 text-[11px]">
                                  <span className="font-extrabold text-[#FF97A4] block">
                                    ✨ {add.name || add.value} {add.price ? `(+$${add.price.toFixed(2)})` : ''}
                                  </span>
                                  {add.customText && (
                                    <div className="mt-1 bg-white dark:bg-gray-900 p-2 rounded-lg border border-pink-200 dark:border-pink-900/50 text-gray-800 dark:text-gray-200 font-semibold flex items-start gap-1">
                                      <MessageSquare size={12} className="text-[#FF97A4] flex-shrink-0 mt-0.5" />
                                      <span>Texto / Impresión: <strong className="text-[#FF97A4]">"{add.customText}"</strong></span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-white dark:bg-[#12131A] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 space-y-2">
            <Package className="mx-auto text-gray-400" size={32} />
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">No se encontraron órdenes registradas.</p>
            <p className="text-xs text-gray-400">Intenta con otro término de búsqueda o cambia los filtros de fecha/estado.</p>
          </div>
        )}
      </div>

      {/* MODAL DE EDICIÓN MANUAL DE FACTURA Y MILLAS */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#12131A] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 space-y-6 relative">
            <button
              onClick={() => setEditingOrder(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="space-y-1">
              <span className="bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 text-[11px] font-black uppercase px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                Edición Manual de Factura
              </span>
              <h2 className="text-xl font-bold text-[#1A1C1C] dark:text-white pt-2">
                Modificar Envío de Orden <span className="font-mono text-[#FF97A4]">{editingOrder.orderId}</span>
              </h2>
              <p className="text-xs text-gray-500">
                Cliente: <strong className="text-gray-800 dark:text-gray-200">{editingOrder.customerName}</strong> • {editingOrder.address}
              </p>
            </div>

            <form onSubmit={handleSaveInvoice} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Campo Millas */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <MapPin size={14} className="text-purple-600" /> Distancia en Millas:
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={editMiles}
                    onChange={(e) => setEditMiles(e.target.value)}
                    placeholder="Ej: 8.5"
                    className="w-full p-3 border rounded-xl font-mono text-sm font-bold dark:bg-gray-900 dark:text-white dark:border-gray-800 focus:ring-2 focus:ring-[#FF97A4] focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-gray-400">Millas calculadas manualmente</span>
                </div>

                {/* Campo Costo de Envío */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <DollarSign size={14} className="text-emerald-600" /> Costo de Envío ($ USD):
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editFee}
                    onChange={(e) => setEditFee(e.target.value)}
                    placeholder="Ej: 20.00"
                    className="w-full p-3 border rounded-xl font-mono text-sm font-bold text-emerald-600 dark:bg-gray-900 dark:border-gray-800 focus:ring-2 focus:ring-[#FF97A4] focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-gray-400">Monto sumado a la factura</span>
                </div>
              </div>

              {/* Recálculo en tiempo real */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2 text-xs">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Subtotal + Sales Tax:</span>
                  <span>${((editingOrder.total || 0) - (editingOrder.deliveryFee || 0)).toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                  <span>Nuevo Costo de Envío:</span>
                  <span>+${(Math.max(0, parseFloat(editFee.toString()) || 0)).toFixed(2)} USD</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-800 pt-2 flex justify-between font-black text-sm text-[#1A1C1C] dark:text-white">
                  <span>Nuevo Total de la Factura:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">${calculateModalTotal().toFixed(2)} USD</span>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  disabled={savingInvoice}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={savingInvoice}
                  className="bg-[#1A1C1C] hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
                >
                  <Save size={15} />
                  {savingInvoice ? "Guardando..." : "Guardar y Actualizar Factura"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
