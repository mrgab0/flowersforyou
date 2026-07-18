"use client";

import { useState } from "react";
import { IAddon } from "@/lib/models/Addon";

interface AdminAddonManagerProps {
  availableAddons: IAddon[];
  initialAddons?: IAddon[];
}

export const AdminAddonManager = ({ availableAddons, initialAddons = [] }: AdminAddonManagerProps) => {
  const [selectedAddons, setSelectedAddons] = useState<IAddon[]>(initialAddons);

  const addAddon = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const addonId = e.target.value;
    if (!addonId) return;
    
    const addon = availableAddons.find(a => a._id.toString() === addonId);
    if (addon && !selectedAddons.find(a => a._id.toString() === addonId)) {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const removeAddon = (addonId: string) => {
    setSelectedAddons(selectedAddons.filter(a => a._id.toString() !== addonId));
  };

  return (
    <div className="space-y-4">
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
        Adicionales Asociados
      </label>
      
      {/* Selector */}
      <select 
        onChange={addAddon} 
        className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#D81B60]"
        defaultValue=""
      >
        <option value="" disabled>Seleccionar adicional...</option>
        {availableAddons.map(addon => (
          <option key={addon._id.toString()} value={addon._id.toString()}>
            {addon.name} ({addon.category}) - ${addon.price}
          </option>
        ))}
      </select>

      {/* Lista de seleccionados */}
      <div className="flex flex-wrap gap-2">
        {selectedAddons.map(addon => (
          <div key={addon._id.toString()} className="flex items-center gap-2 bg-[#D81B60] text-white px-3 py-1 rounded-full text-sm">
            <span>{addon.name}</span>
            <button type="button" onClick={() => removeAddon(addon._id.toString())} className="hover:text-gray-200">
              &times;
            </button>
            {/* Input oculto para que el form lo capture */}
            <input type="hidden" name="addons" value={addon._id.toString()} />
          </div>
        ))}
      </div>
    </div>
  );
};
