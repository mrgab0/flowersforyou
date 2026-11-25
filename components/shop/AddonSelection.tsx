"use client";

import React, { useState, useMemo, useCallback } from "react";
import type { IAddon } from "@/lib/models/Addon";
import { normalizeAddon, ADDON_CATEGORIES_ORDER } from "@/lib/utils/addonCategories";
import {
  Sparkles,
  Check,
  MessageSquare,
  Gift,
  Heart,
  Crown,
  Plus,
} from "lucide-react";

export interface SelectedAddonState {
  addonId: string;
  name?: string;
  price?: number;
  value?: string;
  customText?: string;
}

interface AddonSelectionProps {
  addons: any[];
  onSelectionChange: (selectedAddons: SelectedAddonState[]) => void;
}

const categoryIcons: Record<string, any> = {
  "Globos con Helio": Sparkles,
  "Chocolates & Dulces": Gift,
  "Peluches": Heart,
  "Coronas & Joyería": Crown,
  "Personalización & Lazos": MessageSquare,
  "Otros Adicionales": Plus,
};

function getAddonId(addon: any): string {
  if (!addon) return "";
  if (addon._id) return addon._id.toString();
  if (addon.id) return String(addon.id);
  return "";
}

export const AddonSelection = React.memo(({ addons, onSelectionChange }: AddonSelectionProps) => {
  const [selected, setSelected] = useState<SelectedAddonState[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const normalizedAddons = useMemo(() => {
    return (addons || []).filter(Boolean).map((a) => normalizeAddon(a));
  }, [addons]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    normalizedAddons.forEach((a) => {
      if (a.category) set.add(a.category.trim());
    });

    const list = Array.from(set);
    return list.sort((a, b) => {
      const idxA = (ADDON_CATEGORIES_ORDER as readonly string[]).indexOf(a as any);
      const idxB = (ADDON_CATEGORIES_ORDER as readonly string[]).indexOf(b as any);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [normalizedAddons]);

  const filteredAddons = useMemo(() => {
    if (activeCategory === "all") return normalizedAddons;
    return normalizedAddons.filter((a) => a.category?.trim().toLowerCase() === activeCategory.toLowerCase());
  }, [normalizedAddons, activeCategory]);

  const toggleAddon = useCallback((addon: any) => {
    const addonIdStr = getAddonId(addon);
    if (!addonIdStr) return;

    setSelected((prev) => {
      const exists = prev.find((s) => s.addonId === addonIdStr);
      const nextSelection = exists
        ? prev.filter((s) => s.addonId !== addonIdStr)
        : [
            ...prev,
            {
              addonId: addonIdStr,
              name: addon.name,
              price: addon.price || 0,
              value: addon.name,
            },
          ];
      onSelectionChange(nextSelection);
      return nextSelection;
    });
  }, [onSelectionChange]);

  const handleCustomTextChange = useCallback((addonId: string, text: string) => {
    setSelected((prev) => {
      const updated = prev.map((item) =>
        item.addonId === addonId ? { ...item, customText: text } : item
      );
      onSelectionChange(updated);
      return updated;
    });
  }, [onSelectionChange]);

  if (!addons || addons.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
          <Sparkles size={14} className="text-[#D81B60]" />
          <span>Personaliza tu Arreglo Floral</span>
        </h4>
        <span className="text-[11px] text-[#D81B60] font-bold">
          {selected.length} añadido{selected.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Pestañas de Categoría */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-1.5 border-b border-stone-100 pb-2">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
              activeCategory === "all"
                ? "bg-[#D81B60] text-white shadow-xs"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Todos
          </button>
          {categories.map((cat) => {
            const Icon = categoryIcons[cat] || Plus;
            return (
              <button
                type="button"
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-[#D81B60] text-white shadow-xs"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                <Icon size={12} />
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Grid de Adicionales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-1 scrollbar-thin">
        {filteredAddons.map((addon) => {
          const id = getAddonId(addon);
          const isSelected = selected.some((s) => s.addonId === id);
          const currentSelected = selected.find((s) => s.addonId === id);
          const isTextType = addon.type === "text" || (addon.name || "").toLowerCase().includes("liston") || (addon.name || "").toLowerCase().includes("tarjeta");

          return (
            <div
              key={id}
              className={`p-3 rounded-2xl border transition-all ${
                isSelected
                  ? "border-[#D81B60] bg-pink-50/60 shadow-xs"
                  : "border-stone-200 bg-white hover:border-pink-200"
              }`}
            >
              <div
                onClick={() => toggleAddon(addon)}
                className="flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition ${
                      isSelected
                        ? "bg-[#D81B60] border-[#D81B60] text-white"
                        : "border-stone-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check size={13} strokeWidth={3} />}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-stone-900 truncate">{addon.name}</p>
                    <p className="text-[10px] text-stone-400">{addon.category}</p>
                  </div>
                </div>

                <span className="text-xs font-black text-[#D81B60] shrink-0 ml-2">
                  +${(addon.price || 0).toFixed(2)}
                </span>
              </div>

              {/* Dedicatoria personalizada si está seleccionado y aplica */}
              {isSelected && isTextType && (
                <div className="mt-2.5 pt-2 border-t border-pink-200">
                  <input
                    type="text"
                    placeholder="Escribe el texto a incluir aquí..."
                    value={currentSelected?.customText || ""}
                    onChange={(e) => handleCustomTextChange(id, e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-pink-200 bg-white focus:outline-none focus:ring-1 focus:ring-[#D81B60]"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

AddonSelection.displayName = "AddonSelection";
