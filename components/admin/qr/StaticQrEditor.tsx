"use client";

import React, { useState, useMemo } from "react";
import {
  Globe,
  MessageCircle,
  Phone,
  FileText,
  Wifi,
  Sparkles,
  Palette,
} from "lucide-react";
import {
  QrCanvasPreview,
  QrDesignConfig,
  QrStylePreset,
} from "./QrCanvasPreview";

export function StaticQrEditor() {
  const [dataType, setDataType] = useState<"url" | "whatsapp" | "phone" | "text" | "wifi">("url");

  const [url, setUrl] = useState("https://flowersforyou.com");
  const [waCountry, setWaCountry] = useState("58");
  const [waPhone, setWaPhone] = useState("4120000000");
  const [waMessage, setWaMessage] = useState("¡Hola Flowers For You! Deseo pedir información sobre un arreglo floral.");
  const [phoneNum, setPhoneNum] = useState("+58 412 0000000");
  const [plainText, setPlainText] = useState("Con todo mi amor y cariño para ti. De: Tu persona favorita 🌸");
  const [wifiSsid, setWifiSsid] = useState("FlowersForYou_Guest");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiEncryption, setWifiEncryption] = useState<"WPA" | "WEP" | "nopass">("WPA");

  const [designConfig, setDesignConfig] = useState<QrDesignConfig>({
    stylePreset: "floral",
    fgColor: "#1A1C1C",
    bgColor: "#FFFFFF",
    eyeColor: "#D81B60",
    includeLogo: true,
    logoUrl: "/logo.jpg",
    logoSize: 22,
    margin: 3,
  });

  const qrValue = useMemo(() => {
    switch (dataType) {
      case "whatsapp": {
        const cleanPhone = (waCountry + waPhone).replace(/[^0-9]/g, "");
        const encodedMsg = encodeURIComponent(waMessage);
        return `https://wa.me/${cleanPhone}${encodedMsg ? `?text=${encodedMsg}` : ""}`;
      }
      case "phone": {
        const cleanPhone = phoneNum.replace(/[^0-9+]/g, "");
        return `tel:${cleanPhone}`;
      }
      case "text": {
        return plainText || "Flowers For You Boutique";
      }
      case "wifi": {
        return `WIFI:S:${wifiSsid};T:${wifiEncryption};P:${wifiPassword};;`;
      }
      case "url":
      default: {
        let clean = url.trim();
        if (!clean) return "https://flowersforyou.com";
        if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
          clean = "https://" + clean;
        }
        return clean;
      }
    }
  }, [dataType, url, waCountry, waPhone, waMessage, phoneNum, plainText, wifiSsid, wifiPassword, wifiEncryption]);

  const applyPreset = (preset: QrStylePreset) => {
    if (preset === "floral") {
      setDesignConfig((prev) => ({
        ...prev,
        stylePreset: "floral",
        fgColor: "#1A1C1C",
        bgColor: "#FFFFFF",
        eyeColor: "#D81B60",
      }));
    } else if (preset === "luxury") {
      setDesignConfig((prev) => ({
        ...prev,
        stylePreset: "luxury",
        fgColor: "#111827",
        bgColor: "#FFF5F7",
        eyeColor: "#D81B60",
      }));
    } else if (preset === "modern") {
      setDesignConfig((prev) => ({
        ...prev,
        stylePreset: "modern",
        fgColor: "#0F172A",
        bgColor: "#FFFFFF",
        eyeColor: "#D81B60",
      }));
    } else {
      setDesignConfig((prev) => ({
        ...prev,
        stylePreset: "classic",
        fgColor: "#000000",
        bgColor: "#FFFFFF",
        eyeColor: "#000000",
      }));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Controles de Configuración */}
      <div className="lg:col-span-7 space-y-6">
        {/* Selector de Tipo de Contenido */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-stone-700 block">
            1. Selecciona el Tipo de Contenido
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              type="button"
              onClick={() => setDataType("url")}
              className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 text-xs font-bold ${
                dataType === "url"
                  ? "border-[#D81B60] bg-pink-50 text-[#D81B60] shadow-xs"
                  : "border-stone-200 text-stone-600 hover:border-pink-200"
              }`}
            >
              <Globe size={18} />
              <span>Página Web</span>
            </button>

            <button
              type="button"
              onClick={() => setDataType("whatsapp")}
              className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 text-xs font-bold ${
                dataType === "whatsapp"
                  ? "border-[#D81B60] bg-pink-50 text-[#D81B60] shadow-xs"
                  : "border-stone-200 text-stone-600 hover:border-pink-200"
              }`}
            >
              <MessageCircle size={18} />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => setDataType("text")}
              className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 text-xs font-bold ${
                dataType === "text"
                  ? "border-[#D81B60] bg-pink-50 text-[#D81B60] shadow-xs"
                  : "border-stone-200 text-stone-600 hover:border-pink-200"
              }`}
            >
              <FileText size={18} />
              <span>Dedicatoria</span>
            </button>

            <button
              type="button"
              onClick={() => setDataType("phone")}
              className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 text-xs font-bold ${
                dataType === "phone"
                  ? "border-[#D81B60] bg-pink-50 text-[#D81B60] shadow-xs"
                  : "border-stone-200 text-stone-600 hover:border-pink-200"
              }`}
            >
              <Phone size={18} />
              <span>Llamada</span>
            </button>

            <button
              type="button"
              onClick={() => setDataType("wifi")}
              className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 text-xs font-bold ${
                dataType === "wifi"
                  ? "border-[#D81B60] bg-pink-50 text-[#D81B60] shadow-xs"
                  : "border-stone-200 text-stone-600 hover:border-pink-200"
              }`}
            >
              <Wifi size={18} />
              <span>Wi-Fi</span>
            </button>
          </div>
        </div>

        {/* Inputs Específicos */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <label className="text-xs font-black uppercase tracking-wider text-stone-700 block">
            2. Introduce los Datos
          </label>

          {dataType === "url" && (
            <div>
              <label className="block font-bold text-stone-700 mb-1">Enlace Web (URL)</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 rounded-xl border border-stone-200 focus:border-[#D81B60] focus:outline-none"
              />
            </div>
          )}

          {dataType === "whatsapp" && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Código País</label>
                  <input
                    type="text"
                    value={waCountry}
                    onChange={(e) => setWaCountry(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:border-[#D81B60] focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold text-stone-700 mb-1">Número WhatsApp</label>
                  <input
                    type="tel"
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:border-[#D81B60] focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Mensaje Prellenado</label>
                <textarea
                  value={waMessage}
                  onChange={(e) => setWaMessage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:border-[#D81B60] focus:outline-none h-20"
                />
              </div>
            </div>
          )}

          {dataType === "text" && (
            <div>
              <label className="block font-bold text-stone-700 mb-1">Mensaje de Tarjeta Floral</label>
              <textarea
                value={plainText}
                onChange={(e) => setPlainText(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 focus:border-[#D81B60] focus:outline-none h-24"
              />
            </div>
          )}

          {dataType === "phone" && (
            <div>
              <label className="block font-bold text-stone-700 mb-1">Número Telefónico</label>
              <input
                type="tel"
                value={phoneNum}
                onChange={(e) => setPhoneNum(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-stone-200 focus:border-[#D81B60] focus:outline-none"
              />
            </div>
          )}

          {dataType === "wifi" && (
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nombre de Red (SSID)</label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:border-[#D81B60] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Contraseña</label>
                <input
                  type="password"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:border-[#D81B60] focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Estilo y Paleta */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-3">
          <label className="text-xs font-black uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
            <Palette size={15} className="text-[#D81B60]" />
            <span>3. Estilo Visual del QR</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => applyPreset("floral")}
              className={`py-2 px-3 rounded-xl border transition ${
                designConfig.stylePreset === "floral"
                  ? "border-[#D81B60] bg-pink-50 text-[#D81B60]"
                  : "border-stone-200 text-stone-600 hover:border-pink-200"
              }`}
            >
              🌸 Floral Orgánico
            </button>
            <button
              type="button"
              onClick={() => applyPreset("luxury")}
              className={`py-2 px-3 rounded-xl border transition ${
                designConfig.stylePreset === "luxury"
                  ? "border-[#D81B60] bg-pink-50 text-[#D81B60]"
                  : "border-stone-200 text-stone-600 hover:border-pink-200"
              }`}
            >
              ✨ Luxury Velvet
            </button>
            <button
              type="button"
              onClick={() => applyPreset("modern")}
              className={`py-2 px-3 rounded-xl border transition ${
                designConfig.stylePreset === "modern"
                  ? "border-[#D81B60] bg-pink-50 text-[#D81B60]"
                  : "border-stone-200 text-stone-600 hover:border-pink-200"
              }`}
            >
              📐 Modern Suave
            </button>
            <button
              type="button"
              onClick={() => applyPreset("classic")}
              className={`py-2 px-3 rounded-xl border transition ${
                designConfig.stylePreset === "classic"
                  ? "border-[#D81B60] bg-pink-50 text-[#D81B60]"
                  : "border-stone-200 text-stone-600 hover:border-pink-200"
              }`}
            >
              ⬛ Clásico Estándar
            </button>
          </div>
        </div>
      </div>

      {/* Vista Previa en Vivo */}
      <div className="lg:col-span-5 space-y-4">
        <QrCanvasPreview
          value={qrValue}
          config={designConfig}
          title="QR Flowers For You"
          onConfigChange={(newCfg) => setDesignConfig((prev) => ({ ...prev, ...newCfg }))}
        />
      </div>
    </div>
  );
}
