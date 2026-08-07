"use client";

import { useState, useEffect } from "react";
import { startRegistration, startAuthentication, browserSupportsWebAuthn } from "@simplewebauthn/browser";
import {
  generatePasskeyRegistrationOptionsAction,
  verifyPasskeyRegistrationAction,
  generatePasskeyAuthenticationOptionsAction,
  verifyPasskeyAuthenticationAction
} from "@/lib/actions/customerAuth";
import { Fingerprint, ShieldCheck, Sparkles, CheckCircle2, AlertCircle, X, Lock } from "lucide-react";

interface BiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (customerData: any) => void;
}

export function CustomerBiometricModal({ isOpen, onClose, onSuccess }: BiometricModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setIsSupported(browserSupportsWebAuthn());
    const saved = localStorage.getItem("customerEmail") || "";
    if (saved) setEmail(saved);
  }, []);

  if (!isOpen) return null;

  // 1. Iniciar Sesión con Huella / Face ID Existente
  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage({ type: "error", text: "Ingresa tu correo electrónico." });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: "Coloca tu huella o escanea Face ID en tu dispositivo..." });

    try {
      const resOptions = await generatePasskeyAuthenticationOptionsAction(email.trim());

      if (!resOptions.success) {
        if (resOptions.needRegistration) {
          setMessage({
            type: "info",
            text: "No tienes una huella registrada aún. Presiona 'Registrar Mi Huella' para configurarla."
          });
        } else {
          setMessage({ type: "error", text: resOptions.error || "Error al preparar huella." });
        }
        setLoading(false);
        return;
      }

      // Invoca el diálogo nativo de iOS FaceID/TouchID o Android Fingerprint
      const authResp = await startAuthentication(resOptions.options as any);

      const verifyRes = await verifyPasskeyAuthenticationAction(email.trim(), authResp);
      setLoading(false);

      if (verifyRes.success && verifyRes.customer) {
        setMessage({ type: "success", text: "¡Huella verificada con éxito! Bienvenido de nuevo." });
        
        // Guardar sesión rápida en el navegador
        localStorage.setItem("customerEmail", verifyRes.customer.email);
        if (verifyRes.customer.name) localStorage.setItem("customerName", verifyRes.customer.name);
        if (verifyRes.customer.phone) localStorage.setItem("customerPhone", verifyRes.customer.phone);

        setTimeout(() => {
          if (onSuccess) onSuccess(verifyRes.customer);
          onClose();
        }, 1200);
      } else {
        setMessage({ type: "error", text: verifyRes.error || "Fallo al validar la huella." });
      }
    } catch (err: any) {
      setLoading(false);
      if (err.name === "NotAllowedError") {
        setMessage({ type: "error", text: "Operación de huella cancelada por el usuario." });
      } else {
        setMessage({ type: "error", text: "Error en el sensor biométrico de tu navegador." });
      }
    }
  };

  // 2. Registrar Huella / Face ID por Primera Vez
  const handleRegister = async () => {
    if (!email.trim()) {
      setMessage({ type: "error", text: "Ingresa tu correo electrónico para registrar tu huella." });
      return;
    }

    setLoading(true);
    setMessage({ type: "info", text: "Activando sensor biométrico... Toca el lector de huella o mira a Face ID." });

    try {
      const resOptions = await generatePasskeyRegistrationOptionsAction(email.trim());

      if (!resOptions.success || !resOptions.options) {
        setMessage({ type: "error", text: resOptions.error || "No se pudo iniciar el registro." });
        setLoading(false);
        return;
      }

      // Invoca el registro biométrico nativo
      const regResp = await startRegistration(resOptions.options as any);

      const verifyRes = await verifyPasskeyRegistrationAction(email.trim(), regResp);
      setLoading(false);

      if (verifyRes.success && verifyRes.customer) {
        setMessage({ type: "success", text: "¡Huella / Face ID registrada correctamente! Ahora puedes ingresar en 1 segundo." });
        localStorage.setItem("customerEmail", verifyRes.customer.email);

        setTimeout(() => {
          if (onSuccess) onSuccess(verifyRes.customer);
          onClose();
        }, 1500);
      } else {
        setMessage({ type: "error", text: verifyRes.error || "No se pudo registrar la huella." });
      }
    } catch (err: any) {
      setLoading(false);
      if (err.name === "NotAllowedError") {
        setMessage({ type: "error", text: "Registro biométrico cancelado." });
      } else {
        setMessage({ type: "error", text: "El navegador no pudo completar la biometría." });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#12131A] w-full max-w-md p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Icono Principal de Huella Dactilar */}
        <div className="text-center space-y-3">
          <div className="relative w-20 h-20 mx-auto bg-gradient-to-tr from-pink-500 to-[#FF97A4] text-white rounded-full flex items-center justify-center shadow-lg shadow-pink-500/30">
            <Fingerprint size={42} className="animate-pulse" />
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white dark:border-[#12131A]">
              <Lock size={12} />
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-serif font-black text-[#1A1C1C] dark:text-white flex items-center justify-center gap-2">
              Acceso con Huella / Face ID
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Ingreso ultra-rápido sin recordar contraseñas en iOS, Android y Navegadores
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
                : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{message.text}</span>
          </div>
        )}

        {!isSupported ? (
          <div className="p-4 bg-amber-50 text-amber-800 text-xs font-bold rounded-2xl border border-amber-200 text-center">
            Tu navegador actual no soporta autenticación por Passkeys. Usa Chrome, Safari o Brave en tu celular.
          </div>
        ) : (
          <form onSubmit={handleAuthenticate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">
                Tu Correo Electrónico:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="w-full p-3.5 border rounded-2xl text-sm font-medium dark:bg-gray-900 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                required
              />
            </div>

            {/* Botón Principal: Entrar con Huella */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF97A4] hover:bg-[#B0004A] text-white py-3.5 rounded-2xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:bg-gray-300"
            >
              <Fingerprint size={20} />
              <span>{loading ? "Verificando Huella..." : "Ingresar con Huella / Face ID"}</span>
            </button>

            {/* Botón Secundario: Registrar Huella por primera vez */}
            <button
              type="button"
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles size={14} className="text-[#FF97A4]" />
              <span>Registrar Mi Huella por Primera Vez</span>
            </button>
          </form>
        )}

        <div className="pt-2 text-center border-t border-gray-100 dark:border-gray-800">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
            <ShieldCheck size={12} className="text-emerald-500" /> Tecnología WebAuthn & Passkeys Encripada
          </span>
        </div>
      </div>
    </div>
  );
}
