"use client";

import { useEffect, useState } from "react";
import { Download, X, Smartphone, CheckCircle2, Share } from "lucide-react";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Registrar el Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.log("Service Worker registro opcional:", err);
      });
    }

    // Detectar si es iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIphone = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = ("standalone" in window.navigator) && (window.navigator as any).standalone;

    if (isIphone && !isStandalone) {
      setIsIOS(true);
      // Mostrar sugerencia de iOS tras 4 segundos de navegación
      const timer = setTimeout(() => setShowPrompt(true), 4000);
      return () => clearTimeout(timer);
    }

    // Escuchar el evento antes de la instalación en Android / Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", () => {
      setInstalled(true);
      setShowPrompt(false);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt || installed) return null;

  return (
    <div className="fixed bottom-5 left-5 right-5 md:left-auto md:right-5 md:w-96 z-50 animate-in slide-in-from-bottom duration-500">
      <div className="bg-white dark:bg-[#181922] p-4 rounded-3xl border border-pink-200 dark:border-gray-800 shadow-2xl shadow-pink-500/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FF97A4] to-[#be185d] p-0.5 shadow-md flex items-center justify-center flex-shrink-0">
              <img src="/logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-[14px]" />
            </div>
            <div>
              <h4 className="font-serif font-black text-sm text-[#1A1C1C] dark:text-white leading-snug">
                Flowers For You App
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                Instala nuestra tienda en tu pantalla de inicio
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowPrompt(false)}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        {isIOS ? (
          <div className="p-3 bg-pink-50 dark:bg-pink-950/40 rounded-2xl text-[11px] text-pink-950 dark:text-pink-200 flex items-center gap-2 border border-pink-100 dark:border-pink-900/50">
            <Share size={16} className="text-[#be185d] flex-shrink-0" />
            <span>
              Para instalar en iPhone: Toca <strong>Compartir</strong> en Safari y selecciona <strong>"Agregar a inicio"</strong>.
            </span>
          </div>
        ) : (
          <button
            onClick={handleInstallClick}
            className="w-full bg-gradient-to-r from-[#FF97A4] to-[#be185d] hover:from-[#be185d] hover:to-[#831843] text-white py-2.5 px-4 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Download size={15} />
            <span>Instalar App Gratis</span>
          </button>
        )}
      </div>
    </div>
  );
}
