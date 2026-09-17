"use client";

import { useState, useEffect, useRef } from "react";
import { StickyNav } from "@/components/shop/StickyNav";
import { sendContactMessage } from "@/lib/actions/contact";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

const COOLDOWN_DURATION = 60; // 60 segundos de cooldown
const STORAGE_KEY = "f4u_last_contact_timestamp";

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    honeypot: "", // Campo trampa anti-bot
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const formLoadedAtRef = useRef<number>(Date.now());

  // Recuperar y gestionar temporizador de enfriamiento (cooldown) desde localStorage
  useEffect(() => {
    formLoadedAtRef.current = Date.now();

    const checkCooldown = () => {
      const lastSent = localStorage.getItem(STORAGE_KEY);
      if (lastSent) {
        const elapsedSeconds = Math.floor((Date.now() - parseInt(lastSent, 10)) / 1000);
        if (elapsedSeconds < COOLDOWN_DURATION) {
          setCooldownRemaining(COOLDOWN_DURATION - elapsedSeconds);
        } else {
          setCooldownRemaining(0);
        }
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Si aún está en cooldown en el navegador
    if (cooldownRemaining > 0) {
      setErrorMessage(
        `Por favor espera ${cooldownRemaining} segundos antes de enviar otro mensaje.`
      );
      return;
    }

    setLoading(true);

    try {
      const response = await sendContactMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        honeypot: formData.honeypot,
        formLoadedAt: formLoadedAtRef.current,
      });

      if (response.success) {
        setSuccessMessage(
          response.message || "Tu mensaje ha sido enviado exitosamente."
        );
        // Limpiar formulario excepto honeypot
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          honeypot: "",
        });

        // Activar cooldown
        const now = Date.now();
        localStorage.setItem(STORAGE_KEY, now.toString());
        setCooldownRemaining(COOLDOWN_DURATION);
      } else {
        setErrorMessage(response.error || "No se pudo enviar el mensaje.");
      }
    } catch (err) {
      setErrorMessage("Error de conexión al enviar el formulario. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col justify-between">
      <div>
        {/* Barra de navegación */}
        <StickyNav />

        {/* Encabezado Principal */}
        <header className="bg-white border-b border-[#FF97A4]/20 py-16 px-6">
          <div className="container mx-auto max-w-5xl text-center">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-[0.2em] bg-[#FF97A4]/15 text-[#D81B60] mb-4">
              <Sparkles size={14} /> Boutique Floral
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-black text-[#1A1C1C] mb-4">
              Contáctanos
            </h1>
            <p className="text-gray-500 max-w-xl mx-auto text-base md:text-lg">
              Estamos aquí para ayudarte a crear arreglos inolvidables. Escríbenos y te atenderemos con gusto.
            </p>
          </div>
        </header>

        {/* Contenido Principal */}
        <main className="container mx-auto max-w-6xl px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Columna Izquierda: Información de Contacto */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-8 border border-[#FF97A4]/20 shadow-sm space-y-6">
                <h2 className="text-2xl font-serif font-bold text-[#1A1C1C] border-b border-gray-100 pb-4">
                  Información de la Boutique
                </h2>

                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FF97A4]/10 text-[#D81B60] flex items-center justify-center shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#1A1C1C]">Dirección</h3>
                      <p className="text-gray-600 text-sm">6705 Fairway Dr.</p>
                      <p className="text-gray-600 text-sm">Houston, Texas 77087</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FF97A4]/10 text-[#D81B60] flex items-center justify-center shrink-0">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#1A1C1C]">Teléfono / Pedidos</h3>
                      <a
                        href="tel:+16576988586"
                        className="text-gray-600 text-sm hover:text-[#D81B60] transition-colors"
                      >
                        +1 (657) 698-8586
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FF97A4]/10 text-[#D81B60] flex items-center justify-center shrink-0">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#1A1C1C]">Correo Electrónico</h3>
                      <p className="text-gray-600 text-sm">contacto@flowersforyou.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FF97A4]/10 text-[#D81B60] flex items-center justify-center shrink-0">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#1A1C1C]">Horario de Atención</h3>
                      <p className="text-gray-600 text-sm">Lunes a Sábado: 8:00 AM - 7:00 PM</p>
                      <p className="text-gray-600 text-sm">Domingo: 9:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                </div>

                {/* Botón directo a WhatsApp */}
                <div className="pt-4 border-t border-gray-100">
                  <a
                    href="https://wa.me/16576988586"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white py-3.5 px-6 rounded-2xl font-bold transition-all shadow-md hover:shadow-lg text-sm"
                  >
                    <MessageCircle size={20} />
                    Chatear por WhatsApp
                  </a>
                </div>
              </div>

              {/* Tarjeta de Seguridad Anti-Spam */}
              <div className="bg-[#FDF2F7] rounded-2xl p-5 border border-[#FF97A4]/30 flex items-center gap-4 text-xs text-gray-700">
                <ShieldCheck size={28} className="text-[#D81B60] shrink-0" />
                <p>
                  Tus mensajes están protegidos y son entregados directamente a nuestro equipo sin intermediarios.
                </p>
              </div>
            </div>

            {/* Columna Derecha: Formulario de Contacto */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl p-8 md:p-10 border border-[#FF97A4]/20 shadow-sm">
                <h2 className="text-2xl font-serif font-bold text-[#1A1C1C] mb-2">
                  Envíanos un mensaje
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                  Completa el formulario y te responderemos en el menor tiempo posible.
                </p>

                {/* Banner de Mensaje de Éxito */}
                {successMessage && (
                  <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
                    <CheckCircle2 size={20} className="shrink-0 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">{successMessage}</p>
                    </div>
                  </div>
                )}

                {/* Banner de Mensaje de Error */}
                {errorMessage && (
                  <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
                    <AlertCircle size={20} className="shrink-0 text-rose-600 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">{errorMessage}</p>
                    </div>
                  </div>
                )}

                {/* Banner de Estado de Cooldown */}
                {cooldownRemaining > 0 && (
                  <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between text-xs md:text-sm font-medium">
                    <span className="flex items-center gap-2">
                      <Clock size={16} className="text-amber-600 animate-spin" />
                      Próximo envío disponible en:
                    </span>
                    <span className="bg-amber-200/80 px-2.5 py-1 rounded-full font-bold text-amber-950 font-mono">
                      {cooldownRemaining}s
                    </span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* CAMPO HONEYPOT (Invisible para usuarios reales, trampa para robots) */}
                  <div
                    aria-hidden="true"
                    style={{
                      opacity: 0,
                      position: "absolute",
                      top: 0,
                      left: 0,
                      height: 0,
                      width: 0,
                      zIndex: -1,
                      overflow: "hidden",
                    }}
                  >
                    <label htmlFor="website">Website (dejar vacío)</label>
                    <input
                      type="text"
                      id="website"
                      name="honeypot"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.honeypot}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Nombre */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                        Nombre Completo *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ej: María González"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF97A4] focus:ring-2 focus:ring-[#FF97A4]/20 outline-none transition-all text-sm bg-[#F9F9F9] focus:bg-white"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                        Correo Electrónico *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="ejemplo@correo.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF97A4] focus:ring-2 focus:ring-[#FF97A4]/20 outline-none transition-all text-sm bg-[#F9F9F9] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Teléfono */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                        Teléfono / WhatsApp
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF97A4] focus:ring-2 focus:ring-[#FF97A4]/20 outline-none transition-all text-sm bg-[#F9F9F9] focus:bg-white"
                      />
                    </div>

                    {/* Asunto */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                        Motivo del Mensaje
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF97A4] focus:ring-2 focus:ring-[#FF97A4]/20 outline-none transition-all text-sm bg-[#F9F9F9] focus:bg-white"
                      >
                        <option value="">Selecciona un motivo</option>
                        <option value="Consulta sobre arreglos florales">Consulta sobre arreglos florales</option>
                        <option value="Cotización para evento especial / Boda">Cotización para evento / Boda</option>
                        <option value="Seguimiento de un pedido">Seguimiento de un pedido</option>
                        <option value="Arreglo personalizado">Arreglo personalizado</option>
                        <option value="Otro motivo">Otro motivo</option>
                      </select>
                    </div>
                  </div>

                  {/* Mensaje */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                      Mensaje *
                    </label>
                    <textarea
                      name="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Cuéntanos cómo podemos ayudarte o los detalles de las flores que buscas..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#FF97A4] focus:ring-2 focus:ring-[#FF97A4]/20 outline-none transition-all text-sm bg-[#F9F9F9] focus:bg-white resize-none"
                    />
                  </div>

                  {/* Botón de Envío con Estado y Cooldown */}
                  <button
                    type="submit"
                    disabled={loading || cooldownRemaining > 0}
                    className={`w-full py-4 px-8 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2 shadow-md ${
                      loading || cooldownRemaining > 0
                        ? "bg-gray-400 cursor-not-allowed shadow-none"
                        : "bg-[#D81B60] hover:bg-[#B0004A] hover:shadow-lg shadow-[#D81B60]/20"
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Enviando mensaje...</span>
                      </>
                    ) : cooldownRemaining > 0 ? (
                      <>
                        <Clock size={18} />
                        <span>Espera {cooldownRemaining}s para volver a enviar</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>Enviar Mensaje</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#1A1C1C] text-gray-200 py-10 mt-16 border-t border-gray-800">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">
            © 2026 Flowers For You LLC • Boutique Digital
          </p>
        </div>
      </footer>
    </div>
  );
}
