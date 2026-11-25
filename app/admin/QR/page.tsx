"use client";

import React, { useState } from "react";
import { QrCode, Zap, Layers } from "lucide-react";
import { StaticQrEditor } from "@/components/admin/qr/StaticQrEditor";
import { DynamicQrEditor } from "@/components/admin/qr/DynamicQrEditor";

export default function AdminQrPage() {
  const [activeTab, setActiveTab] = useState<"static" | "dynamic">("static");

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-br from-[#D81B60] to-[#AD1457] text-white rounded-xl shadow-md">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-stone-900 tracking-tight">
                Estudio & Creador de Códigos QR
              </h1>
              <p className="text-xs sm:text-sm text-stone-500">
                Diseña códigos QR estéticos de alta calidad para tarjetas florales, cintas, WhatsApp y promociones.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-stone-200/80 rounded-2xl shadow-inner self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("static")}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === "static"
                ? "bg-white text-[#D81B60] shadow-md"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            QR Estático
          </button>

          <button
            onClick={() => setActiveTab("dynamic")}
            className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
              activeTab === "dynamic"
                ? "bg-white text-[#D81B60] shadow-md"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Layers className="w-4 h-4 text-purple-500" />
            QR Dinámico (Rastreado)
          </button>
        </div>
      </div>

      {/* Tab Description Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50/70 via-white to-pink-50/40 border border-pink-100/60 flex items-center justify-between text-xs text-stone-600">
        {activeTab === "static" ? (
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#D81B60] flex items-center gap-1">
              <Zap className="w-4 h-4" /> Modo Estático:
            </span>
            <span>
              Generación inmediata para WhatsApp, enlaces directos, vCards o mensajes florales. No caduca ni depende de bases de datos.
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-bold text-purple-600 flex items-center gap-1">
              <Layers className="w-4 h-4" /> Modo Dinámico:
            </span>
            <span>
              Crea enlaces cortos vinculados a tu dominio. Puedes cambiar el enlace de destino en el futuro sin tener que reimprimir las tarjetas de flores.
            </span>
          </div>
        )}
      </div>

      {/* Editor Container */}
      <div>
        {activeTab === "static" ? <StaticQrEditor /> : <DynamicQrEditor />}
      </div>
    </div>
  );
}
