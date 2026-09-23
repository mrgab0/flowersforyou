"use client";

import { useState, useEffect } from "react";
import { generateCaptchaChallengeAction, verifyCaptchaSolutionAction, CaptchaChallenge } from "@/lib/captcha";
import { ShieldCheck, RefreshCw, CheckCircle2, AlertCircle, Sparkles, Lock } from "lucide-react";

interface CheckoutCaptchaProps {
  isEn?: boolean;
  onVerified: (verificationToken: string, honeypot: string) => void;
  onReset?: () => void;
}

export function CheckoutCaptcha({ isEn = false, onVerified, onReset }: CheckoutCaptchaProps) {
  const [challenge, setChallenge] = useState<CaptchaChallenge | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const t = {
    title: isEn ? "Anti-Bot Security Verification" : "Verificación de Seguridad Anti-Robots",
    subtitle: isEn 
      ? "Please solve this quick check to confirm you are human and protect your order:" 
      : "Resuelve esta rápida operación para confirmar que eres humano y proteger tu pedido:",
    solveQuestion: isEn ? "What is" : "¿Cuánto es",
    placeholder: isEn ? "Answer" : "Respuesta",
    verifyBtn: isEn ? "Verify" : "Verificar",
    verifying: isEn ? "Checking..." : "Verificando...",
    verifiedSuccess: isEn ? "Verified successfully! Human confirmed ✓" : "¡Verificado con éxito! Humano confirmado ✓",
    reloadTooltip: isEn ? "Get a new challenge" : "Generar nuevo desafío",
    errorRequired: isEn ? "Please enter an answer." : "Por favor ingresa tu respuesta.",
    protectedBadge: isEn ? "Spam & Bot Shield" : "Escudo Anti-Spam",
  };

  const loadNewChallenge = async (resetParent: boolean = true) => {
    setLoading(true);
    setErrorMsg("");
    setUserAnswer("");
    setIsVerified(false);
    if (resetParent && onReset) onReset();

    try {
      const newChal = await generateCaptchaChallengeAction();
      setChallenge(newChal);
    } catch (e) {
      setErrorMsg(isEn ? "Error loading captcha. Click reload." : "Error cargando el captcha. Haz clic en recargar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNewChallenge(false);
  }, []);

  const handleVerify = async (e?: any) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
      if (typeof e.stopPropagation === "function") e.stopPropagation();
    }
    if (!challenge) return;

    if (!userAnswer.trim()) {
      setErrorMsg(t.errorRequired);
      return;
    }

    setVerifying(true);
    setErrorMsg("");

    try {
      const res = await verifyCaptchaSolutionAction(userAnswer, challenge.token, honeypot);
      if (res.success && res.verificationToken) {
        setIsVerified(true);
        onVerified(res.verificationToken, honeypot);
      } else {
        setErrorMsg(res.error || (isEn ? "Incorrect answer. Try again." : "Respuesta incorrecta. Intenta de nuevo."));
        setTimeout(() => {
          loadNewChallenge(true);
        }, 1200);
      }
    } catch (err) {
      setErrorMsg(isEn ? "Verification error. Please retry." : "Error de verificación. Intenta nuevamente.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-pink-50/70 via-white to-gray-50 p-4 rounded-2xl border-2 border-pink-100 shadow-sm space-y-3 transition-all">
      {/* Campo Honeypot Oculto (Trampa para Robots Automatizados) */}
      <input
        type="text"
        name="customer_fax_hp"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        style={{
          display: "none",
          position: "absolute",
          left: "-9999px",
          opacity: 0,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      />

      {/* Cabecera del Captcha */}
      <div className="flex items-center justify-between gap-2 border-b border-pink-100/60 pb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isVerified ? 'bg-green-100 text-green-700' : 'bg-pink-100 text-[#FF97A4]'}`}>
            {isVerified ? <ShieldCheck size={16} /> : <Lock size={16} />}
          </div>
          <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            {t.title}
          </span>
        </div>

        <span className="text-[10px] font-extrabold text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full flex items-center gap-1">
          <Sparkles size={11} className="text-[#FF97A4]" />
          {t.protectedBadge}
        </span>
      </div>

      {isVerified ? (
        /* Estado Verificado con Éxito */
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl flex items-center justify-between gap-3 animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 animate-bounce" />
            <span className="text-xs font-bold">{t.verifiedSuccess}</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
            100% OK
          </span>
        </div>
      ) : (
        /* Estado de Resolución del Desafío */
        <div className="space-y-2.5">
          <p className="text-xs text-gray-500 font-medium">
            {t.subtitle}
          </p>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Caja del Desafío Matemático */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-pink-200 shadow-inner flex-shrink-0">
              <span className="text-sm font-black text-gray-800 font-mono tracking-wider">
                🌸 {challenge ? `${t.solveQuestion} ${challenge.question} =` : "..."}
              </span>
            </div>

            {/* Input para la respuesta */}
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  handleVerify(e);
                }
              }}
              placeholder={t.placeholder}
              disabled={loading || verifying}
              className="w-24 p-2 text-center text-sm font-mono font-extrabold border-2 border-pink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4] bg-white text-gray-800"
              required
            />

            {/* Botón de Verificar */}
            <button
              type="button"
              onClick={handleVerify}
              disabled={loading || verifying || !userAnswer.trim()}
              className="bg-[#1A1C1C] hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-40 flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
            >
              {verifying ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>{t.verifying}</span>
                </>
              ) : (
                <span>{t.verifyBtn}</span>
              )}
            </button>

            {/* Botón para recargar desafío */}
            <button
              type="button"
              onClick={() => loadNewChallenge(true)}
              disabled={loading || verifying}
              title={t.reloadTooltip}
              className="p-2 text-gray-400 hover:text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0 cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? "animate-spin text-[#FF97A4]" : ""} />
            </button>
          </div>

          {/* Mensaje de Error si la respuesta fue incorrecta */}
          {errorMsg && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2 rounded-xl border border-red-200 animate-in fade-in duration-200">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
