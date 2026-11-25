import Link from "next/link";
import { Package, Flower2, Layers, QrCode, Trash2, BarChart3, Sliders, ExternalLink } from "lucide-react";

export const runtime = 'nodejs';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Barra de Navegación del Panel de Administración */}
      <nav className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs">
        <div className="container mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Flowers For You" className="h-9 w-auto rounded-lg object-contain" />
            <div>
              <span className="font-black text-sm text-stone-900 tracking-tight">Flowers For You</span>
              <span className="block text-[10px] text-[#D81B60] font-bold uppercase tracking-wider">CMS Admin</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs font-bold text-stone-600">
            <Link
              href="/admin/ordenes"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-pink-50 hover:text-[#D81B60] transition"
            >
              <Package size={15} />
              <span>Órdenes</span>
            </Link>

            <Link
              href="/admin/productos"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-pink-50 hover:text-[#D81B60] transition"
            >
              <Flower2 size={15} />
              <span>Productos</span>
            </Link>

            <Link
              href="/admin/adicionales"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-pink-50 hover:text-[#D81B60] transition"
            >
              <Layers size={15} />
              <span>Adicionales</span>
            </Link>

            <Link
              href="/admin/QR"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-pink-50 hover:text-[#D81B60] transition"
            >
              <QrCode size={15} />
              <span>QR</span>
            </Link>

            <Link
              href="/admin/papelera"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-pink-50 hover:text-[#D81B60] transition"
            >
              <Trash2 size={15} />
              <span>Papelera</span>
            </Link>

            <Link
              href="/admin/estadisticas"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-pink-50 hover:text-[#D81B60] transition"
            >
              <BarChart3 size={15} />
              <span>Estadísticas</span>
            </Link>

            <Link
              href="/admin/sliders"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-pink-50 hover:text-[#D81B60] transition"
            >
              <Sliders size={15} />
              <span>Sliders</span>
            </Link>

            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 text-stone-800 hover:bg-stone-200 transition ml-1"
              title="Ver Tienda en Vivo"
            >
              <ExternalLink size={13} />
              <span>Tienda</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4 sm:p-6">{children}</main>
    </div>
  );
}
