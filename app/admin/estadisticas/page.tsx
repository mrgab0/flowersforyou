"use client";

import { useEffect, useState } from "react";
import { getAnalyticsSummaryAction } from "@/lib/actions/analytics";
import { BarChart3, TrendingUp, ShoppingCart, ArrowLeft, RefreshCw, Globe, MessageCircle, Calendar, DollarSign, Eye, User, Sparkles } from "lucide-react";
import Link from "next/link";

export default function AdminEstadisticasPage() {
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, [days]);

  async function loadData() {
    setLoading(true);
    const res = await getAnalyticsSummaryAction(days);
    if (res.success && res.data) {
      setData(res.data);
    }
    setLoading(false);
  }

  // Generar mensaje personalizado para recuperar el carrito por WhatsApp para Flowers For You
  const createWhatsAppRecoveryUrl = (cart: any) => {
    const phone = cart.customerPhone ? cart.customerPhone.replace(/\D/g, "") : "";
    const itemsText = (cart.cartItems || [])
      .map((item: any) => `• ${item.name} ($${item.price})`)
      .join("\n");
    const productName = cart.productName || (cart.cartItems && cart.cartItems[0] ? cart.cartItems[0].name : "tu arreglo floral");

    const message = encodeURIComponent(
      `¡Hola ${cart.customerName || ""}! 🌸 Notamos que guardaste ${productName} en tu carrito de Flowers For You.\n\n${itemsText ? `Tus arreglos:\n${itemsText}\n\n` : ""}¿Te gustaría completar tu pedido hoy? Estamos listos para confeccionarlo con flores frescas de máxima calidad. ✨`
    );

    return phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/?text=${message}`;
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-stone-500 font-bold animate-pulse flex flex-col items-center justify-center gap-3">
        <RefreshCw className="animate-spin text-[#D81B60]" size={28} />
        <span>Cargando Estadísticas y Carritos Abandonados...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-pink-50 text-[#D81B60] rounded-2xl border border-pink-100">
            <BarChart3 size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
              Panel de Analítica & Carritos Abandonados
            </h1>
            <p className="text-xs text-stone-500">Métricas de tráfico, visitantes y recuperador directo de ventas</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Selector de Rango de Fechas */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setDays(1)}
              className={`px-3 py-1.5 rounded-xl transition ${
                days === 1 ? "bg-white text-[#D81B60] shadow-xs" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setDays(7)}
              className={`px-3 py-1.5 rounded-xl transition ${
                days === 7 ? "bg-white text-[#D81B60] shadow-xs" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              7 Días
            </button>
            <button
              onClick={() => setDays(30)}
              className={`px-3 py-1.5 rounded-xl transition ${
                days === 30 ? "bg-white text-[#D81B60] shadow-xs" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              30 Días
            </button>
          </div>

          <Link
            href="/admin"
            className="bg-stone-100 text-stone-700 px-4 py-2 rounded-2xl font-bold text-xs hover:bg-stone-200 transition flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Volver
          </Link>
        </div>
      </div>

      {/* 4 Tarjetas de Métricas KPI Clave */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Visitas Totales */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Visitas a la Tienda</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Globe size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-stone-900">
            {data?.totalVisits || 0}
          </div>
          <p className="text-[11px] text-stone-400 font-medium">Impresiones en el período</p>
        </div>

        {/* KPI 2: Vistas de Productos */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Interés en Catálogo</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Eye size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-stone-900">
            {data?.totalProductViews || 0}
          </div>
          <p className="text-[11px] text-stone-400 font-medium">Clicks en detalles de flores</p>
        </div>

        {/* KPI 3: Carritos Abandonados */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Carritos Abandonados</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <ShoppingCart size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600">
            {data?.abandonedCount || 0}
          </div>
          <p className="text-[11px] text-amber-700/80 font-medium">Oportunidades de recuperación</p>
        </div>

        {/* KPI 4: Valor Recuperable Estimado */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-xs font-bold uppercase tracking-wider">Valor Recuperable</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">
            ${(data?.totalAbandonedValue || 0).toFixed(2)}
          </div>
          <p className="text-[11px] text-emerald-700/80 font-medium">Total en carritos pendientes</p>
        </div>
      </div>

      {/* SECCIÓN PRINCIPAL: Módulo de Recuperación de Carritos Abandonados */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4 border-stone-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <MessageCircle size={22} />
            </div>
            <div>
              <h2 className="font-bold text-base text-stone-900 flex items-center gap-2">
                Recuperador de Carritos por WhatsApp
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  1-Click Directo
                </span>
              </h2>
              <p className="text-xs text-stone-500">Contacta inmediatamente a clientes que no finalizaron su pedido</p>
            </div>
          </div>
        </div>

        {data?.abandonedCarts && data.abandonedCarts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Cliente / Contacto</th>
                  <th className="py-3 px-4">Productos Interesados</th>
                  <th className="py-3 px-4 text-right">Monto Estimado</th>
                  <th className="py-3 px-4 text-center">Acción de Recuperación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {data.abandonedCarts.map((cart: any, index: number) => {
                  const items = cart.cartItems || [];
                  const mainName = cart.productName || (items[0] ? items[0].name : "Arreglo Floral");
                  const itemPrice = items.reduce((sum: number, i: any) => sum + (i.price || 0), 0) || cart.price || 0;

                  return (
                    <tr key={cart._id || index} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-4 px-4 text-stone-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-stone-400" />
                          <span>{new Date(cart.createdAt).toLocaleString("es-MX", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center font-bold">
                            <User size={13} />
                          </div>
                          <div>
                            <span className="font-bold text-stone-900 block">
                              {cart.customerName || "Cliente Interesado"}
                            </span>
                            <span className="text-[11px] text-stone-400 font-mono">
                              {cart.customerPhone || "Sin teléfono registrado"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <span className="font-bold text-[#D81B60] block">{mainName}</span>
                          {items.length > 1 && (
                            <span className="text-[10px] text-stone-400 font-medium block">
                              + {items.length - 1} adicional(es) en carrito
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right font-extrabold text-stone-800">
                        ${itemPrice.toFixed(2)}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <a
                          href={createWhatsAppRecoveryUrl(cart)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition"
                        >
                          <MessageCircle size={14} />
                          <span>Recuperar por WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 space-y-2">
            <Sparkles className="mx-auto text-emerald-500" size={24} />
            <p className="text-xs font-bold text-stone-700">¡Excelente! No hay carritos abandonados en este período.</p>
            <p className="text-[11px] text-stone-400">Todos los clientes interesados han completado sus pedidos correctamente.</p>
          </div>
        )}
      </div>

      {/* SECCIÓN SECUNDARIA: Fuentes de Tráfico & Productos Más Vistos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuentes de Tráfico */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b pb-3 border-stone-100">
            <Globe size={18} className="text-[#D81B60]" />
            <h2 className="font-bold text-sm text-stone-900">Origen de los Visitantes</h2>
          </div>

          <div className="space-y-3">
            {(data?.trafficSources || []).map((source: any, idx: number) => {
              const total = data?.totalVisits || 1;
              const percentage = Math.round((source.count / total) * 100);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="capitalize text-stone-700">{source.source}</span>
                    <span className="text-stone-400">{source.count} visitas ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#D81B60] h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Productos Más Vistos */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b pb-3 border-stone-100">
            <TrendingUp size={18} className="text-purple-600" />
            <h2 className="font-bold text-sm text-stone-900">Top 5 Flores Más Consultadas</h2>
          </div>

          <div className="space-y-3">
            {(data?.topProducts || []).map((prod: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-extrabold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-xs text-stone-900">{prod.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-stone-400 font-medium">{prod.views} vistas</span>
                  <span className="font-extrabold text-[#D81B60]">${prod.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
