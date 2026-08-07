"use client";

import { useState } from "react";
import { IAddon } from "@/lib/models/Addon";
import { Sparkles, Check, Layers, CheckSquare, Square } from "lucide-react";

interface AdminAddonManagerProps {
  addons: IAddon[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function AdminAddonManager({ addons, selectedIds, onChange }: AdminAddonManagerProps) {
  const toggleAddon = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
        <Layers size={16} className="text-[#FF97A4]" />
        <span>Adicionales / Complementos disponibles</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
        {addons.map((addon) => {
          const isSelected = selectedIds.includes(addon._id.toString());
          return (
            <div
              key={addon._id.toString()}
              onClick={() => toggleAddon(addon._id.toString())}
              className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                isSelected
                  ? "bg-pink-50 dark:bg-pink-950/40 border-[#FF97A4] text-[#1A1C1C] dark:text-white"
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-pink-300"
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {isSelected ? (
                  <CheckSquare size={16} className="text-[#FF97A4] flex-shrink-0" />
                ) : (
                  <Square size={16} className="text-gray-300 dark:text-gray-700 flex-shrink-0" />
                )}
                <span className="font-bold truncate">{addon.name}</span>
              </div>
              <span className="font-extrabold text-[#FF97A4] ml-2 flex-shrink-0">+${addon.price}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
