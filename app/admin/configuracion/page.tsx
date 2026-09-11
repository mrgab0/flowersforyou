"use client";

import { useEffect, useState } from "react";
import { getSiteConfig, updateSiteConfig } from "@/lib/actions/siteConfig";
import { generateTotpSecretAction, getOrCreateTotpSecretAction, update2FASettingsAction, test2FACodeAction } from "@/lib/actions/admin2fa";
import { sendTestCorporateEmailAction } from "@/lib/actions/emailTest";
import { Sparkles, Save, CheckCircle2, ArrowLeft, Layout, AlignLeft, Type, Footprints, ShieldCheck, Key, Smartphone, QrCode, RefreshCw, Lock, AlertTriangle, Check, Grid, Image as ImageIcon, Menu, Share2, Globe, Eye, Palette, Sliders, Star, Mail, Car } from "lucide-react";
import Link from "next/link";
import { SingleImageUploader } from "@/components/admin/SingleImageUploader";
import { testUberDirectConnectionAction } from "@/lib/actions/uberDirect";

export default function AdminConfiguracionPage() {
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"grid" | "branding" | "social" | "reviews" | "iframe" | "security" | "email" | "uber">("grid");

  // Estado para prueba de Correo Corporativo
  const [testEmailAddress, setTestEmailAddress] = useState("sales@flowersforyou.org");
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  // Estado para prueba de Uber Direct
  const [testingUber, setTestingUber] = useState(false);
  const [uberTestResult, setUberTestResult] = useState<{ success: boolean; message: string } | null>(null);

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
      setTimeout(() => setSavedSuccess(false), 3500);
      loadConfig();
    } else {
      alert("Error al guardar la configuración del sitio.");
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 font-bold animate-pulse">
        Cargando Editor Global del Home & Tienda...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header del Editor Global */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#12131A] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 bg-gradient-to-tr from-pink-500 to-[#FF97A4] text-white rounded-2xl shadow-md shadow-pink-500/20">
            <Sliders size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-black text-[#1A1C1C] dark:text-white">Editor Global del Home & Tienda</h1>
            <p className="text-xs text-gray-400">Personaliza columnas, logo, menú, reseñas, redes sociales e iFrames con interruptores ON/OFF</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="bg-pink-50 dark:bg-pink-950/60 text-[#FF97A4] border border-pink-200 dark:border-pink-900/50 px-4 py-2.5 rounded-full font-bold text-xs hover:bg-pink-100 transition-colors flex items-center gap-1.5"
          >
            <Eye size={14} /> Vista Previa Tienda
          </Link>
          <Link
            href="/admin"
            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-full font-bold text-xs hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={14} /> Volver al Panel
          </Link>
        </div>
      </div>

      {/* Pestañas de Navegación del Editor */}
      <div className="flex overflow-x-auto gap-2 bg-white dark:bg-[#12131A] p-2 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => setActiveTab("grid")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs whitespace-nowrap transition-all ${
            activeTab === "grid"
              ? "bg-[#FF97A4] text-white shadow-md shadow-pink-500/20"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Grid size={16} /> Cuadrícula de Productos (3, 4, 5 Cols)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("branding")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs whitespace-nowrap transition-all ${
            activeTab === "branding"
              ? "bg-[#FF97A4] text-white shadow-md shadow-pink-500/20"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <ImageIcon size={16} /> Logo, Lemas & Menú
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs whitespace-nowrap transition-all ${
            activeTab === "reviews"
              ? "bg-[#FF97A4] text-white shadow-md shadow-pink-500/20"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Star size={16} /> Reseñas ⭐ & Trustpilot
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("social")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs whitespace-nowrap transition-all ${
            activeTab === "social"
              ? "bg-[#FF97A4] text-white shadow-md shadow-pink-500/20"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Share2 size={16} /> Redes Sociales & Feed
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("iframe")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs whitespace-nowrap transition-all ${
            activeTab === "iframe"
              ? "bg-[#FF97A4] text-white shadow-md shadow-pink-500/20"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Globe size={16} /> Módulo iFrames / Widgets
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("email")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs whitespace-nowrap transition-all ${
            activeTab === "email"
              ? "bg-[#FF97A4] text-white shadow-md shadow-pink-500/20"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Mail size={16} /> Correo Corporativo
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("uber")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs whitespace-nowrap transition-all ${
            activeTab === "uber"
              ? "bg-[#FF97A4] text-white shadow-md shadow-pink-500/20"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <Car size={16} /> Uber Direct (DaaS) 🚗
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs whitespace-nowrap transition-all ${
            activeTab === "security"
              ? "bg-[#FF97A4] text-white shadow-md shadow-pink-500/20"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <ShieldCheck size={16} /> Seguridad 2FA
        </button>
      </div>

      {/* Formulario Principal de Configuración */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* PESTAÑA 1: Cuadrícula de Productos */}
        {activeTab === "grid" && (
          <div className="bg-white dark:bg-[#12131A] p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <Grid size={22} className="text-[#FF97A4]" />
                <h2 className="font-serif font-black text-lg text-[#1A1C1C] dark:text-white">
                  Distribución de Productos en Escritorio
                </h2>
              </div>
              <span className="text-[11px] font-bold text-gray-400">Por defecto: 3 Columnas</span>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Elige cómo deseas que se organicen las tarjetas de flores en la portada. Puedes mantener la vista estándar de 3 columnas o ampliarla a 4 o 5 columnas para abarcar todo el ancho de pantalla.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Opción 3 Columnas */}
              <label
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                  (config.productColumnsDesktop || 3) === 3
                    ? "border-[#FF97A4] bg-pink-50/30 dark:bg-pink-950/30 shadow-sm"
                    : "border-gray-200 dark:border-gray-800 hover:border-pink-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-[#1A1C1C] dark:text-white">3 Columnas (Estándar)</span>
                  <input
                    type="radio"
                    name="productColumnsDesktop"
                    value="3"
                    defaultChecked={(config.productColumnsDesktop || 3) === 3}
                    onChange={() => setConfig({ ...config, productColumnsDesktop: 3 })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-1.5 h-12 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <div className="bg-[#FF97A4]/60 rounded-lg"></div>
                  <div className="bg-[#FF97A4]/60 rounded-lg"></div>
                  <div className="bg-[#FF97A4]/60 rounded-lg"></div>
                </div>
                <span className="text-[11px] text-gray-400 font-medium">Diseño tradicional amplio. Recomiendo para fotos grandes.</span>
              </label>

              {/* Opción 4 Columnas */}
              <label
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                  config.productColumnsDesktop === 4
                    ? "border-[#FF97A4] bg-pink-50/30 dark:bg-pink-950/30 shadow-sm"
                    : "border-gray-200 dark:border-gray-800 hover:border-pink-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-[#1A1C1C] dark:text-white">4 Columnas (Compacto)</span>
                  <input
                    type="radio"
                    name="productColumnsDesktop"
                    value="4"
                    defaultChecked={config.productColumnsDesktop === 4}
                    onChange={() => setConfig({ ...config, productColumnsDesktop: 4 })}
                  />
                </div>
                <div className="grid grid-cols-4 gap-1 h-12 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <div className="bg-[#FF97A4]/60 rounded-lg"></div>
                  <div className="bg-[#FF97A4]/60 rounded-lg"></div>
                  <div className="bg-[#FF97A4]/60 rounded-lg"></div>
                  <div className="bg-[#FF97A4]/60 rounded-lg"></div>
                </div>
                <span className="text-[11px] text-gray-400 font-medium">Permite mostrar más productos por fila en pantallas de laptop.</span>
              </label>

              {/* Opción 5 Columnas */}
              <label
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                  config.productColumnsDesktop === 5
                    ? "border-[#FF97A4] bg-pink-50/30 dark:bg-pink-950/30 shadow-sm"
                    : "border-gray-200 dark:border-gray-800 hover:border-pink-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-[#1A1C1C] dark:text-white">5 Columnas (Panorámico)</span>
                  <input
                    type="radio"
                    name="productColumnsDesktop"
                    value="5"
                    defaultChecked={config.productColumnsDesktop === 5}
                    onChange={() => setConfig({ ...config, productColumnsDesktop: 5 })}
                  />
                </div>
                <div className="grid grid-cols-5 gap-1 h-12 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                  <div className="bg-[#FF97A4]/60 rounded-lg"></div>
                  <div className="bg-[#FF97A4]/60 rounded-lg"></div>
                  <div className="bg-[#FF97A4]/60 rounded-lg"></div>
                  <div className="bg-[#FF97A4]/60 rounded-lg"></div>
                  <div className="bg-[#FF97A4]/60 rounded-lg"></div>
                </div>
                <span className="text-[11px] text-gray-400 font-medium">Abarca todo el ancho de pantalla para catálogos muy extensos.</span>
              </label>
            </div>
          </div>
        )}

        {/* PESTAÑA 2: Logo, Lemas & Menú */}
        {activeTab === "branding" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Sección Logo & Subida de Imagen */}
            <div className="bg-white dark:bg-[#12131A] p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 border-b pb-3 border-gray-100 dark:border-gray-800">
                <ImageIcon size={20} className="text-[#FF97A4]" />
                <h2 className="font-serif font-black text-lg text-[#1A1C1C] dark:text-white">Imagen del Logo Principal</h2>
              </div>
              <SingleImageUploader
                currentImage={config.logoUrl || "/logo.jpg"}
                label="Logo de Flowers For You (Boutique Floral)"
              />
              <input type="hidden" name="logoUrl" value={config.logoUrl || "/logo.jpg"} />
            </div>

            {/* Sección Lemas del Home & Footer */}
            <div className="bg-white dark:bg-[#12131A] p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 border-b pb-3 border-gray-100 dark:border-gray-800">
                <Type size={20} className="text-[#FF97A4]" />
                <h2 className="font-serif font-black text-lg text-[#1A1C1C] dark:text-white">Lemas y Encabezados de la Boutique</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Título Principal en Portada</label>
                  <input
                    name="heroTitle"
                    defaultValue={config.heroTitle || "Flowers For You LLC"}
                    className="p-3.5 border rounded-2xl text-sm font-bold dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF97A4]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Lema Secundario de Cabecera</label>
                  <input
                    name="brandSlogan"
                    defaultValue={config.brandSlogan || "Boutique Floral Digital • Houston, Texas"}
                    className="p-3.5 border rounded-2xl text-sm font-medium dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF97A4]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Eslogan del Home (Párrafo Hero)</label>
                <textarea
                  name="heroSlogan"
                  defaultValue={config.heroSlogan || "Arreglos florales exclusivos y detalles de lujo diseñados para sorprender a quien más amas."}
                  className="p-3.5 border rounded-2xl text-xs h-20 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF97A4]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Texto del Botón Hero (CTA)</label>
                  <input
                    name="heroButtonText"
                    defaultValue={config.heroButtonText || "Explorar Colección"}
                    className="p-3.5 border rounded-2xl text-xs font-bold dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF97A4]"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Nombre en Pie de Página (Footer)</label>
                  <input
                    name="footerTitle"
                    defaultValue={config.footerTitle || "Flowers For You LLC"}
                    className="p-3.5 border rounded-2xl text-xs font-bold dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF97A4]"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Lema del Footer</label>
                <input
                  name="footerSlogan"
                  defaultValue={config.footerSlogan || "Boutique Digital de Alta Floristería • Entregas a Domicilio"}
                  className="p-3.5 border rounded-2xl text-xs font-medium dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF97A4]"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Texto de Derechos Reservados (Copyright)</label>
                <input
                  name="footerCopyright"
                  defaultValue={config.footerCopyright || "© 2026 Flowers For You LLC. Todos los derechos reservados."}
                  className="p-3.5 border rounded-2xl text-xs font-medium dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF97A4]"
                  required
                />
              </div>
            </div>

            {/* Sección Etiquetas de Menú de Navegación */}
            <div className="bg-white dark:bg-[#12131A] p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 border-b pb-3 border-gray-100 dark:border-gray-800">
                <Menu size={20} className="text-[#FF97A4]" />
                <h2 className="font-serif font-black text-lg text-[#1A1C1C] dark:text-white">Nombres del Menú de Navegación</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-gray-500">Menú 1</label>
                  <input
                    name="menuHomeLabel"
                    defaultValue={config.menuHomeLabel || "Inicio"}
                    className="p-3 border rounded-xl text-xs font-bold dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-gray-500">Menú 2</label>
                  <input
                    name="menuCatalogLabel"
                    defaultValue={config.menuCatalogLabel || "Colección"}
                    className="p-3 border rounded-xl text-xs font-bold dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-gray-500">Menú 3</label>
                  <input
                    name="menuTrackingLabel"
                    defaultValue={config.menuTrackingLabel || "📦 Rastreo"}
                    className="p-3 border rounded-xl text-xs font-bold dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-gray-500">Menú 4</label>
                  <input
                    name="menuAboutLabel"
                    defaultValue={config.menuAboutLabel || "Nosotros"}
                    className="p-3 border rounded-xl text-xs font-bold dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-gray-500">Menú 5</label>
                  <input
                    name="menuContactLabel"
                    defaultValue={config.menuContactLabel || "Contacto"}
                    className="p-3 border rounded-xl text-xs font-bold dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 3: Reseñas & Trustpilot */}
        {activeTab === "reviews" && (
          <div className="bg-white dark:bg-[#12131A] p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <Star size={22} className="text-amber-400 fill-amber-400" />
                <h2 className="font-serif font-black text-lg text-[#1A1C1C] dark:text-white">
                  Módulo de Reseñas, Calificaciones & Trustpilot
                </h2>
              </div>

              {/* Interruptor Toggle ON/OFF */}
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-extrabold text-gray-600 dark:text-gray-300">
                  {config.enableReviewsSection !== false ? "ACTIVADO [ON]" : "DESACTIVADO [OFF]"}
                </span>
                <input
                  type="checkbox"
                  checked={config.enableReviewsSection !== false}
                  onChange={(e) => setConfig({ ...config, enableReviewsSection: e.target.checked })}
                  className="w-5 h-5 accent-[#FF97A4] rounded cursor-pointer"
                />
                <input type="hidden" name="enableReviewsSection" value={config.enableReviewsSection !== false ? "true" : "false"} />
              </label>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Muestra opiniones reales ⭐⭐⭐⭐⭐ de clientes satisfechos con insignia de "Compra Verificada". Además, si cuentas con un widget incrustado de <strong>Trustpilot</strong> o <strong>Google Reviews</strong>, puedes pegar el código abajo sin costo adicional.
            </p>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Título del Bloque de Reseñas</label>
                <input
                  name="reviewsTitle"
                  defaultValue={config.reviewsTitle || "Lo que dicen nuestros clientes en Houston ⭐⭐⭐⭐⭐"}
                  className="p-3.5 border rounded-2xl text-xs font-bold dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Puntuación Destacada (Estrellas)</label>
                  <input
                    name="reviewsRatingScore"
                    defaultValue={config.reviewsRatingScore || "4.9 / 5.0"}
                    placeholder="Ej: 4.9 / 5.0"
                    className="p-3.5 border rounded-2xl text-xs font-extrabold dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Texto de Total de Opiniones</label>
                  <input
                    name="reviewsCountText"
                    defaultValue={config.reviewsCountText || "+180 Opiniones Verificadas"}
                    placeholder="Ej: +180 Opiniones Verificadas"
                    className="p-3.5 border rounded-2xl text-xs font-bold dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 pt-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Globe size={14} className="text-emerald-500" /> Código de Widget Opcional (Trustpilot / Google Reviews)
                </label>
                <textarea
                  name="trustpilotWidgetHtml"
                  defaultValue={config.trustpilotWidgetHtml || ""}
                  placeholder='Pega aquí el código HTML del Widget / Trustbox de Trustpilot o Google Reviews si dispones de él...'
                  className="p-3.5 border rounded-2xl text-xs font-mono h-28 dark:bg-gray-900 dark:text-white"
                />
                <span className="text-[11px] text-gray-400">
                  💡 Si lo dejas vacío, la tienda mostrará el elegante diseño nativo de reseñas verificadas con 5 estrellas sin costo.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 4: Redes Sociales & Feed Social */}
        {activeTab === "social" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Redes Sociales en la Cabecera (Toggle ON/OFF) */}
            <div className="bg-white dark:bg-[#12131A] p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <Share2 size={20} className="text-[#FF97A4]" />
                  <h2 className="font-serif font-black text-lg text-[#1A1C1C] dark:text-white">
                    Íconos de Redes Sociales en Cabecera
                  </h2>
                </div>

                {/* Interruptor Toggle ON/OFF */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-extrabold text-gray-600 dark:text-gray-300">
                    {config.enableHeaderSocials !== false ? "ACTIVADO [ON]" : "DESACTIVADO [OFF]"}
                  </span>
                  <input
                    type="checkbox"
                    checked={config.enableHeaderSocials !== false}
                    onChange={(e) => setConfig({ ...config, enableHeaderSocials: e.target.checked })}
                    className="w-5 h-5 accent-[#FF97A4] rounded cursor-pointer"
                  />
                  <input type="hidden" name="enableHeaderSocials" value={config.enableHeaderSocials !== false ? "true" : "false"} />
                </label>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Al activar este módulo, se renderizarán los íconos directos de tus redes sociales a la izquierda del menú flotante.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">URL de Instagram</label>
                  <input
                    name="instagramUrl"
                    defaultValue={config.instagramUrl || "https://instagram.com"}
                    placeholder="https://instagram.com/flowersforyou"
                    className="p-3 border rounded-xl text-xs font-medium dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">URL de Facebook</label>
                  <input
                    name="facebookUrl"
                    defaultValue={config.facebookUrl || "https://facebook.com"}
                    placeholder="https://facebook.com/flowersforyou"
                    className="p-3 border rounded-xl text-xs font-medium dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">URL de TikTok</label>
                  <input
                    name="tiktokUrl"
                    defaultValue={config.tiktokUrl || "https://tiktok.com"}
                    placeholder="https://tiktok.com/@flowersforyou"
                    className="p-3 border rounded-xl text-xs font-medium dark:bg-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">WhatsApp Directo</label>
                  <input
                    name="whatsappUrl"
                    defaultValue={config.whatsappUrl || "https://wa.me/16576988586"}
                    placeholder="https://wa.me/16576988586"
                    className="p-3 border rounded-xl text-xs font-medium dark:bg-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Módulo Social Pre-Footer Instagram & TikTok Simultáneos */}
            <div className="bg-white dark:bg-[#12131A] p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5">
                  <Sparkles size={20} className="text-[#FF97A4]" />
                  <h2 className="font-serif font-black text-lg text-[#1A1C1C] dark:text-white">
                    Publicaciones Incrustadas de Instagram & TikTok (Pre-Footer)
                  </h2>
                </div>

                {/* Interruptor Global Toggle ON/OFF */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs font-extrabold text-gray-600 dark:text-gray-300">
                    {config.enableSocialFeed ? "ACTIVADO [ON]" : "DESACTIVADO [OFF]"}
                  </span>
                  <input
                    type="checkbox"
                    checked={!!config.enableSocialFeed}
                    onChange={(e) => setConfig({ ...config, enableSocialFeed: e.target.checked })}
                    className="w-5 h-5 accent-[#FF97A4] rounded cursor-pointer"
                  />
                  <input type="hidden" name="enableSocialFeed" value={config.enableSocialFeed ? "true" : "false"} />
                </label>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Título Principal de la Sección Social</label>
                  <input
                    name="socialFeedTitle"
                    defaultValue={config.socialFeedTitle || "Síguenos en Instagram & TikTok 📸"}
                    className="p-3.5 border rounded-xl text-xs font-bold dark:bg-gray-900 dark:text-white"
                  />
                </div>

                {/* EDITOR 1: EMBED DE INSTAGRAM */}
                <div className="p-5 rounded-2xl border-2 border-pink-100 dark:border-pink-950/40 bg-pink-50/20 dark:bg-pink-950/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-[#E1306C] flex items-center gap-1.5 uppercase">
                      📸 1. Feed / Publicación de Instagram
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-[11px] font-bold text-gray-500">
                        {config.enableInstagramFeed !== false ? "Activo" : "Inactivo"}
                      </span>
                      <input
                        type="checkbox"
                        checked={config.enableInstagramFeed !== false}
                        onChange={(e) => setConfig({ ...config, enableInstagramFeed: e.target.checked })}
                        className="w-4 h-4 accent-[#E1306C] rounded cursor-pointer"
                      />
                      <input type="hidden" name="enableInstagramFeed" value={config.enableInstagramFeed !== false ? "true" : "false"} />
                    </label>
                  </div>
                  <textarea
                    name="instagramEmbedHtml"
                    defaultValue={config.instagramEmbedHtml || ""}
                    placeholder='Pega aquí el código <blockquote class="instagram-media">... o <iframe src="..."> de Instagram'
                    className="w-full p-3.5 border rounded-2xl text-xs font-mono h-28 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-[#E1306C]"
                  />
                </div>

                {/* EDITOR 2: EMBED DE TIKTOK */}
                <div className="p-5 rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-gray-900 dark:text-white flex items-center gap-1.5 uppercase">
                      🎵 2. Feed / Video de TikTok
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-[11px] font-bold text-gray-500">
                        {config.enableTiktokFeed !== false ? "Activo" : "Inactivo"}
                      </span>
                      <input
                        type="checkbox"
                        checked={config.enableTiktokFeed !== false}
                        onChange={(e) => setConfig({ ...config, enableTiktokFeed: e.target.checked })}
                        className="w-4 h-4 accent-black rounded cursor-pointer"
                      />
                      <input type="hidden" name="enableTiktokFeed" value={config.enableTiktokFeed !== false ? "true" : "false"} />
                    </label>
                  </div>
                  <textarea
                    name="tiktokEmbedHtml"
                    defaultValue={config.tiktokEmbedHtml || ""}
                    placeholder='Pega aquí el código <blockquote class="tiktok-embed">... o <iframe src="..."> de TikTok'
                    className="w-full p-3.5 border rounded-2xl text-xs font-mono h-28 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-black"
                  />
                </div>

                {/* FALLBACK LEGACY EMBED HTML */}
                <input type="hidden" name="socialEmbedHtml" value={config.socialEmbedHtml || ""} />
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA 5: Módulo de iFrames / Widgets */}
        {activeTab === "iframe" && (
          <div className="bg-white dark:bg-[#12131A] p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <Globe size={20} className="text-[#FF97A4]" />
                <h2 className="font-serif font-black text-lg text-[#1A1C1C] dark:text-white">
                  Módulo de iFrames / Widgets Externos
                </h2>
              </div>

              {/* Interruptor Toggle ON/OFF */}
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-extrabold text-gray-600 dark:text-gray-300">
                  {config.enableCustomIframe ? "ACTIVADO [ON]" : "DESACTIVADO [OFF]"}
                </span>
                <input
                  type="checkbox"
                  checked={!!config.enableCustomIframe}
                  onChange={(e) => setConfig({ ...config, enableCustomIframe: e.target.checked })}
                  className="w-5 h-5 accent-[#FF97A4] rounded cursor-pointer"
                />
                <input type="hidden" name="enableCustomIframe" value={config.enableCustomIframe ? "true" : "false"} />
              </label>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Usa este módulo si el jefe o administrador desea integrar mapas interactivos de Google Maps, sistemas de reservación, videos promocionales de YouTube/Vimeo o widgets externos directamente en la portada.
            </p>

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Título de la Sección del Widget</label>
                <input
                  name="customIframeTitle"
                  defaultValue={config.customIframeTitle || "Ubicación & Promociones Destacadas"}
                  className="p-3.5 border rounded-xl text-xs font-bold dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Código HTML / iFrame del Widget
                </label>
                <textarea
                  name="customIframeHtml"
                  defaultValue={config.customIframeHtml || ""}
                  placeholder='Pega aquí el código <iframe src="https://www.google.com/maps/embed?..." width="100%" height="450"></iframe>'
                  className="p-3.5 border rounded-2xl text-xs font-mono h-36 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA: Correo Corporativo */}
        {activeTab === "email" && (
          <div className="bg-white dark:bg-[#12131A] p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <Mail size={22} className="text-[#FF97A4]" />
                <h2 className="font-serif font-black text-lg text-[#1A1C1C] dark:text-white">
                  Servicio de Correo Corporativo (sales@flowersforyou.org)
                </h2>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                🟢 Activo & Conectado
              </span>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Todos los correos transaccionales (recibos de compra, notificaciones de pedidos, alertas de contacto y recuperaciones) son enviados automáticamente a través de la identidad corporativa oficial <strong>sales@flowersforyou.org</strong>.
            </p>

            {/* Tarjeta Informativa de Configuración SMTP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-pink-100 dark:border-pink-950/40 bg-pink-50/20 dark:bg-pink-950/10 space-y-2">
                <span className="text-[11px] font-black uppercase text-[#FF97A4] tracking-wider">Remitente Corporativo Oficial</span>
                <p className="text-sm font-extrabold text-[#1A1C1C] dark:text-white">"Flowers For You LLC" &lt;sales@flowersforyou.org&gt;</p>
                <p className="text-[11px] text-gray-400">Dirección visible para los clientes en sus recibos e inboxes.</p>
              </div>

              <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 space-y-2">
                <span className="text-[11px] font-black uppercase text-gray-700 dark:text-gray-300 tracking-wider">Servidor de Envíos (SMTP)</span>
                <p className="text-sm font-extrabold text-[#1A1C1C] dark:text-white">Conectado vía Vercel / Resend / NodeMailer</p>
                <p className="text-[11px] text-gray-400">Formato HTML responsivo con logo institucional y firma legal.</p>
              </div>
            </div>

            {/* Módulo de Envío de Prueba en Vivo */}
            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/20 space-y-4">
              <h3 className="font-serif font-black text-sm text-[#1A1C1C] dark:text-white flex items-center gap-2">
                📨 Probar Envío de Correo Corporativo en Vivo
              </h3>
              <p className="text-xs text-gray-500">
                Ingresa una dirección de correo para enviar un mensaje institucional de prueba inmediato desde <strong>sales@flowersforyou.org</strong>.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  placeholder="ejemplo@dominio.com"
                  className="flex-1 p-3.5 border rounded-xl text-xs font-bold dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF97A4]"
                />
                <button
                  type="button"
                  onClick={async () => {
                    setSendingTestEmail(true);
                    setTestEmailResult(null);
                    const res = await sendTestCorporateEmailAction(testEmailAddress);
                    setTestEmailResult(res);
                    setSendingTestEmail(false);
                  }}
                  disabled={sendingTestEmail || !testEmailAddress}
                  className="bg-[#1A1C1C] text-white dark:bg-white dark:text-gray-900 px-6 py-3.5 rounded-xl text-xs font-black hover:bg-black dark:hover:bg-gray-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Mail size={15} />
                  {sendingTestEmail ? "Enviando Correo..." : "Enviar Correo de Prueba 📩"}
                </button>
              </div>

              {testEmailResult && (
                <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  testEmailResult.success 
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900" 
                    : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900"
                }`}>
                  {testEmailResult.success ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertTriangle size={16} className="text-red-600" />}
                  <span>{testEmailResult.success ? testEmailResult.message : testEmailResult.error}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA: Uber Direct (DaaS) */}
        {activeTab === "uber" && (
          <div className="bg-white dark:bg-[#12131A] p-6 md:p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <Car size={22} className="text-[#FF97A4]" />
                <h2 className="font-serif font-black text-lg text-[#1A1C1C] dark:text-white">
                  Uber Direct (Delivery as a Service) 🚗
                </h2>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="enableUberDirect"
                  value="true"
                  defaultChecked={config.enableUberDirect ?? false}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#FF97A4]"></div>
                <span className="ml-3 text-xs font-bold text-gray-700 dark:text-gray-300">
                  {config.enableUberDirect ? "Activado" : "Desactivado"}
                </span>
              </label>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Conecta tu cuenta de <strong>Uber Direct</strong> para cotizar y solicitar repartidores express en tiempo real con 1 solo clic desde el panel de órdenes. Tus clientes recibirán un enlace con el mapa en vivo de Uber para ver al repartidor llegar con sus flores.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Entorno */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  Ambiente de Ejecución
                </label>
                <select
                  name="uberDirectEnv"
                  defaultValue={config.uberDirectEnv || "sandbox"}
                  onChange={(e) => setConfig({ ...config, uberDirectEnv: e.target.value })}
                  className="w-full p-3 border rounded-xl text-xs font-bold dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF97A4]"
                >
                  <option value="sandbox">🧪 Sandbox (Modo Pruebas / Simulado)</option>
                  <option value="production">🚀 Producción (Entregas Reales)</option>
                </select>
                <span className="text-[10px] text-gray-400">Usa Sandbox para pruebas con repartidores simulados de Uber sin costo real.</span>
              </div>

              {/* Auto Despacho */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  Despacho Automático al Confirmar
                </label>
                <select
                  name="uberDirectAutoDispatch"
                  defaultValue={config.uberDirectAutoDispatch ? "true" : "false"}
                  className="w-full p-3 border rounded-xl text-xs font-bold dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF97A4]"
                >
                  <option value="false">✋ Manual (Despachar con botón desde cada orden)</option>
                  <option value="true">⚡ Automático (Solicitar Uber inmediatamente)</option>
                </select>
                <span className="text-[10px] text-gray-400">Recomendado Manual para validar la preparación del arreglo floral antes.</span>
              </div>
            </div>

            {/* Credenciales de API */}
            <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">Credenciales de Uber Direct API</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Customer ID (Organización)
                  </label>
                  <input
                    type="text"
                    name="uberDirectCustomerId"
                    defaultValue={config.uberDirectCustomerId || ""}
                    onChange={(e) => setConfig({ ...config, uberDirectCustomerId: e.target.value })}
                    placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                    className="w-full p-3 border rounded-xl text-xs font-mono dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF97A4]"
                  />
                  <span className="text-[10px] text-gray-400">El ID de cliente provisto en el portal de Uber Direct.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Client ID (OAuth 2.0)
                  </label>
                  <input
                    type="text"
                    name="uberDirectClientId"
                    defaultValue={config.uberDirectClientId || ""}
                    onChange={(e) => setConfig({ ...config, uberDirectClientId: e.target.value })}
                    placeholder="e.g. your-uber-client-id"
                    className="w-full p-3 border rounded-xl text-xs font-mono dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF97A4]"
                  />
                  <span className="text-[10px] text-gray-400">Identificador de aplicación en Uber Developer.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    Client Secret (Secreto)
                  </label>
                  <input
                    type="password"
                    name="uberDirectClientSecret"
                    defaultValue={config.uberDirectClientSecret || ""}
                    onChange={(e) => setConfig({ ...config, uberDirectClientSecret: e.target.value })}
                    placeholder="••••••••••••••••••••"
                    className="w-full p-3 border rounded-xl text-xs font-mono dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF97A4]"
                  />
                  <span className="text-[10px] text-gray-400">Clave secreta para autenticación OAuth 2.0.</span>
                </div>
              </div>
            </div>

            {/* Probador de Conexión en Vivo */}
            <div className="p-5 bg-pink-50/40 dark:bg-pink-950/20 rounded-2xl border border-pink-100 dark:border-pink-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1A1C1C] dark:text-white flex items-center gap-2">
                    <Sparkles size={15} className="text-[#FF97A4]" />
                    Verificación de Conexión con Uber Direct
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    Envía una solicitud de autenticación OAuth 2.0 a los servidores de Uber para validar tus credenciales.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setTestingUber(true);
                    setUberTestResult(null);
                    const res = await testUberDirectConnectionAction({
                      clientId: config.uberDirectClientId,
                      clientSecret: config.uberDirectClientSecret,
                      customerId: config.uberDirectCustomerId,
                      env: config.uberDirectEnv || "sandbox"
                    });
                    setUberTestResult(res);
                    setTestingUber(false);
                  }}
                  disabled={testingUber || !config.uberDirectClientId || !config.uberDirectClientSecret}
                  className="bg-[#1A1C1C] text-white dark:bg-white dark:text-gray-900 px-5 py-2.5 rounded-xl text-xs font-black hover:bg-black dark:hover:bg-gray-100 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Car size={15} />
                  {testingUber ? "Verificando con Uber..." : "🧪 Probar Conexión con Uber"}
                </button>
              </div>

              {uberTestResult && (
                <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
                  uberTestResult.success 
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900" 
                    : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900"
                }`}>
                  {uberTestResult.success ? <CheckCircle2 size={16} className="text-emerald-600" /> : <AlertTriangle size={16} className="text-red-600" />}
                  <span>{uberTestResult.message}</span>
                </div>
              )}
            </div>

            {/* Webhook Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-1.5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                🔗 Webhook URL para eventos de repartidor en tiempo real:
              </span>
              <div className="flex items-center gap-2">
                <code className="p-2 bg-white dark:bg-gray-800 rounded-lg text-xs font-mono text-[#FF97A4] font-bold border border-gray-200 dark:border-gray-700 flex-1 select-all">
                  /api/webhooks/uber-direct
                </code>
              </div>
              <p className="text-[10px] text-gray-400">
                Configura esta URL en tu Dashboard de Desarrolladores de Uber para recibir actualizaciones de estado (repartidor asignado, recogido, entregado) automáticamente en tu base de datos.
              </p>
            </div>
          </div>
        )}

        {/* PESTAÑA 6: Seguridad 2FA */}
        {activeTab === "security" && (
          <div className="animate-in fade-in duration-200">
            <TwoFactorConfigSection config={config} onSaveSuccess={loadConfig} />
          </div>
        )}

        {/* Botón Flotante para Guardar Cambios del Editor Global */}
        {activeTab !== "security" && (
          <div className="sticky bottom-4 z-30 flex justify-between items-center bg-white/95 dark:bg-[#12131A]/95 backdrop-blur-md p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl">
            {savedSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 size={16} /> ¡Configuración del Home actualizada correctamente!
              </span>
            ) : (
              <span className="text-xs text-gray-400 font-medium">Los cambios se aplican al instante en la tienda sin romper nada.</span>
            )}

            <button
              type="submit"
              disabled={saving}
              className="bg-[#FF97A4] text-white px-8 py-3.5 rounded-full text-xs font-black hover:bg-[#B0004A] transition-all shadow-lg shadow-pink-500/20 disabled:bg-gray-400 flex items-center gap-2 ml-auto hover:scale-105 active:scale-95"
            >
              <Save size={16} />
              {saving ? "Guardando Cambios..." : "Guardar Configuración del Home"}
            </button>
          </div>
        )}
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
