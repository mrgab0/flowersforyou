"use client";

import { useEffect, useState } from "react";
import { getAllOrdersAction, updateOrderStatusAction, updateOrderAction } from "@/lib/actions/order";
import {
  Package, Truck, CheckCircle2, Clock, MapPin, User, MessageCircle, RefreshCw,
  ArrowLeft, Search, Filter, Store, ExternalLink, Calendar, MessageSquare, Heart,
  Edit3, Printer, Lock, X, Save, DollarSign, Globe, Plus, Trash2, ShieldCheck, FileText,
  Receipt, ArrowUpDown, Download, Sparkles, Terminal
} from "lucide-react";
import Link from "next/link";
import {
  printTicket80mmDirect,
  printInvoiceA4Direct,
  isAutoPrintEnabled,
  setAutoPrintEnabled,
  getPosTestOrder,
} from "@/lib/posPrinterClient";

export default function AdminOrdenesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros y Búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "price-desc" | "price-asc">("newest");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "7days">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Estados para Impresión POS (Star Micronics / Matriz de Punto 80mm & Factura A4)
  const [autoPrintJs, setAutoPrintJs] = useState(true);
  const [printingOrderId, setPrintingOrderId] = useState<string | null>(null);

  // Modal para detalle o factura
  const [invoiceOrder, setInvoiceOrder] = useState<any | null>(null);
  const [invoiceLang, setInvoiceLang] = useState<"es" | "en">("es");
  const [invoiceFormat, setInvoiceFormat] = useState<"a4" | "ticket80">("ticket80");

  useEffect(() => {
    setAutoPrintJs(isAutoPrintEnabled());
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

  const toggleAutoPrintJs = () => {
    const nextVal = !autoPrintJs;
    setAutoPrintJs(nextVal);
    setAutoPrintEnabled(nextVal);
  };

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

  // 1ra Manera de Imprimir: Comanda / Ticket 70-80mm (Matriz de Puntos / Térmica)
  const handleDirectPrint80mm = async (order: any) => {
    setPrintingOrderId(order.orderId);
    try {
      await printTicket80mmDirect(order, invoiceLang);
      setOrders((prev) =>
        prev.map((o) => (o.orderId === order.orderId ? { ...o, isPrintedToPOS: true } : o))
      );
    } finally {
      setPrintingOrderId(null);
    }
  };

  // 2da Manera de Imprimir: Factura Oficial A4 / Carta
  const handleDirectPrintA4 = async (order: any) => {
    setPrintingOrderId(order.orderId);
    try {
      await printInvoiceA4Direct(order, invoiceLang);
    } finally {
      setPrintingOrderId(null);
    }
  };

  const handleTestTicketDirect = async () => {
    setPrintingOrderId("TEST-FFY-80MM");
    try {
      await printTicket80mmDirect(getPosTestOrder(), invoiceLang);
    } finally {
      setPrintingOrderId(null);
    }
  };

  const createWhatsAppNotifyUrl = (order: any) => {
    const phone = (order.customerPhone || "").replace(/\D/g, "");
    const statusText = order.status || "En Proceso";
    const msg = `¡Hola ${order.customerName}! 🌸 Te notificamos de Flowers For You que tu pedido *${order.orderId}* ha sido actualizado a estado: *${statusText}* ✨`;
    return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}` : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  // Filtrado y Ordenamiento
  const processedOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedFilter !== "all") {
        const status = (order.status || "").toLowerCase();
        if (selectedFilter === "espera" && !(status.includes("espera") || status.includes("diseño") || status.includes("confirmado"))) return false;
        if (selectedFilter === "camino" && !(status.includes("camino") || status.includes("listo"))) return false;
        if (selectedFilter === "entregado" && !(status.includes("entregado") || status.includes("retirado") || status.includes("completado"))) return false;
      }

      if (dateFilter !== "all") {
        const orderDate = new Date(order.createdAt);
        const today = new Date();

        if (dateFilter === "today") {
          const isToday =
            orderDate.getDate() === today.getDate() &&
            orderDate.getMonth() === today.getMonth() &&
            orderDate.getFullYear() === today.getFullYear();
          if (!isToday) return false;
        } else if (dateFilter === "7days") {
          const diffTime = Math.abs(today.getTime() - orderDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays > 7) return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "price-desc") {
        return (b.total || 0) - (a.total || 0);
      }
      if (sortBy === "price-asc") {
        return (a.total || 0) - (b.total || 0);
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* Cabecera Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition"
              title="Volver al panel principal"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
              <Package className="text-[#D81B60]" /> Gestión de Órdenes & Facturación
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1 pl-11">
            Control de pedidos, estados de entrega y dos modos de impresión (Ticket Matriz 80mm & Factura A4).
          </p>
        </div>

        {/* Acciones Rápidas de Impresión */}
        <div className="flex flex-wrap items-center gap-2 pl-11 md:pl-0">
          <button
            onClick={handleTestTicketDirect}
            disabled={printingOrderId === "TEST-FFY-80MM"}
            className="flex items-center gap-1.5 px-3 py-2 bg-pink-50 hover:bg-pink-100 text-[#D81B60] text-xs font-bold rounded-xl border border-pink-200 transition"
            title="Prueba de impresión en matriz de puntos / Star 80mm"
          >
            <Printer size={15} />
            <span>Ticket Test 80mm</span>
          </button>

          <button
            onClick={toggleAutoPrintJs}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition ${
              autoPrintJs
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : "bg-stone-50 text-stone-600 border-stone-200"
            }`}
            title="Auto-impresión en navegador"
          >
            <Sparkles size={15} />
            <span>Auto-Print: {autoPrintJs ? "ON" : "OFF"}</span>
          </button>

          <button
            onClick={loadOrders}
            className="p-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl transition"
            title="Refrescar lista"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-200 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Buscar por #ID, cliente o teléfono..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#D81B60]/20 focus:border-[#D81B60]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Filtro por estado */}
          <div className="flex bg-stone-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition ${selectedFilter === "all" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-900"}`}
            >
              Todas ({orders.length})
            </button>
            <button
              onClick={() => setSelectedFilter("espera")}
              className={`px-3 py-1.5 rounded-lg transition ${selectedFilter === "espera" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-900"}`}
            >
              En Diseño
            </button>
            <button
              onClick={() => setSelectedFilter("camino")}
              className={`px-3 py-1.5 rounded-lg transition ${selectedFilter === "camino" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-900"}`}
            >
              En Camino
            </button>
            <button
              onClick={() => setSelectedFilter("entregado")}
              className={`px-3 py-1.5 rounded-lg transition ${selectedFilter === "entregado" ? "bg-white text-stone-900 shadow-xs" : "text-stone-500 hover:text-stone-900"}`}
            >
              Entregado
            </button>
          </div>

          {/* Ordenar */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs font-bold rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-[#D81B60]"
          >
            <option value="newest">Más recientes</option>
            <option value="oldest">Más antiguos</option>
            <option value="price-desc">Mayor valor</option>
            <option value="price-asc">Menor valor</option>
          </select>
        </div>
      </div>

      {/* Listado de Órdenes */}
      {loading ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center">
          <RefreshCw className="animate-spin mx-auto text-[#D81B60] mb-3" size={32} />
          <p className="text-sm font-bold text-stone-600">Cargando órdenes de Flowers For You...</p>
        </div>
      ) : processedOrders.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center">
          <Package className="mx-auto text-stone-300 mb-3" size={48} />
          <p className="text-base font-bold text-stone-800">No se encontraron órdenes</p>
          <p className="text-xs text-stone-500 mt-1">Intenta ajustando los filtros o el buscador.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {processedOrders.map((order) => {
            const isPrinted = order.isPrintedToPOS;
            const items = order.items || [];
            const isUpdating = updatingId === order.orderId;
            const isPrinting = printingOrderId === order.orderId;

            return (
              <div
                key={order.orderId || order._id}
                className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs hover:border-[#D81B60]/40 transition space-y-4"
              >
                {/* Cabecera de la Tarjeta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-base font-black text-stone-900 bg-stone-100 px-3 py-1 rounded-xl">
                      #{order.orderId}
                    </span>
                    <span className="text-xs text-stone-500 flex items-center gap-1">
                      <Calendar size={13} />
                      {new Date(order.createdAt).toLocaleString("es-VE", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                    {isPrinted && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 size={12} /> Impresa POS
                      </span>
                    )}
                  </div>

                  {/* Selector de Estado */}
                  <div className="flex items-center gap-2">
                    <select
                      value={order.status || "En diseño"}
                      disabled={isUpdating}
                      onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                        order.status?.toLowerCase().includes("entregado") || order.status?.toLowerCase().includes("completado")
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : order.status?.toLowerCase().includes("camino")
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-pink-50 text-[#D81B60] border-pink-200"
                      }`}
                    >
                      <option value="En diseño">En diseño / Preparación</option>
                      <option value="Listo para despacho">Listo para despacho</option>
                      <option value="En camino">En camino (Reparto)</option>
                      <option value="Entregado">Entregado ✓</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>

                    <a
                      href={createWhatsAppNotifyUrl(order)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition"
                      title="Notificar cliente por WhatsApp"
                    >
                      <MessageCircle size={16} />
                    </a>
                  </div>
                </div>

                {/* Contenido en 3 Columnas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Columna 1: Cliente y Entrega */}
                  <div className="space-y-1.5 bg-stone-50 p-3.5 rounded-2xl">
                    <p className="font-bold text-stone-900 flex items-center gap-1.5">
                      <User size={14} className="text-[#D81B60]" /> {order.customerName}
                    </p>
                    <p className="text-stone-600">Tel: {order.customerPhone || "N/A"}</p>
                    {order.customerEmail && <p className="text-stone-500">{order.customerEmail}</p>}
                    <div className="pt-1 text-stone-700 flex items-start gap-1">
                      <MapPin size={13} className="text-stone-400 mt-0.5 shrink-0" />
                      <span>{order.address || "Retiro en boutique"}</span>
                    </div>
                  </div>

                  {/* Columna 2: Productos y Dedicatoria */}
                  <div className="space-y-2 bg-stone-50 p-3.5 rounded-2xl">
                    <p className="font-bold text-stone-800">Arreglos ({items.length}):</p>
                    <div className="space-y-1 max-h-28 overflow-y-auto">
                      {items.map((it: any, idx: number) => (
                        <div key={idx} className="text-stone-700">
                          <span className="font-bold">{it.quantity || 1}x</span> {it.name} - ${(it.price || 0).toFixed(2)}
                          {it.addons && it.addons.length > 0 && (
                            <div className="pl-3 text-[11px] text-[#D81B60]">
                              {it.addons.map((a: any, aIdx: number) => (
                                <div key={aIdx}>+ {a.name || a.value}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {order.cardMessage && (
                      <div className="border-t border-stone-200 pt-2 text-[11px] text-stone-600 italic">
                        💌 &quot;{order.cardMessage}&quot;
                      </div>
                    )}
                  </div>

                  {/* Columna 3: Totales y Acciones de Impresión */}
                  <div className="flex flex-col justify-between bg-stone-50 p-3.5 rounded-2xl">
                    <div>
                      <p className="text-stone-500">Total a Cobrar:</p>
                      <p className="text-xl font-black text-stone-900">
                        ${(order.total || 0).toFixed(2)} <span className="text-xs font-normal text-stone-500">USD</span>
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Método: {order.paymentMethod || "Efectivo / Transferencia"}
                      </p>
                    </div>

                    {/* BOTONES OFICIALES DE IMPRESIÓN */}
                    <div className="flex flex-col gap-2 mt-3 pt-2 border-t border-stone-200">
                      {/* Manera 1: Matriz de Punto / Ticket 80mm */}
                      <button
                        onClick={() => handleDirectPrint80mm(order)}
                        disabled={isPrinting}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs transition"
                        title="Imprimir comanda para taller en ticketera térmica o matriz de puntos"
                      >
                        <Printer size={14} className="text-[#D81B60]" />
                        <span>Imprimir Ticket Matriz (80mm)</span>
                      </button>

                      {/* Manera 2: Factura Estándar A4 */}
                      <button
                        onClick={() => handleDirectPrintA4(order)}
                        disabled={isPrinting}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-pink-50 text-[#D81B60] text-xs font-bold rounded-xl border border-pink-200 transition"
                        title="Imprimir o descargar factura formal A4 / Carta"
                      >
                        <FileText size={14} />
                        <span>Factura Oficial (A4 / Carta)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
