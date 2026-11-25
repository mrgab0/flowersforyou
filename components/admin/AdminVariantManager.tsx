"use client";

import { useState, useEffect } from "react";
import { GitMerge, CheckSquare, Square } from "lucide-react";

interface AdminVariantManagerProps {
  variants: any[];
  selectedIds?: string[];
  onChange?: (ids: string[]) => void;
}

export function AdminVariantManager({ variants, selectedIds = [], onChange }: AdminVariantManagerProps) {
  const [selected, setSelected] = useState<string[]>(selectedIds);

  useEffect(() => {
    if (selectedIds) {
      setSelected(selectedIds);
    }
  }, [JSON.stringify(selectedIds)]);

  const toggleVariant = (id: string) => {
    let updated: string[];
    if (selected.includes(id)) {
      updated = selected.filter((item) => item !== id);
    } else {
      updated = [...selected, id];
    }
    setSelected(updated);
    if (onChange) {
      onChange(updated);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-stone-700 border-b pb-2 border-stone-100">
        <GitMerge size={16} className="text-[#D81B60]" />
        <span>Variantes del Producto (Opcional)</span>
      </div>
      <p className="text-[11px] text-stone-500 mb-2">
        Selecciona otros arreglos florales que sean versiones o tamaños alternativos de este mismo producto.
      </p>

      {/* Renderizar inputs ocultos name="variants" para cada variante seleccionada */}
      {selected.map((variantId) => (
        <input key={`variant-${variantId}`} type="hidden" name="variants" value={variantId} />
      ))}

      {variants.length === 0 ? (
        <p className="text-xs text-stone-400 p-2">No hay otros productos disponibles para asociar como variantes.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1 scrollbar-thin">
          {variants.map((product) => {
            const variantIdStr = product._id ? product._id.toString() : (product.id ? String(product.id) : "");
            const isSelected = selected.includes(variantIdStr);
            return (
              <div
                key={variantIdStr || product.name}
                onClick={() => toggleVariant(variantIdStr)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                  isSelected
                    ? "bg-pink-50 border-[#D81B60] text-stone-900 shadow-xs"
                    : "bg-white border-stone-200 text-stone-600 hover:border-pink-300"
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  {isSelected ? (
                    <CheckSquare size={16} className="text-[#D81B60] shrink-0" />
                  ) : (
                    <Square size={16} className="text-stone-300 shrink-0" />
                  )}
                  <div className="truncate">
                    <p className="font-bold truncate">{product.name}</p>
                    <p className="text-[10px] text-stone-400">${product.price?.toFixed(2)} USD</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
