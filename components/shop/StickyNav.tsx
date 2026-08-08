"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/shop/LanguageSwitcher";
import { ThemeToggle } from "@/components/shop/ThemeToggle";
import { CustomerBiometricModal } from "@/components/auth/CustomerBiometricModal";
import { Fingerprint } from "lucide-react";
import { useTranslations } from "next-intl";

export function StickyNav() {
  const [isSticky, setIsSticky] = useState(false);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("nav");

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
          container.scrollLeft += 0.5;
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
    <>
      <nav
        className={`w-full z-50 transition-all duration-300 border-y-2 border-[#FF97A4] ${
          isSticky
            ? "fixed top-0 bg-white/95 dark:bg-[#181922]/95 backdrop-blur-md shadow-sm"
            : "relative bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div 
            ref={scrollRef}
            className="flex-1 flex justify-start sm:justify-center overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden font-extrabold text-sm uppercase tracking-widest text-[#1A1C1C] dark:text-gray-200" 
            style={{ fontWeight: 800 }}
          >
            <Link href="/" className="px-6 py-4 border-r-2 border-[#FF97A4] hover:bg-[#FF97A4]/20 transition-colors">{t('home')}</Link>
            <Link href="/productos" className="px-6 py-4 border-r-2 border-[#FF97A4] hover:bg-[#FF97A4]/20 transition-colors">{t('catalog')}</Link>
            <Link href="/rastreo" className="px-6 py-4 border-r-2 border-[#FF97A4] hover:bg-[#FF97A4]/20 transition-colors">📦 Rastreo</Link>
            <Link href="/nosotros" className="px-6 py-4 border-r-2 border-[#FF97A4] hover:bg-[#FF97A4]/20 transition-colors">{t('about')}</Link>
            <Link href="/contacto" className="px-6 py-4 border-r-2 border-[#FF97A4] hover:bg-[#FF97A4]/20 transition-colors">{t('contact')}</Link>
            <Link href="/checkout" className="px-6 py-4 hover:bg-[#FF97A4]/20 transition-colors">{t('cart')}</Link>
          </div>

          {/* Botones de Control (Huella / Passkeys, Modo Oscuro e Idioma) */}
          <div className="pl-3 flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsBioModalOpen(true)}
              className="flex items-center gap-1.5 bg-pink-50 dark:bg-pink-950/60 text-[#FF97A4] border border-pink-200 dark:border-pink-900/50 px-3 py-2 rounded-xl text-xs font-extrabold hover:bg-pink-100 dark:hover:bg-pink-900 transition-colors shadow-sm"
              title="Acceso con Huella / Face ID (Passkeys)"
            >
              <Fingerprint size={16} />
              <span className="inline text-[11px]">Huella 👆</span>
            </button>

            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      <CustomerBiometricModal
        isOpen={isBioModalOpen}
        onClose={() => setIsBioModalOpen(false)}
      />
    </>
  );
}
