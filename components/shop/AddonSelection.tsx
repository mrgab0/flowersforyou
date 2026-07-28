"use client";

import { useState } from "react";
import { IAddon } from "@/lib/models/Addon";
import { Sparkles, Check, MessageSquare, ChevronDown, ChevronUp, Gift, Heart, Palette, Feather } from "lucide-react";

interface AddonSelectionProps {
  addons: IAddon[];
  onSelectionChange: (selectedAddons: { addonId: string; value?: string; price?: number; name?: string }[]) => void;
}

const categoryIcons: Record<string, any> = {
  "Chocolates & Dulces": Gift,
  "Peluches & Globos": Heart,
  "Personalización & Tarjetas": MessageSquare,
  "Decoración & Lazos": Feather,
  "Colores & Papeles": Palette,
};

export const AddonSelection = ({ addons, onSelectionChange }: AddonSelectionProps) => {
  const [selected, setSelected] = useState<{ addonId: string; value?: string; price?: number; name?: string }[]>([]);
  
  // Agrupar adicionales por categoría interna
  const groupedAddons = addons.reduce((acc, addon) => {
    const category = addon.category || "Otros Complementos";
    if (!acc[category]) acc[category] = [];
    acc[category].push(addon);
    return acc;
  }, {} as Record<string, IAddon[]>);

  // Pestañas / Acordeones abiertos (por defecto abrimos el primero)
  const initialOpenCategories = Object.keys(groupedAddons).slice(0, 1);
  const [openCategories, setOpenCategories] = useState<string[]>(initialOpenCategories);

  const toggleCategoryAccordion = (cat: string) => {
    if (openCategories.includes(cat)) {
      setOpenCategories(openCategories.filter((c) => c !== cat));
    } else {
      setOpenCategories([...openCategories, cat]);
    }
  };

  const toggleCheckbox = (addon: IAddon) => {
    const addonIdStr = addon._id.toString();
    const exists = selected.find((s) => s.addonId === addonIdStr);
    const nextSelection = exists
      ? selected.filter((s) => s.addonId !== addonIdStr)
      : [...selected, { addonId: addonIdStr, name: addon.name, price: addon.price }];
    
    setSelected(nextSelection);
    onSelectionChange(nextSelection);
  };

  const handleSelectOption = (addon: IAddon, val: string) => {
    const addonIdStr = addon._id.toString();
    const filtered = selected.filter((s) => s.addonId !== addonIdStr);
    const nextSelection = val ? [...filtered, { addonId: addonIdStr, name: `${addon.name}: ${val}`, value: val, price: addon.price }] : filtered;
    
    setSelected(nextSelection);
    onSelectionChange(nextSelection);
  };

  const handleTextInput = (addon: IAddon, text: string) => {
    const addonIdStr = addon._id.toString();
    const filtered = selected.filter((s) => s.addonId !== addonIdStr);
    const nextSelection = text.trim() ? [...filtered, { addonId: addonIdStr, name: `${addon.name}`, value: text, price: addon.price }] : filtered;
    
    setSelected(nextSelection);
    onSelectionChange(nextSelection);
  };

  return (
    <div className="space-y-3">
      {Object.entries(groupedAddons).map(([category, items]) => {
        const isOpen = openCategories.includes(category);
        const IconComponent = categoryIcons[category] || Sparkles;

        // Cuántos adicionales de esta categoría están seleccionados por el cliente
        const categorySelectedCount = items.filter((item) =>
          selected.some((s) => s.addonId === item._id.toString())
        ).length;

        return (
          <div
            key={category}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300"
          >
            {/* CABECERA DE CASCADA / ACORDEÓN DESPLEGABLE */}
            <button
              type="button"
              onClick={() => toggleCategoryAccordion(category)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-colors ${categorySelectedCount > 0 ? "bg-[#FF97A4] text-white" : "bg-[#FF97A4]/10 text-[#FF97A4]"}`}>
                  <IconComponent size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1A1C1C] leading-none">{category}</h4>
                  <span className="text-[11px] text-gray-400 font-medium block mt-1">
                    {categorySelectedCount > 0 ? (
                      <strong className="text-[#FF97A4]">{categorySelectedCount} seleccionado(s)</strong>
                    ) : (
                      `${items.length} opción(es) disponible(s)`
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {categorySelectedCount > 0 && (
                  <span className="bg-[#FF97A4] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                    {categorySelectedCount}
                  </span>
                )}
                <div className="p-1 text-gray-400">
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>
            </button>

            {/* CONTENIDO DESPLEGABLE DE CASCADA */}
            {isOpen && (
              <div className="p-4 pt-1 border-t border-gray-50 space-y-3 bg-gray-50/40 animate-in fade-in duration-300">
                {items.map((addon) => {
                  const addonIdStr = addon._id.toString();
                  const isSelected = !!selected.find((s) => s.addonId === addonIdStr);

                  // 1. TIPO SELECCIÓN DE OPCIÓN (SWATCHES / DROPDOWN - ej: Rose Colors / Paper Colors)
                  if (addon.type === "select" && addon.options && addon.options.length > 0) {
                    const currentSelectedVal = selected.find((s) => s.addonId === addonIdStr)?.value || "";

                    return (
                      <div key={addonIdStr} className="bg-white p-3.5 rounded-xl border border-gray-100 space-y-2 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-gray-800">{addon.name}</span>
                          {addon.price > 0 && <span className="font-bold text-xs text-[#FF97A4]">+${addon.price.toFixed(2)}</span>}
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                          {addon.options.map((opt) => (
                            <button
                              type="button"
                              key={opt}
                              onClick={() => handleSelectOption(addon, currentSelectedVal === opt ? "" : opt)}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                currentSelectedVal === opt
                                  ? "bg-[#1A1C1C] text-white border-[#1A1C1C] shadow-sm scale-105"
                                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // 2. TIPO MENSAJE DE TEXTO PERSONALIZADO (ej: Tarjeta de Dedicatoria)
                  if (addon.type === "text") {
                    const currentText = selected.find((s) => s.addonId === addonIdStr)?.value || "";

                    return (
                      <div key={addonIdStr} className="bg-white p-3.5 rounded-xl border border-gray-100 space-y-2 shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-gray-800 flex items-center gap-1.5">
                            <MessageSquare size={14} className="text-[#FF97A4]" /> {addon.name}
                          </span>
                          {addon.price > 0 && <span className="font-bold text-xs text-[#FF97A4]">+${addon.price.toFixed(2)}</span>}
                        </div>

                        <textarea
                          value={currentText}
                          onChange={(e) => handleTextInput(addon, e.target.value)}
                          placeholder="Escribe aquí tu mensaje especial de dedicatoria..."
                          className="w-full p-2.5 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#FF97A4] h-20"
                        />
                      </div>
                    );
                  }

                  // 3. TIPO CHECKBOX / EXTRA CON FOTO IMAGEKIT (ej: Ferrero Rocher, Peluche, Mariposa)
                  return (
                    <div
                      key={addonIdStr}
                      onClick={() => toggleCheckbox(addon)}
                      className={`bg-white p-3 rounded-xl border-2 transition-all cursor-pointer shadow-sm flex items-center justify-between ${
                        isSelected ? "border-[#FF97A4] bg-[#FF97A4]/5" : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-gray-50 border overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {addon.image ? (
                            <img src={addon.image} alt={addon.name} className="w-full h-full object-cover" />
                          ) : (
                            <Sparkles size={16} className="text-purple-400" />
                          )}
                        </div>

                        <div>
                          <span className="font-bold text-xs text-gray-800 block">{addon.name}</span>
                          {addon.description && <span className="text-[10px] text-gray-400 block">{addon.description}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="font-extrabold text-xs text-[#FF97A4]">
                          {addon.price > 0 ? `+$${addon.price.toFixed(2)}` : "Gratis"}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSelected ? "bg-[#FF97A4] border-[#FF97A4] text-white" : "border-gray-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
