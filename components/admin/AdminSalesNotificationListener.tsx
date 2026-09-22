"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAllOrdersAction } from "@/lib/actions/order";
import { Sparkles, ShoppingBag, ArrowRight, X, DollarSign, User, PackageCheck, Flame } from "lucide-react";

export function AdminSalesNotificationListener() {
  const router = useRouter();
  const [latestOrder, setLatestOrder] = useState<any | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isHovered, setIsHovered] = useState(false);

  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const isInitialRun = useRef(true);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sintetizador de audio Web Audio API para simular timbre de caja registradora ("Cha-Ching! 🔔💰")
  const playCashRegisterSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      const playCoin = (freq: number, start: number, duration: number, gainVal: number = 0.25) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(gainVal, ctx.currentTime + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Acorde alegre de éxito ascendente (C5 -> E5 -> G5 -> C6)
      playCoin(523.25, 0.00, 0.25, 0.20); // C5
      playCoin(659.25, 0.08, 0.25, 0.25); // E5
      playCoin(783.99, 0.16, 0.35, 0.30); // G5
      playCoin(1046.50, 0.24, 0.60, 0.35); // C6 - Campana brillante final
      playCoin(1318.51, 0.32, 0.50, 0.20); // E6 - Brillo adicional
    } catch (e) {
      console.warn("Audio play blocked by browser policy:", e);
    }
  };

  const triggerNotification = (order: any) => {
    setLatestOrder(order);
    setShowToast(true);
    setProgress(100);
    playCashRegisterSound();
  };

  // Temporizador con barra de progreso de 12 segundos
  useEffect(() => {
    if (!showToast) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      return;
    }

    if (isHovered) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const duration = 12000; // 12 segundos
    const step = 100;
    const decrement = (step / duration) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 1) {
          setShowToast(false);
          return 0;
        }
        return prev - decrement;
      });
    }, step);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [showToast, isHovered]);

  useEffect(() => {
    let intervalId: any;

    async function checkForNewOrders() {
      try {
        const res = await getAllOrdersAction();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const fetchedOrders = res.data;

          if (isInitialRun.current) {
            fetchedOrders.forEach((o: any) => knownOrderIdsRef.current.add(o.orderId || o._id));
            isInitialRun.current = false;
            return;
          }

          const newOrders = fetchedOrders.filter(
            (o: any) => !knownOrderIdsRef.current.has(o.orderId || o._id)
          );

          if (newOrders.length > 0) {
            const newest = newOrders[0];
            newOrders.forEach((o: any) => knownOrderIdsRef.current.add(o.orderId || o._id));
            triggerNotification(newest);
          }
        }
      } catch (err) {
        console.error("Error en polling de órdenes:", err);
      }
    }

    // Chequeo inicial y sondeo periódico cada 6 segundos
    checkForNewOrders();
    intervalId = setInterval(checkForNewOrders, 6000);

    // Event listener para pruebas manuales desde el panel del admin
    const handleTestEvent = (e: any) => {
      const mockOrder = e.detail || {
        orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName: "Cliente de Prueba (Demostración)",
        total: 145.50,
        items: [{ name: "Ramos de Rosas Luxury", quantity: 1 }],
        address: "10827 Kyler Oaks Pl, Houston, TX 77043",
      };
      triggerNotification(mockOrder);
    };

    window.addEventListener("test-admin-sale-notification", handleTestEvent);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener("test-admin-sale-notification", handleTestEvent);
    };
  }, []);

  if (!showToast || !latestOrder) return null;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed top-5 right-5 z-[9999] max-w-md w-[calc(100vw-2.5rem)] sm:w-[420px] bg-gradient-to-b from-[#1E1B24] via-[#16171E] to-[#111217] text-white p-5 rounded-3xl shadow-[0_20px_60px_-10px_rgba(255,151,164,0.45)] border-2 border-[#FF97A4] animate-in slide-in-from-top-6 zoom-in-95 duration-500 overflow-hidden"
    >
      {/* Efecto de Luces y Confeti Animado de Fondo */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-[#FF97A4]/20 rounded-full blur-2xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-amber-400/15 rounded-full blur-2xl pointer-events-none animate-pulse" />

      {/* Barra de progreso de tiempo superior */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-800">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-[#FF97A4] to-emerald-400 transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="relative pt-1 space-y-3.5">
        {/* Cabecera de la Notificación con Sazón y Animación */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="p-3 bg-gradient-to-tr from-[#FF97A4] to-[#FF6E85] text-white rounded-2xl shadow-lg shadow-pink-500/40 flex items-center justify-center animate-bounce">
                <ShoppingBag size={22} className="stroke-[2.5]" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                  <Sparkles size={11} className="text-amber-300 animate-spin" style={{ animationDuration: '3s' }} />
                  NUEVA VENTA ONLINE
                </span>
              </div>
              <h3 className="text-xl font-black font-serif tracking-tight text-white flex items-center gap-1.5 mt-0.5">
                <span>¡VENDISTE!</span>
                <span className="text-2xl animate-pulse">🎉💸</span>
              </h3>
            </div>
          </div>

          <button
            onClick={() => setShowToast(false)}
            className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors"
            title="Cerrar notificación"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tarjeta de Detalles del Pedido */}
        <div className="bg-black/40 border border-white/10 rounded-2xl p-3.5 space-y-2 backdrop-blur-sm">
          <div className="flex justify-between items-center text-xs">
            <span className="font-mono font-extrabold text-[#FF97A4] bg-[#FF97A4]/15 px-2.5 py-1 rounded-lg border border-[#FF97A4]/30">
              {latestOrder.orderId}
            </span>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 block">Total Facturado</span>
              <span className="font-black text-base text-emerald-400">
                ${parseFloat(latestOrder.total || 0).toFixed(2)} USD
              </span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-gray-200 truncate">
              <User size={13} className="text-[#FF97A4] flex-shrink-0" />
              <span className="font-bold truncate">{latestOrder.customerName || "Cliente"}</span>
            </div>
            {latestOrder.items && (
              <span className="text-[11px] text-gray-400 flex-shrink-0 bg-white/5 px-2 py-0.5 rounded-md">
                {latestOrder.items.length} ítem{latestOrder.items.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {latestOrder.address && (
            <p className="text-[11px] text-gray-400 italic truncate border-t border-white/5 pt-1.5">
              📍 {latestOrder.address}
            </p>
          )}
        </div>

        {/* Botón de Acción Principal */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => {
              setShowToast(false);
              router.push(`/admin/ordenes/${latestOrder.orderId}`);
            }}
            className="flex-1 bg-gradient-to-r from-[#FF97A4] to-[#FF6E85] hover:from-[#FF6E85] hover:to-[#B0004A] text-white text-xs font-black py-3 px-4 rounded-xl transition-all shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 flex items-center justify-center gap-2 group transform active:scale-95"
          >
            <span>Ver Orden y Cotizar Millas</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
