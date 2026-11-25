"use client";

import { useState, useEffect } from "react";
import { generateSkuFromName } from "@/lib/utils/skuGenerator";
import { Sparkles, Check } from "lucide-react";

interface ProductNameSkuInputsProps {
  initialName?: string;
  initialSku?: string;
  isEditMode?: boolean;
}

export function ProductNameSkuInputs({
  initialName = "",
  initialSku = "",
  isEditMode = false
}: ProductNameSkuInputsProps) {
  const [name, setName] = useState(initialName);
  const [sku, setSku] = useState(initialSku);
  const [isManuallyEdited, setIsManuallyEdited] = useState(isEditMode && Boolean(initialSku));
  const [copiedNotification, setCopiedNotification] = useState(false);

  useEffect(() => {
    if (initialName && !name) {
      setName(initialName);
    }
    if (initialSku && !sku) {
      setSku(initialSku);
      setIsManuallyEdited(true);
    }
  }, [initialName, initialSku]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);

    if (!isManuallyEdited) {
      const generated = generateSkuFromName(newName);
      setSku(generated);
    }
  };

  const handleSkuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSku = e.target.value;
    setSku(newSku);
    setIsManuallyEdited(true);
  };

  const handleRegenerateSku = () => {
    const generated = generateSkuFromName(name);
    setSku(generated);
    setIsManuallyEdited(false);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Campo: Nombre del Producto */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-stone-700">
          Nombre del Producto *
        </label>
        <input
          name="name"
          value={name}
          onChange={handleNameChange}
          placeholder="Ej: Ramo de Rosas Magenta"
          className="p-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D81B60]/20 focus:border-[#D81B60] font-medium"
          required
        />
      </div>

      {/* Campo: SKU + Botón de Auto-generación */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-700">
            SKU (Código único) *
          </label>

          <button
            type="button"
            onClick={handleRegenerateSku}
            title="Auto-generar SKU desde el nombre del producto"
            className="text-[11px] text-[#D81B60] font-bold hover:underline flex items-center gap-1 bg-pink-50 px-2 py-0.5 rounded-md border border-pink-200 active:scale-95 transition-all"
          >
            {copiedNotification ? (
              <>
                <Check size={12} className="text-emerald-600" />
                <span className="text-emerald-600">¡SKU Generado!</span>
              </>
            ) : (
              <>
                <Sparkles size={12} />
                <span>Auto-SKU</span>
              </>
            )}
          </button>
        </div>

        <input
          name="sku"
          value={sku}
          onChange={handleSkuChange}
          placeholder="Ej: rm-rs-mgnt"
          className="p-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D81B60]/20 focus:border-[#D81B60] font-mono font-bold text-xs"
          required
        />
      </div>
    </div>
  );
}
