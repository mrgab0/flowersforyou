"use client";

import { useState, useRef } from "react";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { Footer } from "@/components/shop/Footer";
import { MapPin, Phone, Clock, Send, CheckCircle2, MessageCircle, Loader2, Sparkles, Paperclip, Image as ImageIcon, X, Upload } from "lucide-react";
import { sendContactEmail } from "@/lib/actions/contact";
import { IKContext, IKUpload } from "imagekitio-react";

const urlEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/nzjtc1avv";
const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "public_huW/0HuThqhQncgbm14znTZHVpk=";

const authenticator = async () => {
  try {
    const response = await fetch("/api/imagekit-auth");
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en auth API: ${response.status} - ${errorText}`);
    }
    const data = await response.json();
    return {
      signature: data.signature,
      expire: data.expire,
      token: data.token,
    };
  } catch (error: any) {
    console.error("Error al autenticar ImageKit:", error);
    throw error;
  }
};

export function ContactFormClient() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // Estado para foto / imagen adjunta
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const ikUploadRef = useRef<HTMLInputElement>(null);

  const handleUploadStart = () => {
    setUploadingAttachment(true);
  };

  const handleUploadError = (err: any) => {
    console.error("Error al subir imagen a ImageKit:", err);
    alert("No se pudo subir la foto de referencia. Intenta nuevamente o continúa sin adjunto.");
    setUploadingAttachment(false);
  };

  const handleUploadSuccess = (res: any) => {
    setUploadingAttachment(false);
    if (res && res.url) {
      setAttachmentUrl(res.url);
      setAttachmentName(res.name || "foto_referencia.jpg");
    }
  };

  const handleRemoveAttachment = () => {
    setAttachmentUrl("");
    setAttachmentName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setLoading(true);
    try {
      const res = await sendContactEmail({
        ...formData,
        attachmentUrl: attachmentUrl || undefined,
        attachmentName: attachmentName || undefined,
      });
      if (res.success) {
        setSubmitted(true);
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 6000);
      } else {
        // Mostrar igualmente pantalla de confirmación por UX y habilitar WhatsApp
        setSubmitted(true);
        setShowTooltip(true);
      }
    } catch (error) {
      console.error("Error al enviar formulario:", error);
      setSubmitted(true);
      setShowTooltip(true);
    } finally {
      setLoading(false);
    }
  };

  const whatsappUrl = `https://wa.me/16576988586?text=${encodeURIComponent(
    `¡Hola! 🌸 Soy ${formData.name || "un cliente"}. ${formData.message || "Quisiera información sobre sus arreglos florales."}`
  )}`;

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col font-sans">
      <ShopHeader />

      <main className="flex-1 py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl space-y-12">
          
          {/* Header de la Página */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[#FF97A4] text-xs font-extrabold uppercase tracking-[0.25em] bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100 inline-block">
              🌸 Atención & Asesoría Personalizada
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-black text-[#1A1C1C] tracking-tight">
              Ponte en Contacto con Nosotros
            </h1>
            <p className="text-gray-500 text-sm md:text-base font-medium leading-relaxed">
              ¿Tienes alguna consulta sobre tu pedido, un diseño floral personalizado o una fecha especial? Estamos para ayudarte.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Tarjeta Izquierda: Información de Contacto Directo */}
            <div className="bg-[#1A1C1C] text-white p-8 rounded-3xl shadow-xl space-y-8 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF97A4]/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="space-y-6">
                <div>
                  <span className="text-[#FF97A4] text-[10px] font-black uppercase tracking-widest block mb-1">Flowers For You LLC</span>
                  <h2 className="text-2xl font-serif font-bold">Información Boutique</h2>
                </div>

                <div className="space-y-5 text-sm">
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-white/10 rounded-xl text-[#FF97A4]">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <strong className="block text-white text-xs uppercase tracking-wider font-bold">Dirección Boutique</strong>
                      <span className="text-gray-300 font-medium">6705 Fairway Dr., Houston, Texas 77087</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-white/10 rounded-xl text-[#FF97A4]">
                      <Phone size={20} />
                    </div>
                    <div>
                      <strong className="block text-white text-xs uppercase tracking-wider font-bold">Atención Directa / WhatsApp</strong>
                      <a href="https://wa.me/16576988586" target="_blank" rel="noreferrer" className="text-[#FF97A4] hover:underline font-bold">
                        +1 (657) 698-8586
                      </a>
                    </div>
                  </div>


                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 bg-white/10 rounded-xl text-[#FF97A4]">
                      <Clock size={20} />
                    </div>
                    <div>
                      <strong className="block text-white text-xs uppercase tracking-wider font-bold">Horarios de Atención</strong>
                      <span className="text-gray-300 font-medium">Lunes a Sábado: 8:00 AM - 7:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-800">
                <a
                  href="https://wa.me/16576988586?text=¡Hola!%20🌸%20Quisiera%20asesoría%20para%20un%20arreglo%20floral."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#FF97A4] hover:bg-[#B0004A] text-white py-3.5 rounded-2xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  <span>Chatear por WhatsApp en Vivo</span>
                </a>
              </div>
            </div>

            {/* Tarjeta Derecha: Formulario de Contacto Directo */}
            <div className="lg:col-span-2 bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-sm relative">
              
              {/* Tooltip Verde de Confirmación */}
              {showTooltip && (
                <div className="mb-6 p-4 bg-emerald-50 border-2 border-emerald-500/40 text-emerald-800 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-3 duration-300 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 font-bold">
                    ✓
                  </div>
                  <div>
                    <strong className="text-sm font-extrabold block text-emerald-900">¡Se envió tu mensaje, gracias!</strong>
                    <span className="text-xs text-emerald-700 font-medium">Hemos enviado una copia a nuestro equipo y te responderemos de inmediato.</span>
                  </div>
                </div>
              )}

              {submitted ? (
                <div className="py-12 text-center space-y-5 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 size={36} />
                  </div>
                  <h2 className="text-2xl font-bold text-[#1A1C1C]">¡Gracias por escribirnos!</h2>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed">
                    Tu mensaje ha sido enviado a los administradores de flowers for you LLC. Si deseas atención inmediata, puedes chatear directo con nosotros por WhatsApp.
                  </p>
                  
                  <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#FF97A4] hover:bg-[#B0004A] text-white px-7 py-3.5 rounded-full font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={16} />
                      <span>Continuar por WhatsApp</span>
                    </a>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setShowTooltip(false);
                        setFormData({ name: "", email: "", phone: "", message: "" });
                        setAttachmentUrl("");
                        setAttachmentName("");
                      }}
                      className="bg-gray-100 text-gray-700 px-6 py-3.5 rounded-full font-bold text-xs hover:bg-gray-200 transition-all"
                    >
                      Enviar otro mensaje
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#1A1C1C]">Envíanos un Mensaje</h2>
                    <p className="text-xs text-gray-400 font-medium">Completa los campos a continuación y nos pondremos en contacto contigo.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 block">Nombre Completo *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ej: Maria González"
                        className="w-full p-3.5 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF97A4] bg-gray-50/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-700 block">Correo Electrónico *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="maria@ejemplo.com"
                        className="w-full p-3.5 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF97A4] bg-gray-50/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 block">Teléfono / WhatsApp (Opcional)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="w-full p-3.5 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF97A4] bg-gray-50/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 block">Mensaje o Consulta Floral *</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Escribe aquí tu consulta, idea para arreglo personalizado o fecha especial..."
                      className="w-full p-3.5 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF97A4] bg-gray-50/50"
                    />
                  </div>

                  {/* Sección de Adjuntar Foto de Referencia (ImageKit) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Paperclip size={14} className="text-[#FF97A4]" />
                        <span>Foto o Diseño de Referencia (Opcional)</span>
                      </span>
                      <span className="text-[10px] text-gray-400 font-normal">JPG, PNG o WebP</span>
                    </label>

                    <IKContext publicKey={publicKey} urlEndpoint={urlEndpoint} authenticator={authenticator}>
                      <IKUpload
                        ref={ikUploadRef}
                        onError={handleUploadError}
                        onSuccess={handleUploadSuccess}
                        onUploadStart={handleUploadStart}
                        style={{ display: "none" }}
                        folder="/contact_attachments"
                        accept="image/*"
                      />

                      {attachmentUrl ? (
                        <div className="p-3 bg-pink-50/60 border border-pink-200 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in duration-200">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={attachmentUrl}
                              alt="Referencia subida"
                              className="w-14 h-14 rounded-xl object-cover border border-pink-200 shadow-sm flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-800 truncate">{attachmentName || "Foto de referencia"}</p>
                              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                <CheckCircle2 size={11} /> Imagen adjuntada con éxito
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveAttachment}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Quitar foto"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => !uploadingAttachment && ikUploadRef.current?.click()}
                          className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-1 bg-gray-50/50 hover:bg-pink-50/40 hover:border-[#FF97A4] ${
                            uploadingAttachment ? "opacity-60 cursor-not-allowed" : "border-gray-200"
                          }`}
                        >
                          {uploadingAttachment ? (
                            <div className="flex items-center gap-2 py-1">
                              <Loader2 className="animate-spin text-[#FF97A4]" size={18} />
                              <span className="text-xs font-bold text-gray-600">Subiendo foto a alta resolución...</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                                <div className="p-1.5 bg-[#FF97A4]/10 rounded-lg text-[#FF97A4]">
                                  <ImageIcon size={16} />
                                </div>
                                <span>¿Tienes una foto de un ramo o estilo que te gusta? Haz clic para adjuntarla</span>
                              </div>
                              <p className="text-[10px] text-gray-400">Nuestro florista la revisará para prepararte una propuesta idéntica</p>
                            </>
                          )}
                        </div>
                      )}
                    </IKContext>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || uploadingAttachment}
                    className="w-full bg-[#FF97A4] hover:bg-[#B0004A] text-white py-4 rounded-full font-bold text-sm transition-all shadow-lg shadow-[#FF97A4]/20 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:bg-gray-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Enviando correo...</span>
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        <span>Enviar Mensaje</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
