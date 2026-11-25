import Link from "next/link";
import {
  Package,
  Flower2,
  Layers,
  QrCode,
  Trash2,
  BarChart3,
  Sliders,
  Upload,
  Printer,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { LoginButton } from "@/components/LoginButton";

export default function AdminPage() {
  const adminModules = [
    {
      title: "Órdenes & Facturación POS",
      desc: "Gestión de pedidos, cambio de estados e impresión dual (Matriz 80mm y Factura A4).",
      href: "/admin/ordenes",
      icon: Package,
      badge: "Prioridad",
      color: "from-pink-500 to-rose-600",
    },
    {
      title: "Catálogo de Productos",
      desc: "Crear, editar, activar arreglos florales, configurar variantes y flores.",
      href: "/admin/productos",
      icon: Flower2,
      color: "from-stone-800 to-stone-900",
    },
    {
      title: "Carga Masiva de Productos",
      desc: "Publicación rápida por lotes de arreglos florales con asignación de precios y categorías.",
      href: "/admin/productos/carga-en-masa",
      icon: Upload,
      badge: "Rápido",
      color: "from-pink-600 to-fuchsia-600",
    },
    {
      title: "Gestión de Adicionales",
      desc: "Chocolates, peluches, globos con helio, coronas y dedicatorias.",
      href: "/admin/adicionales",
      icon: Layers,
      color: "from-stone-700 to-stone-800",
    },
    {
      title: "Carga Masiva de Adicionales",
      desc: "Importar y categorizar múltiples complementos en un solo paso.",
      href: "/admin/adicionales/carga-en-masa",
      icon: Upload,
      color: "from-rose-500 to-pink-600",
    },
    {
      title: "Códigos QR Dinámicos",
      desc: "Generar códigos QR para tarjetas físicas, dedicatorias o enlaces con métricas.",
      href: "/admin/QR",
      icon: QrCode,
      color: "from-purple-600 to-indigo-600",
    },
    {
      title: "Estadísticas & Leads",
      desc: "Carritos abandonados, capturas de correo y analítica de tráfico.",
      href: "/admin/estadisticas",
      icon: BarChart3,
      color: "from-emerald-600 to-teal-600",
    },
    {
      title: "Papelera de Reciclaje",
      desc: "Recuperación de productos o adicionales eliminados (Soft Delete).",
      href: "/admin/papelera",
      icon: Trash2,
      color: "from-amber-600 to-orange-600",
    },
    {
      title: "Banners & Promociones",
      desc: "Gestión del carrusel principal y promociones de temporada.",
      href: "/admin/sliders",
      icon: Sliders,
      color: "from-stone-600 to-stone-700",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Bienvenida */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-pink-50 text-[#D81B60] border border-pink-200 mb-2">
            <Sparkles size={13} /> Flowers For You • Sistema CMS
          </span>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Panel de Administración</h1>
          <p className="text-sm text-stone-500 mt-1">
            Control integral de catálogo, pedidos para taller, impresión térmica/matriz y analítica.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-2xl transition"
          >
            <ExternalLink size={15} />
            <span>Ver Tienda</span>
          </Link>
          <LoginButton />
        </div>
      </div>

      {/* Grid de Módulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {adminModules.map((mod, idx) => {
          const Icon = mod.icon;
          return (
            <Link
              key={idx}
              href={mod.href}
              className="group bg-white p-6 rounded-3xl border border-stone-200 hover:border-[#D81B60] shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl text-white bg-gradient-to-br ${mod.color} shadow-sm group-hover:scale-105 transition-transform`}>
                    <Icon size={22} />
                  </div>
                  {mod.badge && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-pink-50 text-[#D81B60] border border-pink-200">
                      {mod.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-black text-base text-stone-900 group-hover:text-[#D81B60] transition-colors">
                  {mod.title}
                </h3>
                <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                  {mod.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-stone-400 group-hover:text-[#D81B60] transition-colors">
                <span>Acceder al módulo</span>
                <span>→</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
