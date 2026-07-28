"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, ArrowLeft, Flower2 } from "lucide-react";
import { useCart } from "@/components/shop/Cart/CartContext";
import { ShoppingCartComponent } from "@/components/shop/Cart/ShoppingCart";

export const ShopHeader = () => {
  const { cartItems } = useCart();
  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo Presionable hacia el Home */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-200 shadow-sm group-hover:scale-105 transition-transform flex-shrink-0 bg-white">
              <img src="/logo.jpg" alt="Flowers For You Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="text-xl font-serif font-black text-[#1A1C1C] tracking-tight group-hover:text-[#FF97A4] transition-colors block">
                Flowers <span className="text-[#FF97A4]">For You</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold block -mt-1">
                Boutique Floral
              </span>
            </div>
          </Link>

          {/* Navegación Central */}
          <nav className="hidden md:flex items-center gap-8 font-bold text-xs uppercase tracking-widest text-gray-600">
            <Link href="/" className="hover:text-[#FF97A4] transition-colors">
              Inicio
            </Link>
            <Link href="/#productos" className="hover:text-[#FF97A4] transition-colors">
              Colección
            </Link>
            <Link href="/nosotros" className="hover:text-[#FF97A4] transition-colors">
              Nosotros
            </Link>
            <Link href="/contacto" className="hover:text-[#FF97A4] transition-colors">
              Contacto
            </Link>
          </nav>

          {/* Acciones Derecha (Carrito de Compras) */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-black px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={16} /> Volver a la Tienda
            </Link>

            {/* Cart Button indicator */}
            <div className="relative">
              <Link
                href="/checkout"
                className="flex items-center gap-2 bg-[#FF97A4] text-white px-5 py-2.5 rounded-full font-bold text-xs hover:bg-[#B0004A] transition-all shadow-md shadow-[#FF97A4]/20"
              >
                <ShoppingCart size={18} />
                <span className="hidden sm:inline">Carrito</span>
                {totalCount > 0 && (
                  <span className="bg-[#1A1C1C] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {totalCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
