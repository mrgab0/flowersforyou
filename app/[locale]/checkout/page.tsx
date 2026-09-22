"use client";

export const dynamic = "force-dynamic";

import { useCart } from "@/components/shop/Cart/CartContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createOrder } from "@/lib/actions/order";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { validateCoupon, checkAutoLaunchCoupon } from "@/lib/actions/coupon";
import { getPaymentConfigs } from "@/lib/actions/paymentConfig";
import { logAnalyticsEventAction } from "@/lib/actions/analytics";
import { CustomerBiometricModal } from "@/components/auth/CustomerBiometricModal";
import { ShieldCheck, CheckCircle2, Ticket, Sparkles, Tag, AlertCircle, Copy, ExternalLink, QrCode, MessageSquare, Heart, Fingerprint, MapPin } from "lucide-react";

const PaymentLogos = {
  zelle: <svg viewBox="0 0 38 24" width="38" height="24" className="w-8 h-auto"><path d="M0 0h38v24H0z" fill="#6d2277"/><path d="M10 5h18v3l-10 8h10v5H10v-3l10-8H10z" fill="#fff"/></svg>,
  cashapp: <svg viewBox="0 0 38 24" width="38" height="24" className="w-8 h-auto"><rect width="38" height="24" fill="#00D632"/><path d="M19 6v12M14 9h7a2 2 0 0 1 0 4h-4a2 2 0 0 0 0 4h6" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>,
  paypal: <svg viewBox="0 0 38 24" width="38" height="24" className="w-8 h-auto"><path d="M0 0h38v24H0z" fill="#003087"/><path d="M10 5h18v14H10z" fill="#009cde"/></svg>,
  square: <svg viewBox="0 0 38 24" width="38" height="24" className="w-8 h-auto"><rect width="38" height="24" fill="#000000" rx="4"/><rect x="11" y="7" width="16" height="10" rx="2" fill="#fff"/></svg>,
  efectivo: <svg viewBox="0 0 38 24" width="38" height="24" className="w-8 h-auto"><rect width="38" height="24" fill="#22C55E" rx="4"/><circle cx="19" cy="12" r="5" fill="#fff"/></svg>
};

export default function CheckoutPage() {
  const { cartItems, clearCart, updateAddonCustomText } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Estados para datos de contacto y entrega
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [cardMessage, setCardMessage] = useState("");

  // Estados para Cupones y Pagos
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [autoLaunchInfo, setAutoLaunchInfo] = useState<{ isAvailable: boolean; orderIndex?: number; coupon?: any } | null>(null);
  
  // Datos de Configuración de Cuentas de Pago
  const [paymentConfigs, setPaymentConfigs] = useState<Record<string, any>>({});
  const [copiedText, setCopiedText] = useState("");

  useEffect(() => {
    async function loadConfigsAndCoupon() {
      const payRes = await getPaymentConfigs();
      if (payRes.success && payRes.data) {
        setPaymentConfigs(payRes.data);
      }

      const autoRes = await checkAutoLaunchCoupon();
      if (autoRes.success && autoRes.isAutoAvailable && autoRes.coupon) {
        setAutoLaunchInfo({
          isAvailable: true,
          orderIndex: autoRes.orderIndex,
          coupon: autoRes.coupon
        });
        setAppliedCoupon(autoRes.coupon);
        setCouponSuccess(`🎁 ¡Felicidades! Eres el cliente #${autoRes.orderIndex} de inauguración. Cupón del ${autoRes.coupon.discountValue}% OFF aplicado automáticamente.`);
      }
    }
    loadConfigsAndCoupon();

    const savedName = localStorage.getItem("customerName") || "";
    const savedEmail = localStorage.getItem("customerEmail") || "";
    const savedPhone = localStorage.getItem("customerPhone") || "";
    const savedAddress = localStorage.getItem("customerAddress") || "";
    
    setName(savedName);
    setEmail(savedEmail);
    setPhone(savedPhone);
    setAddress(savedAddress);
    setIsMounted(true);

    if (cartItems.length > 0) {
      logAnalyticsEventAction({
        type: "cart_abandon",
        path: "/checkout",
        customerName: savedName,
        customerPhone: savedPhone,
        price: subtotal,
        cartItems: cartItems.map((i) => ({ productId: i.id, name: i.name, price: i.price, image: i.image }))
      });
    }
  }, [cartItems]);

  const handleCopyText = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(""), 3000);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Cálculo del Descuento del Cupón
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      discountAmount = (subtotal * appliedCoupon.discountValue) / 100;
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  // Subtotal Imponible tras Descuento
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);

  // Impuestos de Ley (Sales Tax 8.25%) sumados Adicionalmente al Subtotal Imponible
  const taxAmount = Math.round(taxableSubtotal * 0.0825 * 100) / 100;

  // Total Final = Subtotal Imponible + Sales Tax (8.25%)
  const finalTotal = taxableSubtotal + taxAmount;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    if (!couponInput.trim()) return;

    const res = await validateCoupon(couponInput, subtotal);
    if (res.success && res.coupon) {
      setAppliedCoupon(res.coupon);
      setCouponSuccess(`¡Cupón "${res.coupon.code}" aplicado con éxito!`);
      setCouponInput("");
    } else {
      setCouponError(res.error || "Código de cupón inválido.");
    }
  };

  const rawPaymentMethods = [
    { id: "zelle", label: "Zelle" },
    { id: "cashapp", label: "CashApp" },
    { id: "paypal", label: "PayPal" },
    { id: "square", label: "Square (Tarjeta)" },
    { id: "efectivo", label: "Efectivo" },
  ];

  const paymentMethods = rawPaymentMethods.filter((method) => {
    const cfg = paymentConfigs[method.id];
    return !cfg || cfg.isActive !== false;
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    const data = new FormData(e.currentTarget);
    const customerAddress = (data.get("address")?.toString() || address).trim();
    const googleMapsUrl = customerAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customerAddress)}`
      : "https://maps.google.com";

    const orderData = {
      customerName: data.get("name")?.toString() || name,
      customerEmail: data.get("email")?.toString() || email,
      customerPhone: data.get("phone")?.toString() || phone,
      address: customerAddress,
      destLat: 29.7027,
      destLng: -95.2936,
      distanceMiles: 0,
      googleMapsUrl: googleMapsUrl,
      deliveryMethod: "Envío a Domicilio",
      deliveryFee: 0,
      couponCode: appliedCoupon ? appliedCoupon.code : "",
      discountAmount: discountAmount,
      taxAmount: taxAmount,
      cardMessage: data.get("cardMessage")?.toString() || cardMessage || "",
      paymentMethod: data.get("paymentMethod")?.toString() || "",
      paymentRef: data.get("paymentRef")?.toString() || "N/A",
      items: cartItems,
      total: finalTotal
    };

    const existingOrderId = localStorage.getItem("lastOrderId") || undefined;
    const result = await createOrder(orderData, existingOrderId);
    
    if (result.success) {
      clearCart();
      localStorage.setItem("lastOrderId", result.orderId);
      localStorage.setItem("customerName", orderData.customerName);
      localStorage.setItem("customerEmail", orderData.customerEmail);
      localStorage.setItem("customerPhone", orderData.customerPhone);
      localStorage.setItem("customerAddress", orderData.address);

      router.push(`/checkout/confirmacion?orderId=${result.orderId}`);
    } else {
      alert("Error al procesar pedido");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      <ShopHeader />

      <main className="flex-1 py-10 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-6 gap-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-black text-[#1A1C1C]">Finalizar Pedido</h1>
              <p className="text-xs text-gray-400">Completa tus datos de entrega y método de pago</p>
            </div>
            <span className="bg-green-50 text-green-700 text-xs font-bold px-3.5 py-1.5 rounded-full border border-green-200 flex items-center gap-1.5">
              <ShieldCheck size={16} /> Pago Seguro Encriptado
            </span>
          </div>
          
          <div className="grid md:grid-cols-12 gap-8">
            
            {/* FORMULARIO DE DATOS */}
            <div className="md:col-span-7 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
              
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Datos de Contacto y Dirección de Entrega */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b pb-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                      1. Información del Cliente & Dirección
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsBioModalOpen(true)}
                      className="bg-pink-50 hover:bg-pink-100 text-[#FF97A4] border border-pink-200 px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Fingerprint size={14} />
                      <span>Ingresar con Huella 👆</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <input 
                      name="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="Nombre y Apellido Completo *" 
                      className="w-full p-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4] font-medium" 
                      required 
                    />
                    <input 
                      type="email"
                      name="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="Correo Electrónico del Cliente *" 
                      className="w-full p-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4] font-medium" 
                      required 
                    />
                    <input 
                      name="phone" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="Teléfono / WhatsApp de Contacto *" 
                      className="w-full p-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4] font-medium" 
                      required 
                    />
                    
                    {/* Campo Limpio de Dirección de Entrega */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                        <MapPin size={14} className="text-[#FF97A4]" /> Dirección de Entrega Completa *
                      </label>
                      <textarea 
                        name="address" 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)} 
                        placeholder="Ej: 10827 Kyler Oaks Pl, Houston, TX 77043 (Incluye calle, número, apto/suite, ciudad y código postal) *" 
                        className="w-full p-3.5 border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF97A4] bg-white text-gray-800 h-24 resize-none leading-relaxed" 
                        required 
                      />
                      <p className="text-[11px] text-gray-400 italic">
                        💡 El costo de envío será calculado por el vendedor y coordinado para su aprobación.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Mensaje para la Tarjeta de Dedicatoria Incluida */}
                <div className="space-y-3 bg-pink-50/60 p-4 rounded-2xl border border-pink-100/80">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[#FF97A4] flex items-center gap-1.5">
                      <Heart size={14} className="text-[#FF97A4] fill-[#FF97A4]" /> 2. Tarjeta de Dedicatoria Impresa (Gratis Incluida)
                    </h2>
                    <span className="bg-[#FF97A4] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                      Incluido 🎁
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    Escribe a continuación el mensaje especial que deseas que imprimamos en la tarjeta de regalo de tu arreglo floral:
                  </p>
                  <textarea
                    name="cardMessage"
                    value={cardMessage}
                    onChange={(e) => setCardMessage(e.target.value)}
                    placeholder="Ej: ¡Feliz Cumpleaños María! Deseo que este día esté lleno de amor y alegría. Con todo mi cariño, Carlos. ❤️"
                    className="w-full p-3.5 border border-pink-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF97A4] h-24 bg-white text-gray-800"
                  />
                </div>

                {/* 3. Información de Pago */}
                <div className="space-y-4 pt-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 border-b pb-2">
                    3. Método de Pago
                  </h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {paymentMethods.map((method) => (
                      <label 
                        key={method.id} 
                        className={`relative flex flex-col items-center p-3.5 border-2 rounded-2xl cursor-pointer transition-all ${
                          selectedPayment === method.id ? 'border-[#FF97A4] bg-[#FF97A4]/5 shadow-sm' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value={method.id} 
                          className="peer sr-only" 
                          required 
                          onChange={() => setSelectedPayment(method.id)}
                        />
                        <div className="mb-1.5">
                          {PaymentLogos[method.id as keyof typeof PaymentLogos]}
                        </div>
                        <span className="text-xs font-bold text-gray-700 uppercase">{method.label}</span>
                      </label>
                    ))}
                  </div>

                  {/* TARJETA DESPLEGABLE CON DATOS DE PAGO Y CÓDIGO QR */}
                  {selectedPayment && (
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4 animate-in fade-in duration-300">
                      {(() => {
                        const cfg = paymentConfigs[selectedPayment] || {};
                        const detailToCopy = cfg.accountDetail || cfg.linkUrl || "";

                        return (
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-bold text-sm text-gray-800 uppercase flex items-center gap-1.5">
                                  <span>Instrucciones de Pago: {selectedPayment}</span>
                                </h3>
                                {cfg.accountHolder && (
                                  <p className="text-xs text-gray-600 mt-0.5">
                                    Titular: <strong className="text-gray-900">{cfg.accountHolder}</strong>
                                  </p>
                                )}
                              </div>
                              {PaymentLogos[selectedPayment as keyof typeof PaymentLogos]}
                            </div>

                            {/* Datos a Copiar */}
                            {detailToCopy && (
                              <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between gap-2">
                                <div className="text-xs font-mono text-gray-700 truncate">
                                  <span className="text-gray-400 block text-[10px] uppercase font-sans">Dato de Pago / Cuenta:</span>
                                  <strong>{detailToCopy}</strong>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(detailToCopy)}
                                  className="bg-pink-50 hover:bg-pink-100 text-[#FF97A4] border border-pink-200 p-2 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors flex-shrink-0"
                                >
                                  <Copy size={13} />
                                  <span>{copiedText === detailToCopy ? "¡Copiado!" : "Copiar"}</span>
                                </button>
                              </div>
                            )}

                            {/* Enlace de Pago Externo si existe */}
                            {cfg.linkUrl && (
                              <div>
                                <a
                                  href={cfg.linkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                                >
                                  <ExternalLink size={13} /> Abrir Enlace Directo de {selectedPayment.toUpperCase()}
                                </a>
                              </div>
                            )}

                            {/* Código QR si está configurado */}
                            {cfg.qrCodeImage && (
                              <div className="text-center space-y-2 pt-2 border-t border-gray-200/60">
                                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-center gap-1">
                                  <QrCode size={13} className="text-[#FF97A4]" /> Escanea para Pagar desde tu Móvil
                                </span>
                                <div className="inline-block p-2 bg-white rounded-2xl border shadow-sm">
                                  <img 
                                    src={cfg.qrCodeImage} 
                                    alt={`QR de ${selectedPayment}`} 
                                    className="w-36 h-36 object-contain rounded-xl mx-auto" 
                                  />
                                </div>
                              </div>
                            )}

                            {/* Campo para ingresar el número de referencia del pago */}
                            <div className="pt-2 border-t border-gray-200/60 space-y-1.5">
                              <label className="text-xs font-bold text-gray-700 block">
                                Número de Referencia / Comprobante de Transacción:
                              </label>
                              <input
                                name="paymentRef"
                                type="text"
                                placeholder="Ej: ZELLE-849204, Ref #123456 o Efectivo al Recibir"
                                className="w-full p-3 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#FF97A4] bg-white"
                                required
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-[#1A1C1C] hover:bg-black text-white p-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all disabled:opacity-50 shadow-lg shadow-black/10 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Procesando tu Pedido...</span>
                  ) : (
                    <span>Completar Pedido • ${finalTotal.toFixed(2)} USD</span>
                  )}
                </button>
              </form>
            </div>

            {/* RESUMEN DE COMPRA */}
            <div className="md:col-span-5 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 h-fit space-y-6">
              <h2 className="text-xl font-serif font-black text-[#1A1C1C] border-b pb-3">Resumen de Tu Pedido</h2>
              
              <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${JSON.stringify(item.addons)}`} className="flex justify-between items-start text-sm border-b pb-3 border-gray-50">
                    <div className="flex items-start gap-3">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover border flex-shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-[#1A1C1C] block">{item.name}</span>
                        <span className="text-xs text-gray-400 font-medium block">Cant: {item.quantity}</span>
                        
                        {item.addons && item.addons.length > 0 && (
                          <div className="mt-1 space-y-1 border-t border-gray-100 pt-1">
                            {item.addons.map((add: any, idx: number) => (
                              <div key={idx} className="text-[10px]">
                                <span className="block text-[#FF97A4] font-bold">
                                  ✨ {add.name || add.value} {add.price ? `(+$${add.price.toFixed(2)})` : ''}
                                </span>
                                {add.customText ? (
                                  <div className="bg-pink-50 p-1.5 rounded-md text-gray-800 font-medium my-0.5 border border-pink-100 flex items-start gap-1">
                                    <MessageSquare size={11} className="text-[#FF97A4] flex-shrink-0 mt-0.5" />
                                    <span><em>"{add.customText}"</em></span>
                                  </div>
                                ) : (
                                  updateAddonCustomText && (
                                    <input
                                      type="text"
                                      placeholder="Añadir dedicatoria para este adicional..."
                                      onChange={(e) => updateAddonCustomText(item.id, add.addonId, e.target.value)}
                                      className="mt-0.5 p-1 text-[9px] border rounded w-full focus:outline-none focus:ring-1 focus:ring-[#FF97A4]"
                                    />
                                  )
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-gray-800 flex-shrink-0 ml-2">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* CAJA DE CUPÓN DE DESCUENTO */}
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Ticket size={14} className="text-[#FF97A4]" /> ¿Tienes un Cupón de Descuento?
                </label>

                {couponSuccess && (
                  <div className="bg-green-50 text-green-700 text-xs p-3 rounded-xl border border-green-200 flex items-start gap-2">
                    <Sparkles size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{couponSuccess}</span>
                  </div>
                )}

                {couponError && (
                  <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200 flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                    <span>{couponError}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Ej: INAUGURACION, BIENVENIDA"
                    className="flex-1 p-2.5 border rounded-xl text-xs uppercase font-bold focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="bg-[#1A1C1C] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#FF97A4] transition-colors"
                  >
                    Aplicar
                  </button>
                </div>
              </div>

              {/* DESGLOSE TRANSPARENTE DE TOTALES */}
              <div className="space-y-2.5 pt-4 border-t border-gray-100 text-sm">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Subtotal Arreglos & Adicionales</span>
                  <span className="font-bold text-gray-800">${subtotal.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span className="flex items-center gap-1">
                      <Tag size={14} /> Descuento Cupón ({appliedCoupon.code})
                    </span>
                    <span>-${discountAmount.toFixed(2)} USD</span>
                  </div>
                )}

                <div className="flex justify-between text-purple-700 font-medium bg-purple-50 p-2.5 rounded-xl border border-purple-100">
                  <span className="font-bold flex items-center gap-1 text-xs">
                    🏛️ Impuestos de Ley (Sales Tax 8.25%)
                  </span>
                  <span className="font-extrabold text-purple-800">+${taxAmount.toFixed(2)} USD</span>
                </div>

                <div className="flex justify-between items-center text-gray-600 font-medium">
                  <span>Costo de Envío / Despacho</span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                    Sujeto a revisión del vendedor
                  </span>
                </div>

                <div className="border-t pt-3 flex justify-between font-extrabold text-xl text-[#1A1C1C]">
                  <span>Total Final</span>
                  <span className="text-[#FF97A4]">${finalTotal.toFixed(2)} USD</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Modal Biométrico de Huella / Passkeys para el Cliente */}
      <CustomerBiometricModal
        isOpen={isBioModalOpen}
        onClose={() => setIsBioModalOpen(false)}
        onSuccess={(cust) => {
          if (cust.email) setEmail(cust.email);
          if (cust.name) setName(cust.name);
          if (cust.phone) setPhone(cust.phone);
        }}
      />
    </div>
  );
}
