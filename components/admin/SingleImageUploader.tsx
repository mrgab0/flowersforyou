"use client";

import React, { useState } from "react";
import { Upload, X, Link as LinkIcon } from "lucide-react";

interface SingleImageUploaderProps {
  name?: string;
  label: string;
  defaultValue?: string;
  currentImage?: string;
  recommendation?: string;
  required?: boolean;
  onImageUploaded?: (url: string) => void;
}

export function SingleImageUploader({
  name = "image",
  label,
  defaultValue = "",
  currentImage,
  recommendation,
  required = false,
  onImageUploaded,
}: SingleImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState<string>(currentImage || defaultValue);
  const [manualUrl, setManualUrl] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  const handleRemove = () => {
    setImageUrl("");
    onImageUploaded?.("");
  };

  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;
    const url = manualUrl.trim();
    setImageUrl(url);
    onImageUploaded?.(url);
    setManualUrl("");
    setShowManualInput(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setImageUrl(result);
        onImageUploaded?.(result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2 border border-stone-200 p-4 rounded-2xl bg-white shadow-xs">
      <input type="hidden" name={name} value={imageUrl} required={required && !imageUrl} />

      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-stone-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowManualInput(!showManualInput)}
          className="text-[11px] text-[#D81B60] font-bold hover:underline flex items-center gap-1"
        >
          <LinkIcon size={12} />
          <span>{showManualInput ? "Ocultar URL" : "Pegar URL"}</span>
        </button>
      </div>

      {recommendation && <p className="text-[10px] text-stone-400">{recommendation}</p>}

      {showManualInput && (
        <div className="flex gap-2 pt-1">
          <input
            type="url"
            placeholder="https://..."
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            className="flex-1 p-2 text-xs border rounded-xl focus:outline-none focus:border-[#D81B60]"
          />
          <button
            type="button"
            onClick={handleAddManualUrl}
            className="px-3 py-1.5 bg-[#D81B60] text-white text-xs font-bold rounded-xl hover:bg-[#b0004a] transition"
          >
            Añadir
          </button>
        </div>
      )}

      {imageUrl ? (
        <div className="relative aspect-video max-w-sm rounded-xl overflow-hidden border border-stone-200 bg-stone-50">
          <img src={imageUrl} alt={label} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition shadow-sm"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="border-2 border-dashed border-stone-300 hover:border-[#D81B60] rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition bg-stone-50 hover:bg-pink-50/40 text-center">
          <input type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
          <Upload size={22} className="text-stone-400" />
          <span className="text-xs font-bold text-stone-600">Subir imagen</span>
          <span className="text-[10px] text-stone-400">PNG, JPG, WebP</span>
        </label>
      )}
    </div>
  );
}
