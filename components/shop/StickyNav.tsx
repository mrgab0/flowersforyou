"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export const StickyNav = () => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Ajusta este valor según la altura de tu logo/hero
      setIsSticky(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`w-full z-50 transition-all duration-300 border-y-2 border-[#FF97A4] ${
        isSticky
          ? "fixed top-0 bg-[#FF97A4]/10 backdrop-blur-md shadow-sm"
          : "relative bg-transparent"
      }`}
    >
      <div className="container mx-auto px-0 border-x-2 border-[#FF97A4] flex justify-center font-extrabold text-sm uppercase tracking-widest text-[#1A1C1C]" style={{ fontWeight: 800 }}>
        <Link href="/" className="px-8 py-4 border-r-2 border-[#FF97A4] hover:bg-[#FF97A4]/20 transition-colors">Inicio</Link>
        <Link href="/#productos" className="px-8 py-4 border-r-2 border-[#FF97A4] hover:bg-[#FF97A4]/20 transition-colors">Productos</Link>
        <Link href="/checkout" className="px-8 py-4 hover:bg-[#FF97A4]/20 transition-colors">Carrito</Link>
      </div>
    </nav>
  );
};
