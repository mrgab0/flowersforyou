"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBulkAddons } from "@/lib/actions/addon";
import {
  Upload,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Layers,
  Sparkles,
  DollarSign,
  Tag
} from "lucide-react";

const CATEGORIES = [
  "Chocolates & Dulces",
  "Peluches",
  "Globos con Helio",
  "Coronas & Joyería",
  "Personalización & Lazos",
  "Otros Adicionales"
];

interface DraftAddonItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  type: "checkbox" | "text" | "select";
}

export default function CargaEnMasaAdicionalesPage() {
  const router = useRouter();
  const [draftItems, setDraftItems] = useState<DraftAddonItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [defaultPrice, setDefaultPrice] = useState<number>(15);
  const [defaultCategory, setDefaultCategory] = useState<string>("Chocolates & Dulces");

  const cleanFilenameToName = (filename: string): string => {
    let clean = filename.replace(/\.[^/.]+$/, "");
    clean = clean.replace(/[-_]/g, " ");
    clean = clean.replace(/\b\w/g, (char) => char.toUpperCase());
    return clean.trim() || "Adicional Concierge";
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        if (imageUrl) {
          const newItem: DraftAddonItem = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: cleanFilenameToName(file.name),
            price: defaultPrice,
            category: defaultCategory,
            description: "Complemento especial para arreglos florales.",
            image: imageUrl,
            type: "checkbox",
          };
          setDraftItems((prev) => [...prev, newItem]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;
    const newItem: DraftAddonItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: "Nuevo Adicional",
      price: defaultPrice,
      category: defaultCategory,
      description: "Complemento especial para arreglos florales.",
      image: manualUrl.trim(),
      type: "checkbox",
    };
    setDraftItems((prev) => [...prev, newItem]);
    setManualUrl("");
  };

  const handleItemChange = (id: string, field: keyof DraftAddonItem, value: any) => {
    setDraftItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setDraftItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveAll = async (publishImmediately: boolean) => {
    if (draftItems.length === 0) return;
    setSaving(true);
    try {
      const res = await createBulkAddons(draftItems, publishImmediately);
      if (res.success) {
        setSuccessCount(res.count || draftItems.length);
        setDraftItems([]);
        setTimeout(() => {
          router.push("/admin/adicionales");
        }, 1500);
      } else {
        alert(res.error || "Ocurrió un error al guardar los adicionales.");
      }
    } catch (err: any) {
      alert("Error de conexión al guardar lote de adicionales.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/adicionales"
              className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
              <Layers className="text-[#D81B60]" /> Carga Masiva de Adicionales
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1 pl-11">
            Importa chocolates, peluches, globos y complementos por lotes para Flowers For You.
          </p>
        </div>

        {draftItems.length > 0 && (
          <div className="flex items-center gap-2 pl-11 sm:pl-0">
            <button
              onClick={() => handleSaveAll(false)}
              disabled={saving}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition disabled:opacity-50"
            >
              Guardar Borrador ({draftItems.length})
            </button>
            <button
              onClick={() => handleSaveAll(true)}
              disabled={saving}
              className="px-5 py-2 bg-[#D81B60] hover:bg-[#b0004a] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              <span>Publicar en Tienda</span>
            </button>
          </div>
        )}
      </div>

      {successCount !== null && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span>¡Se guardaron exitosamente {successCount} adicionales en el catálogo! Redirigiendo...</span>
        </div>
      )}

      {/* Selector Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="md:col-span-2 border-2 border-dashed border-stone-300 hover:border-[#D81B60] rounded-3xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer bg-white hover:bg-pink-50/40 transition text-center shadow-xs">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesSelected}
            className="hidden"
          />
          <div className="p-3 bg-pink-50 rounded-2xl text-[#D81B60]">
            <Upload size={28} />
          </div>
          <div>
            <p className="text-sm font-black text-stone-900">Seleccionar fotos múltiples de adicionales</p>
            <p className="text-xs text-stone-400 mt-0.5">El nombre del archivo se convertirá en el nombre del producto.</p>
          </div>
        </label>

        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-800 mb-2">Añadir por URL</h3>
            <input
              type="url"
              placeholder="https://ejemplo.com/chocolate.jpg"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              className="w-full p-2.5 text-xs border rounded-xl focus:border-[#D81B60] focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleAddManualUrl}
            className="w-full mt-3 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition"
          >
            + Añadir a Lista
          </button>
        </div>
      </div>

      {/* Lista para editar */}
      {draftItems.length > 0 && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-stone-900">
              Adicionales Listos ({draftItems.length})
            </h3>
            <button
              onClick={() => setDraftItems([])}
              className="text-xs text-red-500 font-bold hover:underline"
            >
              Vaciar Lista
            </button>
          </div>

          <div className="space-y-3">
            {draftItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200 items-center text-xs"
              >
                <div className="md:col-span-1 flex items-center justify-center">
                  <img
                    src={item.image || "/logo.jpg"}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-xl border border-stone-200"
                  />
                </div>

                <div className="md:col-span-5">
                  <label className="block text-[10px] text-stone-400 font-bold mb-0.5">Nombre</label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-200 bg-white font-bold text-stone-900"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[10px] text-stone-400 font-bold mb-0.5">Categoría</label>
                  <select
                    value={item.category}
                    onChange={(e) => handleItemChange(item.id, "category", e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-200 bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] text-stone-400 font-bold mb-0.5">Precio ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => handleItemChange(item.id, "price", parseFloat(e.target.value) || 0)}
                    className="w-full p-2 rounded-lg border border-stone-200 bg-white font-black text-[#D81B60]"
                  />
                </div>

                <div className="md:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 text-stone-400 hover:text-red-500 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
