"use client";

import { useState } from "react";
import { IAddon } from "@/lib/models/Addon";
import { Sparkles, Check, Image as ImageIcon, Layers, CheckSquare, Square } from "lucide-react";

interface AdminAddonManagerProps {
  availableAddons: IAddon[];
  initialAddons?: IAddon[];
}

export const AdminAddonManager = ({ availableAddons, initialAddons = [] }: AdminAddonManagerProps) => {
  // Guardamos las IDs de los adicionales seleccionados
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialAddons.map((a) => a._id.toString())
  );

  // Agrupar adicionales por categoría interna
  const groupedAddons = availableAddons.reduce((acc, addon) => {
    const category = addon.category || "Otros";
    if (!acc[category]) acc[category] = [];
    acc[category].push(addon);
    return acc;
  }, {} as Record<string, IAddon[]>);

  const toggleAddon = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const toggleCategory = (categoryAddons: IAddon[]) => {
    const categoryIds = categoryAddons.map((a) => a._id.toString());
    const allSelected = categoryIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      // Desmarcar todos en esta categoría
      setSelectedIds(selectedIds.filter((id) => !categoryIds.includes(id)));
    } else {
      // Marcar todos en esta categoría
      const newSelected = Array.from(new Set([...selectedIds, ...categoryIds]));
      setSelectedIds(newSelected);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
            <Sparkles size={18} className="text-[#FF97A4]" /> Adicionales y Personalizaciones Compatibles
          </h2>
          <p className="text-xs text-gray-400">
            Marca las casillas de los adicionales que estarán disponibles para personalizar este producto ({selectedIds.length} seleccionados)
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSelectedIds(availableAddons.map((a) => a._id.toString()))}
            className="text-[11px] font-bold text-purple-600 hover:text-purple-800 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 transition-colors"
          >
            Marcar Todos
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="text-[11px] font-bold text-gray-500 hover:text-gray-700 bg-gray-100 px-3 py-1 rounded-full transition-colors"
          >
            Limpiar Selección
          </button>
        </div>
      </div>

      {Object.keys(groupedAddons).length === 0 ? (
        <p className="text-xs text-gray-400 italic">
          No hay adicionales creados aún en el sistema. Puedes crearlos en el apartado de Adicionales.
        </p>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedAddons).map(([category, addons]) => {
            const categoryIds = addons.map((a) => a._id.toString());
            const isCategoryAllSelected = categoryIds.every((id) => selectedIds.includes(id));

            return (
              <div key={category} className="space-y-3 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers size={14} className="text-[#FF97A4]" /> {category} ({addons.length})
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleCategory(addons)}
                    className="text-[11px] font-bold text-[#FF97A4] hover:underline flex items-center gap-1"
                  >
                    {isCategoryAllSelected ? (
                      <>
                        <Square size={12} /> Desmarcar sección
                      </>
                    ) : (
                      <>
                        <CheckSquare size={12} /> Seleccionar todo en {category}
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addons.map((addon) => {
                    const addonIdStr = addon._id.toString();
                    const isChecked = selectedIds.includes(addonIdStr);

                    return (
                      <label
                        key={addonIdStr}
                        onClick={() => toggleAddon(addonIdStr)}
                        className={`relative flex items-center justify-between p-3.5 border-2 rounded-xl cursor-pointer transition-all ${
                          isChecked
                            ? "border-[#FF97A4] bg-white shadow-sm ring-1 ring-[#FF97A4]/20"
                            : "border-gray-200 hover:border-gray-300 bg-white/70"
                        }`}
                      >
                        {/* Input Oculto que el Formulario capturará vía FormData */}
                        <input
                          type="checkbox"
                          name="addons"
                          value={addonIdStr}
                          checked={isChecked}
                          onChange={() => {}} // Manejado por onClick del contenedor
                          className="sr-only"
                        />

                        <div className="flex items-center gap-3">
                          {/* Miniatura Foto ImageKit */}
                          <div className="w-10 h-10 rounded-lg bg-gray-100 border overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {addon.image ? (
                              <img src={addon.image} alt={addon.name} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon size={16} className="text-gray-400" />
                            )}
                          </div>

                          <div>
                            <span className="font-bold text-xs text-gray-800 block">{addon.name}</span>
                            <span className="text-[10px] text-gray-400 block font-medium">
                              {addon.type === "select"
                                ? "Opciones de Color"
                                : addon.type === "text"
                                ? "Mensaje de Texto"
                                : "Selección Simple"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-[#FF97A4]">
                            {addon.price > 0 ? `+$${addon.price.toFixed(2)}` : "Gratis"}
                          </span>

                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                              isChecked ? "bg-[#FF97A4] border-[#FF97A4] text-white" : "border-gray-300 bg-white"
                            }`}
                          >
                            {isChecked && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
