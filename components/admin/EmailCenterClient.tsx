"use client";

import { useState, useTransition } from "react";
import {
  Mail,
  Inbox,
  Send,
  PenSquare,
  Search,
  RefreshCw,
  Trash2,
  CheckCircle2,
  User,
  Phone,
  MessageCircle,
  Sparkles,
  Reply,
  AlertCircle,
  Eye,
  EyeOff
} from "lucide-react";
import {
  getEmailsAction,
  sendCustomEmailAction,
  markEmailAsReadAction,
  deleteEmailAction,
} from "@/lib/actions/emails";

interface EmailItem {
  _id: string;
  direction: "inbound" | "outbound";
  type: "contact_form" | "direct_email" | "order_receipt" | "quote" | "delivery_update" | "incoming_reply" | "general";
  from: string;
  to: string[];
  replyTo?: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  status: "sent" | "received" | "failed" | "draft";
  isRead: boolean;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  orderId?: string;
  createdAt: string;
}

interface Props {
  initialMessages: EmailItem[];
  initialTotal: number;
  initialUnread: number;
  initialSentCount: number;
  initialInboxCount: number;
}

const TEMPLATES = [
  {
    id: "blank",
    name: "✉️ Mensaje en Blanco (Personalizado)",
    subject: "Información de Flowers For You LLC",
    body: "<p>Estimado/a cliente,</p><p>Escribimos de Flowers For You LLC con respecto a...</p><p>Quedamos atentos a cualquier duda o detalle.</p><p>Saludos cordiales,<br><strong>Flowers For You LLC</strong></p>",
  },
  {
    id: "quote",
    name: "🌸 Cotización de Arreglo Floral Especial",
    subject: "🌸 Propuesta & Cotización Especial - Flowers For You LLC",
    body: "<p>¡Hola! 🌸 Qué gusto saludarte.</p><p>En base a tu solicitud, hemos preparado la siguiente propuesta de diseño floral:</p><ul><li><strong>Diseño:</strong> Arreglo Floral Exclusivo</li><li><strong>Flores Principales:</strong> Rosas Premium, Lilies y Follaje Especial</li><li><strong>Valor Estimado:</strong> $0.00 USD (Incluye Dedicatoria Impresa y Envoltorio de Lujo)</li></ul><p>¿Te gustaría personalizar algún color, agregar globos, chocolates o dedicatoria?</p><p>Puedes respondernos directamente a este correo o escribirnos por WhatsApp.</p>",
  },
  {
    id: "delivery",
    name: "🚚 Aviso de Entrega: Arreglo Floral en Camino",
    subject: "🚚 ¡Tu Arreglo Floral está en Camino! - Flowers For You LLC",
    body: "<p>¡Excelentes noticias! 🌸🚚</p><p>Queremos informarte que tu pedido floral ha salido de nuestra boutique y <strong>nuestro repartidor ya va en ruta de entrega</strong> a la dirección especificada.</p><p>Tan pronto sea entregado en manos del destinatario, nuestro equipo te lo notificará.</p><p>¡Gracias por confiar en Flowers For You LLC!</p>",
  },
  {
    id: "coupon",
    name: "🎟️ Regalo Especial: Cupón de Descuento Exclusivo",
    subject: "🎁 Un Regalo Especial para Ti: Descuento Exclusivo en Flowers For You",
    body: "<p>¡Hola! 🌸</p><p>Queremos agradecerte por ser parte de la familia <strong>Flowers For You LLC</strong>.</p><p>Como muestra de aprecio, te obsequiamos un <strong>10% de descuento</strong> en tu próxima compra utilizando el cupón:</p><div style='padding: 12px 20px; background: #fff0f3; border-left: 4px solid #ff97a4; font-size: 16px; font-weight: bold; color: #b0004a; margin: 15px 0;'>CUPÓN: FLOWERS10</div><p>Visita nuestro catálogo digital en <a href='https://flowerforyoullc.com' target='_blank' style='color: #FF97A4; font-weight: bold;'>flowerforyoullc.com</a> y aplícalo al finalizar tu compra.</p>",
  },
  {
    id: "thanks",
    name: "💌 Agradecimiento & Seguimiento Post-Venta",
    subject: "🌸 ¡Gracias por tu Compra! - Flowers For You LLC",
    body: "<p>¡Hola! 🌸</p><p>Esperamos que el arreglo floral haya llevado una gran sonrisa y un momento inolvidable.</p><p>Para nosotros cada detalle cuenta. Si tienes un minuto, nos encantaría saber si todo fue de tu total agrado.</p><p>¡Esperamos acompañarte nuevamente en tus momentos más especiales!</p>",
  },
];

export function EmailCenterClient({
  initialMessages,
  initialTotal,
  initialUnread,
  initialSentCount,
  initialInboxCount,
}: Props) {
  const [messages, setMessages] = useState<EmailItem[]>(initialMessages);
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(initialMessages[0] || null);
  const [folder, setFolder] = useState<"inbox" | "sent" | "all">("inbox");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(initialUnread);
  const [isPending, startTransition] = useTransition();

  // Modal de redacción
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [composeForm, setComposeForm] = useState({
    to: "",
    subject: "",
    bodyHtml: TEMPLATES[0].body,
    customerName: "",
    customerPhone: "",
    bccAdmins: true,
  });
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Recargar correos
  const loadEmails = (targetFolder: "inbox" | "sent" | "all" = folder, targetType = typeFilter, query = searchQuery) => {
    startTransition(async () => {
      const res = await getEmailsAction({
        folder: targetFolder,
        type: targetType === "all" ? undefined : targetType,
        search: query,
      });
      if (res.success && res.data) {
        setMessages(res.data);
        if (res.data.length > 0) {
          setSelectedEmail(res.data[0]);
        } else {
          setSelectedEmail(null);
        }
        if (typeof res.unreadCount === "number") setUnreadCount(res.unreadCount);
      }
    });
  };

  const handleFolderChange = (newFolder: "inbox" | "sent" | "all") => {
    setFolder(newFolder);
    setTypeFilter("all");
    loadEmails(newFolder, "all", searchQuery);
  };

  const handleTypeChange = (newType: string) => {
    setTypeFilter(newType);
    loadEmails(folder, newType, searchQuery);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadEmails(folder, typeFilter, searchQuery);
  };

  const handleSelectEmail = async (email: EmailItem) => {
    setSelectedEmail(email);
    if (!email.isRead && email.direction === "inbound") {
      setMessages((prev) => prev.map((m) => (m._id === email._id ? { ...m, isRead: true } : m)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      await markEmailAsReadAction(email._id, true);
    }
  };

  const handleToggleRead = async (email: EmailItem) => {
    const nextState = !email.isRead;
    setMessages((prev) => prev.map((m) => (m._id === email._id ? { ...m, isRead: nextState } : m)));
    if (email.direction === "inbound") {
      setUnreadCount((prev) => (nextState ? Math.max(0, prev - 1) : prev + 1));
    }
    if (selectedEmail?._id === email._id) {
      setSelectedEmail({ ...selectedEmail, isRead: nextState });
    }
    await markEmailAsReadAction(email._id, nextState);
  };

  const handleDelete = async (emailId: string) => {
    if (!confirm("¿Estás seguro de eliminar este registro de correo?")) return;
    setMessages((prev) => prev.filter((m) => m._id !== emailId));
    if (selectedEmail?._id === emailId) {
      const remaining = messages.filter((m) => m._id !== emailId);
      setSelectedEmail(remaining[0] || null);
    }
    await deleteEmailAction(emailId);
  };

  // Abrir redactor prellenado para responder
  const handleReply = (email: EmailItem) => {
    const replyTarget = email.replyTo || email.customerEmail || (email.direction === "inbound" ? email.from : email.to[0]);
    setComposeForm({
      to: replyTarget,
      subject: email.subject.startsWith("Re:") ? email.subject : ("Re: " + email.subject),
      bodyHtml: "<p>¡Hola " + (email.customerName || "") + "! 🌸</p><p>En respuesta a tu consulta...</p><hr style='border: 0; border-top: 1px solid #eee; margin: 15px 0;'><blockquote style='color: #666; font-size: 12px; margin: 0; padding-left: 10px; border-left: 3px solid #ff97a4;'><strong>Mensaje Previo:</strong><br>" + (email.bodyHtml || email.bodyText || "") + "</blockquote>",
      customerName: email.customerName || "",
      customerPhone: email.customerPhone || "",
      bccAdmins: true,
    });
    setIsComposeOpen(true);
  };

  // Aplicar plantilla
  const handleApplyTemplate = (templateId: string) => {
    const tpl = TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;
    setComposeForm((prev) => ({
      ...prev,
      subject: prev.subject || tpl.subject,
      bodyHtml: tpl.body,
    }));
  };

  // Enviar correo
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeForm.to.trim() || !composeForm.subject.trim() || !composeForm.bodyHtml.trim()) {
      alert("Por favor completa destinatario, asunto y mensaje.");
      return;
    }

    setSending(true);
    setFeedbackMsg(null);

    try {
      const res = await sendCustomEmailAction({
        to: composeForm.to,
        subject: composeForm.subject,
        bodyHtml: composeForm.bodyHtml,
        customerName: composeForm.customerName,
        customerPhone: composeForm.customerPhone,
        customerEmail: composeForm.to,
        bccAdmins: composeForm.bccAdmins,
      });

      if (res.success) {
        setFeedbackMsg({ type: "success", text: "¡Correo enviado con éxito desde sales@flowerforyoullc.com!" });
        setTimeout(() => {
          setIsComposeOpen(false);
          setFeedbackMsg(null);
          setComposeForm({
            to: "",
            subject: "",
            bodyHtml: TEMPLATES[0].body,
            customerName: "",
            customerPhone: "",
            bccAdmins: true,
          });
          loadEmails();
        }, 1500);
      } else {
        setFeedbackMsg({ type: "error", text: res.error || "Error al enviar correo." });
      }
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: err?.message || "Error inesperado de conexión." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#181922] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col min-h-[750px]">
      
      {/* Barra Superior del Centro de Correos */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-pink-100 dark:bg-pink-950/60 rounded-2xl text-[#FF97A4]">
            <Mail size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white font-serif">
                Centro de Correos & Webmail
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300">
                sales@flowerforyoullc.com
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
              Administra mensajes de clientes, envía cotizaciones y supervisa el flujo de correos corporativos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => {
              setComposeForm({
                to: "",
                subject: "",
                bodyHtml: TEMPLATES[0].body,
                customerName: "",
                customerPhone: "",
                bccAdmins: true,
              });
              setIsComposeOpen(true);
            }}
            className="flex-1 md:flex-initial bg-[#FF97A4] hover:bg-[#B0004A] text-white px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md shadow-pink-500/20 flex items-center justify-center gap-2 transition-all hover:scale-105"
          >
            <PenSquare size={16} />
            <span>Redactar Correo</span>
          </button>

          <button
            onClick={() => loadEmails()}
            disabled={isPending}
            title="Refrescar lista"
            className="p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-2xl transition-all"
          >
            <RefreshCw size={16} className={isPending ? "animate-spin text-[#FF97A4]" : ""} />
          </button>
        </div>
      </div>

      {/* Cuerpo Principal: Sidebar de Carpetas + Lista de Correos + Visor */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        
        {/* Columna Izquierda: Carpetas y Filtros (3 columnas) */}
        <div className="lg:col-span-3 border-r border-gray-200 dark:border-gray-800 p-4 space-y-4 bg-gray-50/30 dark:bg-gray-900/10">
          
          <div className="space-y-1">
            <button
              onClick={() => handleFolderChange("inbox")}
              className={"w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all " + (
                folder === "inbox" && typeFilter === "all"
                  ? "bg-pink-100 dark:bg-pink-950/80 text-[#B0004A] dark:text-pink-300 border border-pink-300 dark:border-pink-800"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Inbox size={16} />
                <span>Bandeja de Entrada</span>
              </div>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FF97A4] text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleFolderChange("sent")}
              className={"w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all " + (
                folder === "sent"
                  ? "bg-pink-100 dark:bg-pink-950/80 text-[#B0004A] dark:text-pink-300 border border-pink-300 dark:border-pink-800"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Send size={16} />
                <span>Enviados</span>
              </div>
            </button>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-3 block mb-1">
              Filtrar por Categoría
            </span>

            <button
              onClick={() => handleTypeChange("contact_form")}
              className={"w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all " + (
                typeFilter === "contact_form"
                  ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
              )}
            >
              <span>🌸</span>
              <span>Formularios Web</span>
            </button>

            <button
              onClick={() => handleTypeChange("order_receipt")}
              className={"w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all " + (
                typeFilter === "order_receipt"
                  ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
              )}
            >
              <span>🛍️</span>
              <span>Recibos de Órdenes</span>
            </button>

            <button
              onClick={() => handleTypeChange("direct_email")}
              className={"w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all " + (
                typeFilter === "direct_email"
                  ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50"
              )}
            >
              <span>✉️</span>
              <span>Mensajes Directos</span>
            </button>
          </div>

          <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar correo o cliente..."
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
              />
              <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            </form>
          </div>

          <div className="p-3 bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-900/40 rounded-2xl text-[11px] text-gray-600 dark:text-gray-400 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#B0004A] dark:text-pink-300">
              <Sparkles size={13} />
              <span>Notificación Triple Activa</span>
            </div>
            <p>
              Toda orden y mensaje se entrega en copia simultánea a los 3 correos de administración.
            </p>
          </div>
        </div>

        {/* Columna Central: Lista de Mensajes (4 columnas) */}
        <div className="lg:col-span-4 border-r border-gray-200 dark:border-gray-800 overflow-y-auto max-h-[700px] divide-y divide-gray-100 dark:divide-gray-800">
          {messages.length === 0 ? (
            <div className="p-12 text-center text-gray-400 space-y-2">
              <Mail size={32} className="mx-auto text-gray-300 dark:text-gray-600" />
              <p className="text-xs font-semibold">No se encontraron correos en esta vista</p>
            </div>
          ) : (
            messages.map((email) => {
              const isSelected = selectedEmail?._id === email._id;
              const formattedDate = new Date(email.createdAt).toLocaleDateString("es-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={email._id}
                  onClick={() => handleSelectEmail(email)}
                  className={"p-4 cursor-pointer transition-all flex items-start gap-3 " + (
                    isSelected
                      ? "bg-pink-50/80 dark:bg-pink-950/40 border-l-4 border-[#FF97A4]"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/40"
                  ) + " " + (!email.isRead && email.direction === "inbound" ? "font-bold bg-amber-50/40 dark:bg-amber-950/20" : "")}
                >
                  <div className="pt-1">
                    {!email.isRead && email.direction === "inbound" ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF97A4]" title="No leído" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-900 dark:text-white truncate font-bold">
                        {email.customerName || (email.direction === "inbound" ? email.from.split("<")[0].trim() || email.from : email.to.join(", "))}
                      </span>
                      <span className="text-[10px] text-gray-400 font-normal whitespace-nowrap">
                        {formattedDate}
                      </span>
                    </div>

                    <div className="text-xs text-gray-700 dark:text-gray-300 truncate">
                      {email.subject}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={"text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider " + (
                        email.type === "contact_form"
                          ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                          : email.type === "order_receipt"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      )}>
                        {email.type === "contact_form" ? "Formulario" : email.type === "order_receipt" ? "Recibo" : "Directo"}
                      </span>
                      {email.customerPhone && (
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                          <Phone size={10} />
                          <span>WhatsApp</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Columna Derecha: Visor de Correo Seleccionado (5 columnas) */}
        <div className="lg:col-span-5 p-6 flex flex-col justify-between overflow-y-auto max-h-[700px] bg-white dark:bg-[#181922]">
          {selectedEmail ? (
            <div className="space-y-6">
              
              {/* Header del Mensaje */}
              <div className="space-y-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white font-serif leading-tight">
                    {selectedEmail.subject}
                  </h2>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleRead(selectedEmail)}
                      title={selectedEmail.isRead ? "Marcar como no leído" : "Marcar como leído"}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 transition-colors"
                    >
                      {selectedEmail.isRead ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={() => handleDelete(selectedEmail._id)}
                      title="Eliminar mensaje"
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-950 text-gray-400 hover:text-red-600 rounded-xl transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-gray-500 dark:text-gray-400">De: </strong>
                      <span className="text-gray-900 dark:text-white font-bold">{selectedEmail.from}</span>
                    </div>
                    <span className="text-gray-400 text-[11px]">
                      {new Date(selectedEmail.createdAt).toLocaleString("es-US")}
                    </span>
                  </div>

                  <div>
                    <strong className="text-gray-500 dark:text-gray-400">Para: </strong>
                    <span className="text-gray-900 dark:text-white">{selectedEmail.to.join(", ")}</span>
                  </div>

                  {selectedEmail.customerName && (
                    <div>
                      <strong className="text-gray-500 dark:text-gray-400">Cliente: </strong>
                      <span className="text-gray-900 dark:text-white font-semibold">{selectedEmail.customerName}</span>
                    </div>
                  )}

                  {selectedEmail.customerPhone && (
                    <div>
                      <strong className="text-gray-500 dark:text-gray-400">Teléfono: </strong>
                      <a
                        href={"https://wa.me/" + selectedEmail.customerPhone.replace(/\D/g, "")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                      >
                        {selectedEmail.customerPhone} (WhatsApp)
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de Acción Rápida */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleReply(selectedEmail)}
                  className="bg-[#FF97A4] hover:bg-[#B0004A] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Reply size={14} />
                  <span>Responder por Correo</span>
                </button>

                {selectedEmail.customerPhone && (
                  <a
                    href={"https://wa.me/" + selectedEmail.customerPhone.replace(/\D/g, "") + "?text=" + encodeURIComponent(
                      "¡Hola " + (selectedEmail.customerName || "") + "! 🌸 Te contactamos de Flowers For You LLC en relación a tu consulta."
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#25D366] hover:bg-[#1EBE5B] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <MessageCircle size={14} />
                    <span>Contactar por WhatsApp</span>
                  </a>
                )}
              </div>

              {/* Contenido Renderizado del Correo */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
                />
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-8 space-y-3">
              <Mail size={40} className="text-gray-300 dark:text-gray-700" />
              <p className="text-sm font-semibold">Selecciona un correo de la lista para ver sus detalles</p>
            </div>
          )}
        </div>

      </div>

      {/* Modal para Redactar Correo */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#181922] w-full max-w-2xl rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-5 bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-pink-100 dark:bg-pink-950/60 rounded-xl text-[#FF97A4]">
                  <PenSquare size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white font-serif">
                    Redactar Correo Oficial
                  </h3>
                  <span className="text-[10px] text-gray-500 font-medium block">
                    Remitente: &quot;Flowers For You LLC&quot; &lt;sales@flowerforyoullc.com&gt;
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsComposeOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-700 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="p-6 space-y-4">
              
              {/* Selector de Plantillas */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                  Plantilla Rápida
                </label>
                <select
                  onChange={(e) => handleApplyTemplate(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                >
                  {TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                    Destinatario (Para:) *
                  </label>
                  <input
                    type="email"
                    required
                    value={composeForm.to}
                    onChange={(e) => setComposeForm({ ...composeForm, to: e.target.value })}
                    placeholder="cliente@ejemplo.com"
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                    Nombre del Cliente (Opcional)
                  </label>
                  <input
                    type="text"
                    value={composeForm.customerName}
                    onChange={(e) => setComposeForm({ ...composeForm, customerName: e.target.value })}
                    placeholder="Ej: Maria Gómez"
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                  Asunto del Correo *
                </label>
                <input
                  type="text"
                  required
                  value={composeForm.subject}
                  onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                  placeholder="Ej: Cotización de Arreglo Floral..."
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                  Cuerpo del Mensaje (HTML / Texto) *
                </label>
                <textarea
                  required
                  rows={7}
                  value={composeForm.bodyHtml}
                  onChange={(e) => setComposeForm({ ...composeForm, bodyHtml: e.target.value })}
                  placeholder="Escribe aquí el contenido del correo..."
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-sans text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="bccAdmins"
                  checked={composeForm.bccAdmins}
                  onChange={(e) => setComposeForm({ ...composeForm, bccAdmins: e.target.checked })}
                  className="rounded border-gray-300 text-[#FF97A4] focus:ring-[#FF97A4]"
                />
                <label htmlFor="bccAdmins" className="text-xs text-gray-600 dark:text-gray-400 font-medium cursor-pointer">
                  Enviar copia simultánea a los 3 administradores (iirockalonso, hernandezmiriamcalifornia, flowersforyou403)
                </label>
              </div>

              {feedbackMsg && (
                <div
                  className={"p-3 rounded-xl text-xs font-bold flex items-center gap-2 " + (
                    feedbackMsg.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                      : "bg-red-50 text-red-800 border border-red-300"
                  )}
                >
                  {feedbackMsg.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{feedbackMsg.text}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="bg-[#FF97A4] hover:bg-[#B0004A] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:bg-gray-300"
                >
                  {sending ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Enviar Correo</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
