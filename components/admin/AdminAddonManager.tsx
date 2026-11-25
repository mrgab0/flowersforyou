"use client";

import { useState, useEffect } from "react";
import { IAddon } from "@/lib/models/Addon";
import { Layers, CheckSquare, Square } from "lucide-react";

interface AdminAddonManagerProps {
  availableAddons?: IAddon[];
  addons?: IAddon[];
  initialAddons?: IAddon[];
  selectedIds?: string[];
  onChange?: (ids: string[]) => void;
}

export function AdminAddonManager({
  availableAddons,
  addons,
  initialAddons = [],
  selectedIds,
  onChange,
}: AdminAddonManagerProps) {
  const allList: IAddon[] = addons || availableAddons || [];
  
  const initialStringIds = selectedIds
    ? selectedIds
    : initialAddons.map((a: any) => (a._id ? a._id.toString() : String(a.id || a)));

  const [selected, setSelected] = useState<string[]>(initialStringIds);

  useEffect(() => {
    if (selectedIds) {
      setSelected(selectedIds);
    }
  }, [JSON.stringify(selectedIds)]);

  const toggleAddon = (id: string) => {
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

  const allAddonIds = allList.map((addon) => (addon._id ? addon._id.toString() : String((addon as any).id || ""))).filter(Boolean);
  const isAllSelected = allAddonIds.length > 0 && allAddonIds.every((id) => selected.includes(id));

  const handleSelectAll = () => {
    const updated = isAllSelected ? [] : allAddonIds;
    setSelected(updated);
    if (onChange) {
      onChange(updated);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
          <Layers size={16} className="text-[#D81B60]" />
          <span>Adicionales Habilitados para este Producto</span>
        </div>
        {allList.length > 0 && (
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-[11px] text-[#D81B60] font-bold hover:underline"
          >
            {isAllSelected ? "Deseleccionar todos" : "Seleccionar todos"}
          </button>
        )}
      </div>
      <p className="text-[11px] text-stone-500">
        Marca los adicionales que el cliente podrá añadir al comprar este arreglo (chocolates, peluches, tarjetas, etc.).
      </p>

      {/* Renderizar inputs ocultos name="addons" para enviar en formularios estándar */}
      {selected.map((addonId) => (
        <input key={`addon-${addonId}`} type="hidden" name="addons" value={addonId} />
      ))}

      {allList.length === 0 ? (
        <p className="text-xs text-stone-400 p-2">No hay adicionales creados aún.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1 scrollbar-thin">
          {allList.map((addon) => {
            const addonIdStr = addon._id ? addon._id.toString() : String((addon as any).id || "");
            const isSelected = selected.includes(addonIdStr);
            return (
              <div
                key={addonIdStr || addon.name}
                onClick={() => toggleAddon(addonIdStr)}
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
                    <p className="font-bold truncate">{addon.name}</p>
                    <p className="text-[10px] text-stone-400">{addon.category} • +${addon.price?.toFixed(2)}</p>
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
