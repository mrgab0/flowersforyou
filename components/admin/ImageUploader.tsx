"use client";

import React, { useState } from "react";
import { Upload, X, Star, Plus, Link as LinkIcon, MoveLeft, MoveRight } from "lucide-react";

interface ImageUploaderProps {
  defaultImages?: string[];
  maxImages?: number;
}

export function ImageUploader({ defaultImages = [], maxImages = 7 }: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(defaultImages);
  const [manualUrl, setManualUrl] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setImages(updated);
  };

  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;
    if (images.length >= maxImages) {
      alert(`Límite máximo de ${maxImages} imágenes alcanzado.`);
      return;
    }
    setImages((prev) => [...prev, manualUrl.trim()]);
    setManualUrl("");
    setShowManualInput(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result && images.length < maxImages) {
          setImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-4">
      {/* Inputs ocultos para FormData */}
      {images.map((url, idx) => (
        <input key={`${url}-${idx}`} type="hidden" name="images" value={url} />
      ))}

      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
          Imágenes del Producto ({images.length} / {maxImages})
        </label>
        <button
          type="button"
          onClick={() => setShowManualInput(!showManualInput)}
          className="text-xs text-[#D81B60] font-bold hover:underline flex items-center gap-1"
        >
          <LinkIcon size={13} />
          <span>{showManualInput ? "Ocultar URL" : "+ Añadir URL"}</span>
        </button>
      </div>

      {showManualInput && (
        <div className="flex gap-2 p-3 bg-stone-50 rounded-xl border border-stone-200">
          <input
            type="url"
            placeholder="Pega la URL de la imagen (ej: https://ejemplo.com/foto.jpg)..."
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            className="flex-1 p-2 text-xs border rounded-lg focus:outline-none focus:border-[#D81B60]"
          />
          <button
            type="button"
            onClick={handleAddManualUrl}
            className="px-4 py-2 bg-[#D81B60] text-white text-xs font-bold rounded-lg hover:bg-[#b0004a] transition"
          >
            Añadir
          </button>
        </div>
      )}

      {/* Grid de Imágenes Seleccionadas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {images.map((url, idx) => (
          <div
            key={`${url}-${idx}`}
            className="relative group aspect-square rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 flex items-center justify-center shadow-xs"
          >
            <img src={url} alt={`Imagen ${idx + 1}`} className="w-full h-full object-cover" />

            {/* Etiqueta de Imagen Principal */}
            {idx === 0 && (
              <span className="absolute top-2 left-2 bg-[#D81B60] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                <Star size={10} fill="currentColor" /> Principal
              </span>
            )}

            {/* Controles de imagen */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {idx > 0 && (
                <button
                  type="button"
                  onClick={() => handleMoveImage(idx, idx - 1)}
                  className="p-1.5 bg-white/90 text-stone-900 rounded-lg hover:bg-white transition"
                  title="Mover a la izquierda"
                >
                  <MoveLeft size={14} />
                </button>
              )}

              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                title="Eliminar"
              >
                <X size={14} />
              </button>

              {idx < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => handleMoveImage(idx, idx + 1)}
                  className="p-1.5 bg-white/90 text-stone-900 rounded-lg hover:bg-white transition"
                  title="Mover a la derecha"
                >
                  <MoveRight size={14} />
                </button>
              )}
            </div>
          </div>
        ))}

        {images.length < maxImages && (
          <label className="border-2 border-dashed border-stone-300 hover:border-[#D81B60] aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-stone-50 hover:bg-pink-50/50 p-4 text-center">
            <input type="file" accept="image/*" multiple onChange={handleFileInput} className="hidden" />
            <Upload size={20} className="text-stone-400 group-hover:text-[#D81B60]" />
            <span className="text-[11px] font-bold text-stone-600">Subir foto</span>
          </label>
        )}
      </div>
    </div>
  );
}
