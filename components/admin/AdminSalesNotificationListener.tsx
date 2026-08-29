"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getAllOrdersAction } from "@/lib/actions/order";
import { Sparkles, ShoppingBag, ArrowRight, X, Bell } from "lucide-react";

export function AdminSalesNotificationListener() {
  const router = useRouter();
  const [latestOrder, setLatestOrder] = useState<any | null>(null);
  const [showToast, setShowToast] = useState(false);
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const isInitialRun = useRef(true);

  // Sintetizador Web Audio API para alerta sonora de timbre
  const playChimeSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const playNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0, ctx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Tono tipo "Ding-Dong" de tienda
      playNote(523.25, 0, 0.4); // C5
      playNote(659.25, 0.15, 0.5); // E5
      playNote(783.99, 0.3, 0.8); // G5
    } catch (e) {
      console.warn("Audio play blocked by browser policy:", e);
    }
  };

  useEffect(() => {
    let intervalId: any;

    async function checkForNewOrders() {
      try {
        const res = await getAllOrdersAction();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const fetchedOrders = res.data;

          if (isInitialRun.current) {
            // Guardar IDs existentes en la primera carga
            fetchedOrders.forEach((o: any) => knownOrderIdsRef.current.add(o.orderId || o._id));
            isInitialRun.current = false;
            return;
          }

          // Buscar pedidos que no estaban en el conjunto conocido
          const newOrders = fetchedOrders.filter(
            (o: any) => !knownOrderIdsRef.current.has(o.orderId || o._id)
          );

          if (newOrders.length > 0) {
            const newest = newOrders[0];
            // Registrar los nuevos IDs
            newOrders.forEach((o: any) => knownOrderIdsRef.current.add(o.orderId || o._id));

            setLatestOrder(newest);
            setShowToast(true);
            playChimeSound();
          }
        }
      } catch (err) {
        console.error("Error en polling de órdenes:", err);
      }
    }

    // Ejecutar chequeo inicial e intervalo de 8 segundos
    checkForNewOrders();
    intervalId = setInterval(checkForNewOrders, 8000);

    return () => clearInterval(intervalId);
  }, []);

  if (!showToast || !latestOrder) return null;

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-sm w-full bg-[#1A1C1C] text-white p-4 rounded-2xl shadow-2xl border-2 border-[#FF97A4] animate-in slide-in-from-top-5 duration-500">
      <div className="flex items-start justify-between gap-3">
        <div className="p-2.5 bg-[#FF97A4] text-white rounded-xl flex-shrink-0 animate-bounce">
          <ShoppingBag size={20} />
        </div>

        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-1.5 text-xs font-black text-[#FF97A4] uppercase tracking-wider">
            <Sparkles size={14} />
            <span>¡NUEVA VENTA RECIBIDA!</span>
          </div>

          <p className="font-bold text-sm text-white font-mono">
            {latestOrder.orderId}
          </p>

          <p className="text-xs text-gray-300 font-medium">
            Cliente: <strong>{latestOrder.customerName}</strong>
          </p>

          <p className="text-xs font-extrabold text-emerald-400">
            Total: ${parseFloat(latestOrder.total || 0).toFixed(2)} USD
          </p>
        </div>

        <button
          onClick={() => setShowToast(false)}
          className="text-gray-400 hover:text-white p-1"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-3 pt-2.5 border-t border-gray-800 flex justify-end gap-2">
        <button
          onClick={() => {
            setShowToast(false);
            router.push(`/admin/ordenes/${latestOrder.orderId}`);
          }}
          className="w-full bg-[#FF97A4] hover:bg-[#B0004A] text-white text-xs font-bold py-2 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <span>Ver Factura e Imprimir A4</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
