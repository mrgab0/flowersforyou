"use client";

import { useState } from "react";
import { IAddon } from "@/lib/models/Addon";

interface AddonSelectionProps {
  addons: IAddon[];
  onSelectionChange: (selectedAddons: { addonId: string; value?: string }[]) => void;
}

export const AddonSelection = ({ addons, onSelectionChange }: AddonSelectionProps) => {
  const [selected, setSelected] = useState<{ addonId: string; value?: string }[]>([]);

  // Agrupar addons por categoría
  const groupedAddons = addons.reduce((acc, addon) => {
    const category = addon.category || "Otros";
    if (!acc[category]) acc[category] = [];
    acc[category].push(addon);
    return acc;
  }, {} as Record<string, IAddon[]>);

  const toggleAddon = (addon: IAddon) => {
    const exists = selected.find((s) => s.addonId === addon._id.toString());
    const nextSelection = exists
      ? selected.filter((s) => s.addonId !== addon._id.toString())
      : [...selected, { addonId: addon._id.toString() }];
    
    setSelected(nextSelection);
    onSelectionChange(nextSelection);
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedAddons).map(([category, addons]) => (
        <div key={category} className="space-y-3">
          <h4 className="font-bold text-sm text-gray-500 uppercase tracking-widest">{category}</h4>
          <div className="space-y-3">
            {addons.map((addon) => (
              <div key={addon._id.toString()} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!!selected.find((s) => s.addonId === addon._id.toString())}
                      onChange={() => toggleAddon(addon)}
                      className="w-5 h-5 rounded text-[#FF97A4] focus:ring-[#FF97A4]"
                    />
                    <span className="font-medium text-gray-800">{addon.name}</span>
                  </div>
                  <span className="font-bold text-[#FF97A4]">+${addon.price.toFixed(2)}</span>
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
