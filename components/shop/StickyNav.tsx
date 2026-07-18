"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export const StickyNav = () => {
  const [isSticky, setIsSticky] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Auto-scroll animation
    const container = scrollRef.current;
    if (container) {
      let scrollAmount = 0;
      const animate = () => {
        if (container.scrollLeft >= (container.scrollWidth - container.clientWidth)) {
          container.scrollLeft = 0;
        } else {
          container.scrollLeft += 0.5; // Ajusta la velocidad aquí
        }
        requestAnimationFrame(animate);
      };
      const animationId = requestAnimationFrame(animate);
      return () => {
        window.removeEventListener("scroll", handleScroll);
        cancelAnimationFrame(animationId);
      };
    }

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
      <div 
        ref={scrollRef}
        className="container mx-auto px-0 border-x-2 border-[#FF97A4] flex justify-start sm:justify-center overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden font-extrabold text-sm uppercase tracking-widest text-[#1A1C1C]" 
        style={{ fontWeight: 800 }}
      >
        <Link href="/" className="px-8 py-4 border-r-2 border-[#FF97A4] hover:bg-[#FF97A4]/20 transition-colors">Inicio</Link>
        <Link href="/#productos" className="px-8 py-4 border-r-2 border-[#FF97A4] hover:bg-[#FF97A4]/20 transition-colors">Productos</Link>
        <Link href="/nosotros" className="px-8 py-4 border-r-2 border-[#FF97A4] hover:bg-[#FF97A4]/20 transition-colors">Nosotros</Link>
        <Link href="/contacto" className="px-8 py-4 border-r-2 border-[#FF97A4] hover:bg-[#FF97A4]/20 transition-colors">Contacto</Link>
        <Link href="/checkout" className="px-8 py-4 hover:bg-[#FF97A4]/20 transition-colors">Carrito</Link>
      </div>
    </nav>
  );
};
