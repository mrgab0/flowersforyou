"use client";

import { useCart } from "@/components/shop/Cart/CartContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createOrder } from "@/lib/actions/order";

const PaymentLogos = {
    zelle: <svg viewBox="0 0 38 24" width="38" height="24" className="w-8 h-auto"><path d="M0 0h38v24H0z" fill="#6d2277"/><path d="M10 5h18v3l-10 8h10v5H10v-3l10-8H10z" fill="#fff"/></svg>,
    paypal: <svg viewBox="0 0 38 24" width="38" height="24" className="w-8 h-auto"><path d="M0 0h38v24H0z" fill="#003087"/><path d="M10 5h18v14H10z" fill="#009cde"/></svg>,
    gpay: <svg viewBox="0 0 38 24" width="38" height="24" className="w-8 h-auto"><rect width="38" height="24" fill="#4285F4"/><path d="M10 12h18v2H10z" fill="#fff"/></svg>,
    venmo: <svg viewBox="0 0 38 24" width="38" height="24" className="w-8 h-auto"><rect width="38" height="24" fill="#3D95CE"/></svg>,
    efectivo: <svg viewBox="0 0 38 24" width="38" height="24" className="w-8 h-auto"><rect width="38" height="24" fill="#22C55E"/></svg>
};

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("");
  
  // Estados para el auto-llenado controlado
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Cargar datos al montar el componente en el cliente
  useEffect(() => {
    const savedName = localStorage.getItem("customerName") || "";
    const savedPhone = localStorage.getItem("customerPhone") || "";
    const savedAddress = localStorage.getItem("customerAddress") || "";
    
    console.log("DEBUG - Datos cargados de localStorage:", { savedName, savedPhone, savedAddress });
    
    setName(savedName);
    setPhone(savedPhone);
    setAddress(savedAddress);
  }, []);

  const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const paymentMethods = [
    { id: "zelle", label: "Zelle" },
    { id: "paypal", label: "PayPal" },
    { id: "gpay", label: "Google Pay" },
    { id: "venmo", label: "Venmo" },
    { id: "efectivo", label: "Efectivo" },
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData(e.currentTarget);
    const orderData = {
        customerName: data.get("name")?.toString() || "",
        customerPhone: data.get("phone")?.toString() || "",
        address: data.get("address")?.toString() || "",
        paymentMethod: data.get("paymentMethod")?.toString() || "",
        paymentRef: data.get("paymentRef")?.toString() || "N/A",
        items: cartItems,
        total: total
    };

    const existingOrderId = localStorage.getItem("lastOrderId") || undefined;

    const result = await createOrder(orderData, existingOrderId);
    
    if (result.success) {
        clearCart();
        // Guardamos todo para la próxima vez de forma segura como strings puros
        localStorage.setItem("lastOrderId", result.orderId);
        localStorage.setItem("customerName", orderData.customerName);
        localStorage.setItem("customerPhone", orderData.customerPhone);
        localStorage.setItem("customerAddress", orderData.address);
        
        console.log("DEBUG - Datos guardados en localStorage:", {
            lastOrderId: result.orderId,
            customerName: orderData.customerName,
            customerPhone: orderData.customerPhone,
            customerAddress: orderData.address
        });

        router.push(`/checkout/confirmacion?orderId=${result.orderId}`);
    } else {
        alert("Error al procesar pedido");
        setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-20">
      <h1 className="text-4xl font-serif font-bold mb-12">Checkout</h1>
      
      <div className="grid md:grid-cols-2 gap-12">
        {/* Formulario de Datos */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6">Datos del Comprador</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              name="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Nombre Completo" 
              className="w-full p-3 border rounded-xl" 
              required 
            />
            <input 
              name="phone" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="Teléfono" 
              className="w-full p-3 border rounded-xl" 
              required 
            />
            <textarea 
              name="address" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              placeholder="Dirección de Envío" 
              className="w-full p-3 border rounded-xl h-24" 
              required 
            />
            
            <h3 className="font-bold mt-6 mb-4">Información de Pago</h3>
            <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                    <label key={method.id} className={`relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPayment === method.id ? 'border-[#D81B60] bg-[#FDF2F7]' : 'border-gray-200'}`}>
                        <input 
                            type="radio" 
                            name="paymentMethod" 
                            value={method.id} 
                            className="peer sr-only" 
                            required 
                            onChange={() => setSelectedPayment(method.id)}
                        />
                        <div className="mb-2">
                           {PaymentLogos[method.id as keyof typeof PaymentLogos]}
                        </div>
                        <span className="text-xs font-bold uppercase">{method.label}</span>
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full border-2 border-gray-300 peer-checked:border-[#D81B60] peer-checked:bg-[#D81B60]" />
                    </label>
                ))}
            </div>
            
            <input 
                name="paymentRef" 
                placeholder={selectedPayment === 'efectivo' ? "No requerido en efectivo" : "Número de Referencia de Pago"} 
                className="w-full p-3 border rounded-xl mt-4" 
                disabled={selectedPayment === 'efectivo'}
                required={selectedPayment !== 'efectivo'}
            />

            <button type="submit" disabled={loading} className="w-full bg-[#D81B60] text-white py-4 rounded-xl font-bold hover:bg-[#B0004A] disabled:bg-gray-400">
              {loading ? "Procesando..." : "Confirmar Pedido"}
            </button>
          </form>
        </div>

        {/* Resumen del Pedido */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6">Tu Pedido</h2>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.name}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
