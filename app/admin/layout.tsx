import AdminLoginPage from "./login/page";
import { verifyAdminSession, logoutAdminAction } from "@/lib/adminAuth";
import { LogOut } from "lucide-react";

export const runtime = 'nodejs';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await verifyAdminSession();

  // Si NO está autenticado, protege estrictamente todas las páginas de /admin y muestra el Login
  if (!isAuthenticated) {
    return <AdminLoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <nav className="bg-white/95 backdrop-blur-md shadow-sm px-6 py-3.5 border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <a href="/admin" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full border-2 border-[#FF97A4] overflow-hidden flex items-center justify-center bg-pink-50 shadow-sm group-hover:scale-105 transition-transform">
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-serif font-black text-lg text-[#1A1C1C] block leading-none group-hover:text-[#FF97A4] transition-colors">
                  Flowers For You
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mt-0.5">
                  Panel de Administración
                </span>
              </div>
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <a href="/admin/productos" className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex items-center gap-1.5">
              📦 Productos
            </a>
            <a href="/admin/sliders" className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex items-center gap-1.5">
              🖼️ Banners
            </a>
            <a href="/admin/adicionales" className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex items-center gap-1.5">
              ✨ Adicionales
            </a>
            <a href="/admin/entregas" className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors border border-emerald-200/60 flex items-center gap-1.5">
              🚚 Entregas
            </a>
            <a href="/admin/cupones" className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 transition-colors border border-purple-200/60 flex items-center gap-1.5">
              🎟️ Cupones
            </a>
            <a href="/admin/pagos" className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 transition-colors border border-blue-200/60 flex items-center gap-1.5">
              💳 Cuentas de Pago
            </a>

            <div className="h-5 w-px bg-gray-200 mx-1 hidden sm:block"></div>

            <a href="/" target="_blank" className="px-3.5 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-[#FF97A4] transition-colors border border-pink-200/60 flex items-center gap-1.5">
              👁️ Ver Tienda
            </a>

            {/* Formulario de Cierre de Sesión */}
            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="bg-[#1A1C1C] text-white hover:bg-red-600 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ml-1"
              >
                <LogOut size={14} />
                <span>Salir</span>
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-6 flex-1">{children}</main>
    </div>
  );
}
