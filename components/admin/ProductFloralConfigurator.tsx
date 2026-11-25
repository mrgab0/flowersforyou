"use client";

import { useState } from "react";
import { Palette, Layers, Plus, Trash2, Sparkles, Check } from "lucide-react";

interface StemTier {
  label: string;
  stems: number;
  price: number;
}

interface ProductFloralConfiguratorProps {
  initialColors?: string[];
  initialStemTiers?: StemTier[];
  initialPricePerExtraRose?: number;
}

const PRESET_COLORS = [
  { name: "Magenta Modern", bg: "#D81B60", text: "#ffffff" },
  { name: "Rojo Pasión", bg: "#991b1b", text: "#ffffff" },
  { name: "Rosa Pastel", bg: "#fbcfe8", text: "#831843" },
  { name: "Blanco Puro", bg: "#ffffff", border: "#cbd5e1", text: "#0f172a" },
  { name: "Amarillo Solar", bg: "#fef08a", text: "#713f12" },
  { name: "Púrpura Profundo", bg: "#4a154b", text: "#ffffff" },
  { name: "Azul Real", bg: "#1d4ed8", text: "#ffffff" },
  { name: "Lavanda / Lila", bg: "#e9d5ff", text: "#581c87" },
  { name: "Bicolor Romance", bg: "linear-gradient(135deg, #D81B60 50%, #fbcfe8 50%)", text: "#ffffff" },
];

export function ProductFloralConfigurator({
  initialColors = [],
  initialStemTiers = [],
}: ProductFloralConfiguratorProps) {
  const [colors, setColors] = useState<string[]>(initialColors);
  const [customColor, setCustomColor] = useState("");
  const [stemTiers, setStemTiers] = useState<StemTier[]>(initialStemTiers);

  // Estados para nuevo tier
  const [newTierLabel, setNewTierLabel] = useState("");
  const [newTierStems, setNewTierStems] = useState("");
  const [newTierPrice, setNewTierPrice] = useState("");

  const toggleColor = (colorName: string) => {
    if (colors.includes(colorName)) {
      setColors(colors.filter((c) => c !== colorName));
    } else {
      setColors([...colors, colorName]);
    }
  };

  const addCustomColor = () => {
    const trimmed = customColor.trim();
    if (trimmed && !colors.includes(trimmed)) {
      setColors([...colors, trimmed]);
      setCustomColor("");
    }
  };

  const addStemTier = () => {
    const stems = parseInt(newTierStems) || 0;
    const price = parseFloat(newTierPrice) || 0;
    const label = newTierLabel.trim() || `${stems} Rosas`;

    if (stems > 0 && price >= 0) {
      setStemTiers([...stemTiers, { label, stems, price }]);
      setNewTierLabel("");
      setNewTierStems("");
      setNewTierPrice("");
    }
  };

  const removeStemTier = (index: number) => {
    setStemTiers(stemTiers.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-6 border border-stone-200 p-5 rounded-2xl bg-white">
      {/* 1. SELECCIÓN DE COLORES DISPONIBLES */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-stone-700 border-b pb-2 border-stone-100">
          <Palette size={16} className="text-[#D81B60]" />
          <span>Colores de Rosas / Flores Disponibles</span>
        </div>
        <p className="text-[11px] text-stone-500">
          Selecciona qué tonos están disponibles para que el cliente elija en la ficha del producto.
        </p>

        {/* Inputs ocultos para FormData */}
        {colors.map((c) => (
          <input key={`color-${c}`} type="hidden" name="availableColors" value={c} />
        ))}

        <div className="flex flex-wrap gap-2 pt-1">
          {PRESET_COLORS.map((preset) => {
            const isSelected = colors.includes(preset.name);
            return (
              <button
                type="button"
                key={preset.name}
                onClick={() => toggleColor(preset.name)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  isSelected
                    ? "border-[#D81B60] bg-pink-50 text-[#D81B60] font-bold shadow-xs scale-102"
                    : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                }`}
              >
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10"
                  style={{
                    background: preset.bg,
                    borderColor: preset.border || "rgba(0,0,0,0.1)",
                  }}
                />
                <span>{preset.name}</span>
                {isSelected && <Check size={12} className="text-[#D81B60]" />}
              </button>
            );
          })}
        </div>

        {/* Color personalizado */}
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            placeholder="Otro tono (ej. Salmón Fino)"
            className="text-xs p-2.5 border border-stone-200 rounded-xl flex-1 focus:outline-none focus:border-[#D81B60]"
          />
          <button
            type="button"
            onClick={addCustomColor}
            className="px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition"
          >
            Añadir Tono
          </button>
        </div>
      </div>

      {/* 2. ESCALONAMIENTO DE TAMAÑO / NÚMERO DE TALLOS (STEM TIERS) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 text-xs font-bold text-stone-700 border-b pb-2 border-stone-100">
          <Layers size={16} className="text-[#D81B60]" />
          <span>Opciones de Cantidad de Rosas (Stem Tiers)</span>
        </div>
        <p className="text-[11px] text-stone-500">
          Permite al cliente elegir tamaños como 24 Rosas ($60), 50 Rosas ($100), 100 Rosas ($180).
        </p>

        {/* JSON serializado oculto para el formulario */}
        <input type="hidden" name="stemTiersJson" value={JSON.stringify(stemTiers)} />

        {/* Lista de Tiers Configurados */}
        {stemTiers.length > 0 && (
          <div className="space-y-2">
            {stemTiers.map((tier, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-medium"
              >
                <div>
                  <span className="font-bold text-stone-900">{tier.label}</span>
                  <span className="text-stone-500 ml-2">({tier.stems} tallos)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#D81B60]">${tier.price.toFixed(2)} USD</span>
                  <button
                    type="button"
                    onClick={() => removeStemTier(idx)}
                    className="text-stone-400 hover:text-red-500 transition"
                    title="Eliminar tier"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Añadir nuevo tier */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 bg-stone-50 p-3 rounded-xl border border-dashed border-stone-200">
          <input
            type="text"
            placeholder="Etiqueta (ej. 50 Rosas)"
            value={newTierLabel}
            onChange={(e) => setNewTierLabel(e.target.value)}
            className="text-xs p-2 border border-stone-200 rounded-lg bg-white"
          />
          <input
            type="number"
            placeholder="Tallos (ej. 50)"
            value={newTierStems}
            onChange={(e) => setNewTierStems(e.target.value)}
            className="text-xs p-2 border border-stone-200 rounded-lg bg-white"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Precio ($)"
            value={newTierPrice}
            onChange={(e) => setNewTierPrice(e.target.value)}
            className="text-xs p-2 border border-stone-200 rounded-lg bg-white"
          />
          <button
            type="button"
            onClick={addStemTier}
            className="flex items-center justify-center gap-1 bg-[#D81B60] hover:bg-[#b0004a] text-white text-xs font-bold py-2 px-3 rounded-lg transition"
          >
            <Plus size={14} />
            <span>Añadir</span>
          </button>
        </div>
      </div>
    </div>
  );
}
