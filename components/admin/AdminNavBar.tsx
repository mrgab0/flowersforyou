"use client";

import { useState } from "react";
import { LogOut, Settings, Search, BarChart3, Package, Mail, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/shop/ThemeToggle";

interface Props {
  logoutAction: () => Promise<void>;
}

export function AdminNavBar({ logoutAction }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-[#181922] shadow-sm px-4 sm:px-6 py-3.5 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Fila Superior: Logo + Modo Claro/Oscuro + Botón Móvil */}
        <div className="w-full md:w-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/admin" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full border-2 border-[#FF97A4] overflow-hidden flex items-center justify-center bg-pink-50 dark:bg-pink-950/40 shadow-sm group-hover:scale-105 transition-transform">
                <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="font-serif font-black text-lg text-[#1A1C1C] dark:text-white block leading-none group-hover:text-[#FF97A4] transition-colors">
                  Flowers For You
                </span>
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest block mt-0.5">
                  Panel de Administración
                </span>
              </div>
            </a>
            
            {/* Botón de tema claro / oscuro */}
            <div className="ml-2">
              <ThemeToggle />
            </div>
          </div>

          {/* Botón Móvil Hamburguesa / Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-pink-50 dark:hover:bg-pink-950/60 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 transition-all flex items-center gap-1.5 text-xs font-bold"
            aria-label="Abrir o cerrar menú de navegación"
          >
            {isOpen ? <X size={18} className="text-[#FF97A4]" /> : <Menu size={18} />}
            <span>{isOpen ? "Cerrar" : "Menú"}</span>
          </button>
        </div>

        {/* Contenedor de Botones de Navegación: Visible siempre en desktop (md:flex) y colapsable en mobile */}
        <div
          className={`${
            isOpen ? "flex" : "hidden"
          } md:flex flex-wrap items-center gap-2 text-xs font-bold w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-2 duration-200`}
        >
          <a
            href="/admin/ordenes"
            onClick={() => setIsOpen(false)}
            className="px-3.5 py-2 rounded-xl bg-pink-100 dark:bg-pink-950/80 hover:bg-pink-200 dark:hover:bg-pink-900/80 text-[#B0004A] dark:text-pink-300 transition-colors border border-pink-300 dark:border-pink-800/80 flex items-center gap-1.5 font-extrabold shadow-sm"
          >
            <Package size={15} />
            <span>🛍️ Órdenes & Despacho</span>
          </a>
          <a
            href="/admin/productos"
            onClick={() => setIsOpen(false)}
            className="px-3.5 py-2 rounded-xl bg-gray-200/80 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors flex items-center gap-1.5 font-extrabold"
          >
            📦 Productos
          </a>
          <a
            href="/admin/sliders"
            onClick={() => setIsOpen(false)}
            className="px-3.5 py-2 rounded-xl bg-gray-200/80 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors flex items-center gap-1.5 font-extrabold"
          >
            🖼️ Banners
          </a>
          <a
            href="/admin/estadisticas"
            onClick={() => setIsOpen(false)}
            className="px-3.5 py-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 hover:bg-indigo-200 dark:hover:bg-indigo-900/80 text-indigo-950 dark:text-indigo-200 transition-colors border border-indigo-300 dark:border-indigo-800/80 flex items-center gap-1.5 font-extrabold shadow-sm"
          >
            <BarChart3 size={15} className="text-indigo-700 dark:text-indigo-300" />
            <span>📊 Estadísticas & Carritos</span>
          </a>
          <a
            href="/admin/adicionales"
            onClick={() => setIsOpen(false)}
            className="px-3.5 py-2 rounded-xl bg-gray-200/80 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors flex items-center gap-1.5 font-extrabold"
          >
            ✨ Adicionales
          </a>
          <a
            href="/admin/entregas"
            onClick={() => setIsOpen(false)}
            className="px-3.5 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900/80 text-emerald-950 dark:text-emerald-200 transition-colors border border-emerald-300 dark:border-emerald-800/80 flex items-center gap-1.5 font-extrabold"
          >
            🚚 Entregas
          </a>
          <a
            href="/admin/cupones"
            onClick={() => setIsOpen(false)}
            className="px-3.5 py-2 rounded-xl bg-purple-100 dark:bg-purple-950/80 hover:bg-purple-200 dark:hover:bg-purple-900/80 text-purple-950 dark:text-purple-200 transition-colors border border-purple-300 dark:border-purple-800/80 flex items-center gap-1.5 font-extrabold"
          >
            🎟️ Cupones
          </a>
          <a
            href="/admin/pagos"
            onClick={() => setIsOpen(false)}
            className="px-3.5 py-2 rounded-xl bg-blue-100 dark:bg-blue-950/80 hover:bg-blue-200 dark:hover:bg-blue-900/80 text-blue-950 dark:text-blue-200 transition-colors border border-blue-300 dark:border-blue-800/80 flex items-center gap-1.5 font-extrabold"
          >
            💳 Cuentas de Pago
          </a>
          <a
            href="/admin/seo"
            onClick={() => setIsOpen(false)}
            className="px-3.5 py-2 rounded-xl bg-teal-100 dark:bg-teal-950/80 hover:bg-teal-200 dark:hover:bg-teal-900/80 text-teal-950 dark:text-teal-200 transition-colors border border-teal-300 dark:border-teal-800/80 flex items-center gap-1.5 font-extrabold shadow-sm"
          >
            <Search size={15} className="text-teal-700 dark:text-teal-300" />
            <span>🔍 Optimización SEO</span>
          </a>
          <a
            href="/admin/correos"
            onClick={() => setIsOpen(false)}
            className="px-3.5 py-2 rounded-xl bg-pink-50 dark:bg-pink-950/40 hover:bg-pink-100 dark:hover:bg-pink-900/60 text-[#B0004A] dark:text-pink-300 transition-colors border border-pink-300 dark:border-pink-800/80 flex items-center gap-1.5 font-extrabold shadow-sm"
          >
            <Mail size={15} />
            <span>✉️ Correos & Inbox</span>
          </a>
          <a
            href="/admin/configuracion"
            onClick={() => setIsOpen(false)}
            className="px-3.5 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 hover:bg-amber-200 dark:hover:bg-amber-900/80 text-amber-950 dark:text-amber-200 transition-colors border border-amber-300 dark:border-amber-800/80 flex items-center gap-1.5 font-extrabold shadow-sm"
          >
            <Settings size={15} className="text-amber-700 dark:text-amber-300 animate-spin-slow" />
            <span>⚙️ Configuración</span>
          </a>

          <div className="h-5 w-px bg-gray-300 dark:bg-gray-700 mx-1 hidden md:block"></div>

          <a
            href="/"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-pink-100 dark:bg-pink-950/80 hover:bg-pink-200 dark:hover:bg-pink-900/80 text-[#B0004A] dark:text-pink-300 transition-colors border border-pink-300 dark:border-pink-800/80 flex items-center gap-1.5 font-extrabold"
          >
            👁️ Ver Tienda
          </a>

          {/* Formulario de Cierre de Sesión */}
          <form action={logoutAction}>
            <button
              type="submit"
              className="bg-[#1A1C1C] dark:bg-gray-800 text-white hover:bg-red-600 dark:hover:bg-red-600 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ml-1"
            >
              <LogOut size={14} />
              <span>Salir</span>
            </button>
          </form>
        </div>

      </div>
    </nav>
  );
}
