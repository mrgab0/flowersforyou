"use client";

import { useState, useEffect } from "react";
import { Fingerprint, ShieldCheck, CheckCircle2, AlertCircle, X, Lock } from "lucide-react";
import { useTranslations } from "next-intl";

interface BiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (customerData: any) => void;
}

export function CustomerBiometricModal({ isOpen, onClose, onSuccess }: BiometricModalProps) {
  const t = useTranslations("Biometric");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const savedEmail = localStorage.getItem("customerEmail") || "";
      if (savedEmail) setEmail(savedEmail);
      setMessage(null);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBiometricScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setMessage({ type: "error", text: t("enterEmailError") });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: t("scanning") });

    // Vibración haptic sutil en dispositivos móviles que lo soporten
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate([30, 50, 30]);
      } catch (err) {
        // Ignorar si el navegador bloquea la vibración
      }
    }

    // Simulación ultrasuave y rápida del sensor biométrico del teléfono (1 segundo)
    setTimeout(() => {
      setLoading(false);
      setMessage({ type: "success", text: t("success") });

      localStorage.setItem("customerEmail", cleanEmail);
      localStorage.setItem("biometric_authenticated", "true");

      setTimeout(() => {
        if (onSuccess) {
          onSuccess({
            email: cleanEmail,
            name: localStorage.getItem("customerName") || "",
            phone: localStorage.getItem("customerPhone") || "",
            address: localStorage.getItem("customerAddress") || ""
          });
        }
        onClose();
      }, 700);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#12131A] w-full max-w-md p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl space-y-6 relative">
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Icono Principal de Huella Dactilar */}
        <div className="text-center space-y-3">
          <div className="relative w-20 h-20 mx-auto bg-gradient-to-tr from-pink-500 to-[#FF97A4] text-white rounded-full flex items-center justify-center shadow-lg shadow-pink-500/30">
            <Fingerprint size={44} className={loading ? "animate-ping" : "animate-pulse"} />
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white dark:border-[#12131A]">
              <Lock size={12} />
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-serif font-black text-[#1A1C1C] dark:text-white flex items-center justify-center gap-2">
              {t("title")}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t("subtitle")}
            </p>
          </div>
        </div>

        {/* Mensaje de Estado */}
        {message && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 border ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                : message.type === "error"
                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300"
                : "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* Formulario con Único Campo de Correo y Botón de Huella */}
        <form onSubmit={handleBiometricScan} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600 dark:text-gray-300">
              {t("emailLabel")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              className="w-full p-3.5 border rounded-2xl text-sm font-medium dark:bg-gray-900 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
              required
            />
          </div>

          {/* Único Botón Principal: Escanear Huella e Ingresar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF97A4] hover:bg-[#B0004A] text-white py-3.5 rounded-2xl font-extrabold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
          >
            <Fingerprint size={20} />
            <span>{loading ? t("scanning") : t("scanButton")}</span>
          </button>
        </form>

        {/* Pie de modal */}
        <div className="pt-2 text-center border-t border-gray-100 dark:border-gray-800">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
            <ShieldCheck size={12} className="text-emerald-500" /> {t("footerNote")}
          </span>
        </div>
      </div>
    </div>
  );
}
