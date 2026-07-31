"use client";

import { useEffect, useState } from "react";
import { getSiteConfig, updateSiteConfig } from "@/lib/actions/siteConfig";
import { generateTotpSecretAction, getOrCreateTotpSecretAction, update2FASettingsAction, test2FACodeAction } from "@/lib/actions/admin2fa";
import { Sparkles, Save, CheckCircle2, ArrowLeft, Layout, AlignLeft, Type, Footprints, ShieldCheck, Key, Smartphone, QrCode, RefreshCw, Lock, AlertTriangle, Check } from "lucide-react";
import Link from "next/link";

export default function AdminConfiguracionPage() {
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    setLoading(true);
    const { data } = await getSiteConfig();
    if (data) setConfig(data);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateSiteConfig(formData);
    setSaving(false);

    if (result.success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      loadConfig();
    } else {
      alert("Error al actualizar los lemas del sitio.");
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 font-bold animate-pulse">
        Cargando configuración de lemas...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header Admin */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#12131A] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-50 dark:bg-pink-950/60 text-[#FF97A4] rounded-2xl border border-pink-100 dark:border-pink-900/50">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1A1C1C] dark:text-white">Edición de Lemas y Textos del Sitio</h1>
            <p className="text-xs text-gray-400">Personaliza el lema de portada (Home) y la información del Footer</p>
          </div>
        </div>
        <Link
          href="/admin"
          className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-5 py-2.5 rounded-full font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={14} /> Volver al Panel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección Lema de Portada (Home Hero) */}
        <div className="bg-white dark:bg-[#12131A] p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b pb-3 border-gray-100 dark:border-gray-800">
            <Layout size={20} className="text-[#FF97A4]" />
            <h2 className="font-bold text-base text-[#1A1C1C] dark:text-white">Lema y Encabezado Principal (Home)</h2>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <Type size={14} className="text-gray-400" /> Título Principal de la Boutique
              </label>
              <input
                name="heroTitle"
                defaultValue={config.heroTitle || "Flowers For You"}
                placeholder="Ej: Flowers For You"
                className="p-3.5 border rounded-2xl text-sm font-bold text-[#1A1C1C] dark:text-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                <AlignLeft size={14} className="text-gray-400" /> Lema / Eslogan del Home (Subtítulo)
              </label>
              <textarea
                name="heroSlogan"
                defaultValue={config.heroSlogan || ""}
                placeholder="Ej: Arreglos florales exclusivos y detalles de lujo diseñados para sorprender a quien más amas."
                className="p-3.5 border rounded-2xl text-xs h-24 font-medium text-gray-800 dark:text-gray-200 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Texto del Botón Principal (CTA)
              </label>
              <input
                name="heroButtonText"
                defaultValue={config.heroButtonText || "Explorar Colección"}
                placeholder="Ej: Explorar Colección"
                className="p-3.5 border rounded-2xl text-xs font-bold text-gray-800 dark:text-gray-200 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                required
              />
            </div>
          </div>
        </div>

        {/* Sección Footer */}
        <div className="bg-white dark:bg-[#12131A] p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b pb-3 border-gray-100 dark:border-gray-800">
            <Footprints size={20} className="text-[#FF97A4]" />
            <h2 className="font-bold text-base text-[#1A1C1C] dark:text-white">Lema y Pie de Página (Footer)</h2>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Nombre de la Empresa en Footer
              </label>
              <input
                name="footerTitle"
                defaultValue={config.footerTitle || "Flowers For You LLC"}
                placeholder="Ej: Flowers For You LLC"
                className="p-3.5 border rounded-2xl text-xs font-bold text-gray-800 dark:text-gray-200 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Lema / Descripción del Footer
              </label>
              <input
                name="footerSlogan"
                defaultValue={config.footerSlogan || ""}
                placeholder="Ej: Boutique Digital de Alta Floristería • Entregas a Domicilio"
                className="p-3.5 border rounded-2xl text-xs font-medium text-gray-800 dark:text-gray-200 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Texto de Derechos Reservados (Copyright)
              </label>
              <input
                name="footerCopyright"
                defaultValue={config.footerCopyright || ""}
                placeholder="Ej: © 2026 Flowers For You LLC. Todos los derechos reservados."
                className="p-3.5 border rounded-2xl text-xs font-medium text-gray-800 dark:text-gray-200 dark:bg-gray-900 border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                required
              />
            </div>
          </div>
        </div>

        {/* Sección de Seguridad y Autenticación de Dos Factores (2FA) */}
        <TwoFactorConfigSection config={config} onSaveSuccess={loadConfig} />

        {/* Botón Guardar Cambios Generales */}
        <div className="flex justify-between items-center bg-white dark:bg-[#12131A] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          {savedSuccess ? (
            <span className="text-xs font-bold text-green-600 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 size={16} /> ¡Lemas y textos del sitio actualizados correctamente!
            </span>
          ) : (
            <span className="text-xs text-gray-400 font-medium">Los cambios se reflejan inmediatamente en la portada y footer.</span>
          )}

          <button
            type="submit"
            disabled={saving}
            className="bg-[#FF97A4] text-white px-8 py-3 rounded-full text-xs font-bold hover:bg-[#B0004A] transition-colors shadow-md disabled:bg-gray-400 flex items-center gap-2 ml-auto"
          >
            <Save size={16} />
            {saving ? "Guardando..." : "Guardar Lemas"}
          </button>
        </div>
      </form>
    </div>
  );
}

function TwoFactorConfigSection({ config, onSaveSuccess }: { config: any; onSaveSuccess: () => void }) {
  const [mode, setMode] = useState<"none" | "pin" | "totp">(config.twoFactorMode || "none");
  const [pin, setPin] = useState(config.twoFactorPin || "");
  const [secret, setSecret] = useState(config.twoFactorSecret || "");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  const [saving2FA, setSaving2FA] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [generatingQR, setGeneratingQR] = useState(false);

  const [testCode, setTestCode] = useState("");
  const [testResult, setTestResult] = useState("");
  const [testSuccess, setTestSuccess] = useState(false);
  const [testingCode, setTestingCode] = useState(false);

  useEffect(() => {
    if (config.twoFactorMode) setMode(config.twoFactorMode);
    if (config.twoFactorPin) setPin(config.twoFactorPin);
    if (config.twoFactorSecret) setSecret(config.twoFactorSecret);

    if (config.twoFactorMode === "totp" || mode === "totp") {
      loadTotpData(false);
    }
  }, [config, mode]);

  async function loadTotpData(forceNew: boolean = false) {
    setGeneratingQR(true);
    setErrorMsg("");
    setTestResult("");
    const res = await getOrCreateTotpSecretAction(forceNew);
    setGeneratingQR(false);

    if (res.success && res.secret && res.qrCodeUrl) {
      setSecret(res.secret);
      setQrCodeUrl(res.qrCodeUrl);
    } else {
      setErrorMsg(res.error || "No se pudo cargar el Código QR.");
    }
  }

  async function handleTestCode() {
    if (!secret || !testCode) return;
    setTestingCode(true);
    setTestResult("");
    const res = await test2FACodeAction(secret, testCode);
    setTestingCode(false);

    if (res.success) {
      setTestSuccess(true);
      setTestResult(res.message || "¡Código verificado con éxito!");
    } else {
      setTestSuccess(false);
      setTestResult(res.error || "Código incorrecto.");
    }
  }

  async function handleSave2FA(e: React.FormEvent) {
    e.preventDefault();
    setSaving2FA(true);
    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData();
    formData.set("twoFactorMode", mode);
    formData.set("twoFactorPin", pin);
    formData.set("twoFactorSecret", secret);

    const result = await update2FASettingsAction(formData);
    setSaving2FA(false);

    if (result.success) {
      setSuccessMsg("¡Configuración de seguridad 2FA actualizada correctamente!");
      setTimeout(() => setSuccessMsg(""), 3500);
      onSaveSuccess();
    } else {
      setErrorMsg(result.error || "Error al actualizar 2FA.");
    }
  }

  return (
    <div className="bg-white dark:bg-[#12131A] p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b pb-3 border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <ShieldCheck size={20} className="text-[#FF97A4]" />
          <h2 className="font-bold text-base text-[#1A1C1C] dark:text-white">Seguridad & Verificación en 2 Pasos (2FA)</h2>
        </div>
        <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
          100% Gratuito ($0 USD)
        </span>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Protege el acceso al Panel Administrador. En caso de emergencia o desincronización de hora, siempre dispones del botón de <strong>Recuperación por Correo Electronico</strong>.
      </p>

      {errorMsg && (
        <div className="p-3.5 bg-red-50 text-red-700 text-xs font-bold rounded-2xl border border-red-200 flex items-center gap-2">
          <AlertTriangle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-green-50 text-green-700 text-xs font-bold rounded-2xl border border-green-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Selector de Modos 2FA */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Opción 1: Desactivado */}
        <label
          onClick={() => setMode("none")}
          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
            mode === "none"
              ? "border-[#FF97A4] bg-pink-50/20 dark:bg-pink-950/20 shadow-sm"
              : "border-gray-100 dark:border-gray-800 hover:border-gray-200 bg-gray-50/50 dark:bg-gray-900/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <Lock size={18} />
            </div>
            <input type="radio" name="modeSelect" checked={mode === "none"} onChange={() => setMode("none")} className="sr-only" />
          </div>
          <div>
            <span className="font-bold text-xs text-[#1A1C1C] dark:text-white block">❌ Desactivado</span>
            <span className="text-[11px] text-gray-400 font-medium block mt-0.5">Acceso solo con contraseña principal</span>
          </div>
        </label>

        {/* Opción 2: PIN Secundario */}
        <label
          onClick={() => setMode("pin")}
          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
            mode === "pin"
              ? "border-[#FF97A4] bg-pink-50/20 dark:bg-pink-950/20 shadow-sm"
              : "border-gray-100 dark:border-gray-800 hover:border-gray-200 bg-gray-50/50 dark:bg-gray-900/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300">
              <Key size={18} />
            </div>
            <input type="radio" name="modeSelect" checked={mode === "pin"} onChange={() => setMode("pin")} className="sr-only" />
          </div>
          <div>
            <span className="font-bold text-xs text-[#1A1C1C] dark:text-white block">🔑 PIN Secundario</span>
            <span className="text-[11px] text-gray-400 font-medium block mt-0.5">Clave de 6 dígitos que defines aquí</span>
          </div>
        </label>

        {/* Opción 3: App Autenticadora */}
        <label
          onClick={() => {
            setMode("totp");
            if (!secret) loadTotpData(false);
          }}
          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
            mode === "totp"
              ? "border-[#FF97A4] bg-pink-50/20 dark:bg-pink-950/20 shadow-sm"
              : "border-gray-100 dark:border-gray-800 hover:border-gray-200 bg-gray-50/50 dark:bg-gray-900/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300">
              <Smartphone size={18} />
            </div>
            <input type="radio" name="modeSelect" checked={mode === "totp"} onChange={() => setMode("totp")} className="sr-only" />
          </div>
          <div>
            <span className="font-bold text-xs text-[#1A1C1C] dark:text-white block">📱 App Autenticadora</span>
            <span className="text-[11px] text-gray-400 font-medium block mt-0.5">Google Authenticator / Authy</span>
          </div>
        </label>
      </div>

      {/* Configuración según el modo seleccionado */}
      {mode === "pin" && (
        <div className="p-5 bg-purple-50/40 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900/50 space-y-3 animate-in fade-in duration-300">
          <label className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
            <Key size={14} /> Define tu PIN de Seguridad Maestro (6 dígitos numéricos)
          </label>
          <input
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="Ej: 849204"
            className="p-3.5 border rounded-xl text-center font-mono font-extrabold tracking-widest text-lg w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-[#FF97A4] dark:bg-gray-900 dark:text-white"
          />
          <p className="text-[11px] text-purple-700 dark:text-purple-300">
            Al iniciar sesión, el sistema te solicitará tu contraseña principal y luego este PIN de 6 dígitos.
          </p>
        </div>
      )}

      {mode === "totp" && (
        <div className="p-5 bg-blue-50/40 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/50 space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {qrCodeUrl ? (
              <div className="bg-white p-3 rounded-2xl border shadow-sm flex flex-col items-center flex-shrink-0">
                <img src={qrCodeUrl} alt="Código QR 2FA" className="w-40 h-40 object-contain rounded-xl" />
                <span className="text-[10px] text-gray-500 font-bold mt-1">Escanea con tu teléfono</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => loadTotpData(false)}
                disabled={generatingQR}
                className="bg-blue-600 text-white px-5 py-3 rounded-2xl text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <QrCode size={16} />
                {generatingQR ? "Cargando QR..." : "Cargar Código QR"}
              </button>
            )}

            <div className="space-y-2 text-xs text-blue-900 dark:text-blue-200 w-full">
              <span className="font-bold block text-sm">Pasos para vincular tu teléfono:</span>
              <ol className="list-decimal pl-4 space-y-1 text-gray-600 dark:text-gray-300 font-medium">
                <li>Abre <strong>Google Authenticator</strong>, <strong>Authy</strong> o Contraseñas de Apple en tu celular.</li>
                <li>Toca el botón <strong>"+"</strong> y selecciona <strong>"Escanear código QR"</strong>.</li>
                <li>Apunta tu cámara al código QR de la izquierda.</li>
              </ol>
              {secret && (
                <div className="pt-2 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-gray-400 block">Clave Secreta Manual Permanente:</span>
                      <code className="bg-white dark:bg-gray-900 px-3 py-1.5 rounded-lg font-mono font-bold text-gray-800 dark:text-gray-100 border text-xs inline-block mt-1 tracking-wider select-all">
                        {secret}
                      </code>
                    </div>

                    <button
                      type="button"
                      onClick={() => loadTotpData(true)}
                      disabled={generatingQR}
                      className="text-[11px] font-bold text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 flex items-center gap-1 mt-3 sm:mt-4 transition-colors"
                    >
                      <RefreshCw size={12} className={generatingQR ? "animate-spin" : ""} />
                      Regenerar Nuevo QR
                    </button>
                  </div>

                  {/* Probador en Vivo del Código */}
                  <div className="pt-2 border-t border-blue-100 dark:border-blue-900/50 space-y-2">
                    <span className="text-xs font-bold text-blue-950 dark:text-blue-200 block">
                      Prueba los 6 dígitos que muestra tu app ahora mismo:
                    </span>
                    <div className="flex items-center gap-2 max-w-sm">
                      <input
                        type="text"
                        maxLength={6}
                        value={testCode}
                        onChange={(e) => setTestCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="0 0 0 0 0 0"
                        className="p-2.5 border rounded-xl text-center font-mono font-extrabold text-base tracking-widest bg-white dark:bg-gray-900 dark:text-white w-36 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                      />
                      <button
                        type="button"
                        onClick={handleTestCode}
                        disabled={testingCode || testCode.length < 6}
                        className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-700 disabled:bg-gray-300 transition-colors flex items-center gap-1.5"
                      >
                        {testingCode ? "Probando..." : "Probar Código"}
                      </button>
                    </div>

                    {testResult && (
                      <p className={`text-xs font-bold mt-1 ${testSuccess ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                        {testSuccess ? "✓ " : "✗ "}{testResult}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Botón para Guardar Configuración de 2FA */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave2FA}
          disabled={saving2FA}
          className="bg-[#1A1C1C] dark:bg-white text-white dark:text-gray-900 px-7 py-3 rounded-full text-xs font-bold hover:bg-black dark:hover:bg-gray-100 transition-all shadow-sm flex items-center gap-2"
        >
          <ShieldCheck size={16} className="text-[#FF97A4]" />
          {saving2FA ? "Guardando 2FA..." : "Guardar Ajustes de Seguridad (2FA)"}
        </button>
      </div>
    </div>
  );
}

