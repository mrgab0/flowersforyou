"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBulkProducts } from "@/lib/actions/product";
import {
  Upload,
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Image as ImageIcon,
  Package,
  Wand2,
  Sparkles,
  DollarSign,
  Tag,
  Flower2
} from "lucide-react";

const CATEGORIES = [
  "Rosas de Lujo",
  "Bouquets & Cajas",
  "Ramos Gigantes",
  "Flores Exóticas",
  "Cumpleaños",
  "Aniversario",
  "Condolencias",
  "General"
];

const BADGES = ["", "Bestsellers", "Luxury", "Popular!", "Oferta", "Nuevo"];

interface DraftProductItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  stock: number;
  images: string[];
  badge: string;
  flowerCount: number;
}

export default function CargaEnMasaProductosPage() {
  const router = useRouter();
  const [draftItems, setDraftItems] = useState<DraftProductItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Valores predeterminados para lote
  const [defaultPrice, setDefaultPrice] = useState<number>(65);
  const [defaultCategory, setDefaultCategory] = useState<string>("Rosas de Lujo");
  const [defaultStock, setDefaultStock] = useState<number>(10);

  const cleanFilenameToName = (filename: string): string => {
    let clean = filename.replace(/\.[^/.]+$/, "");
    clean = clean.replace(/[-_]/g, " ");
    clean = clean.replace(/\b\w/g, (char) => char.toUpperCase());
    return clean.trim() || "Arreglo Floral Flowers For You";
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        if (imageUrl) {
          const newItem: DraftProductItem = {
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name: cleanFilenameToName(file.name),
            price: defaultPrice,
            category: defaultCategory,
            description: "Elegante arreglo floral confeccionado con flores frescas de máxima calidad por Flowers For You.",
            stock: defaultStock,
            images: [imageUrl],
            badge: "",
            flowerCount: 24,
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
    const newItem: DraftProductItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: "Nuevo Arreglo Floral",
      price: defaultPrice,
      category: defaultCategory,
      description: "Elegante arreglo floral confeccionado con flores frescas de máxima calidad.",
      stock: defaultStock,
      images: [manualUrl.trim()],
      badge: "",
      flowerCount: 24,
    };
    setDraftItems((prev) => [...prev, newItem]);
    setManualUrl("");
  };

  const handleItemChange = (id: string, field: keyof DraftProductItem, value: any) => {
    setDraftItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setDraftItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleApplyDefaultsToAll = () => {
    setDraftItems((prev) =>
      prev.map((item) => ({
        ...item,
        price: defaultPrice,
        category: defaultCategory,
        stock: defaultStock,
      }))
    );
  };

  const handleSaveAll = async (publishImmediately: boolean) => {
    if (draftItems.length === 0) return;
    setSaving(true);
    try {
      const res = await createBulkProducts(draftItems, publishImmediately);
      if (res.success) {
        setSuccessCount(res.count || draftItems.length);
        setDraftItems([]);
        setTimeout(() => {
          router.push("/admin/productos");
        }, 1500);
      } else {
        alert(res.error || "Ocurrió un error al guardar los productos.");
      }
    } catch (err: any) {
      alert("Error de conexión al guardar lote.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/productos"
              className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-black text-stone-900 flex items-center gap-2">
              <Upload className="text-[#D81B60]" /> Carga Masiva de Productos
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1 pl-11">
            Importa decenas de arreglos florales simultáneamente seleccionando fotos o URLs.
          </p>
        </div>

        {draftItems.length > 0 && (
          <div className="flex items-center gap-2 pl-11 sm:pl-0">
            <button
              onClick={() => handleSaveAll(false)}
              disabled={saving}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition disabled:opacity-50"
            >
              Guardar como Borrador ({draftItems.length})
            </button>
            <button
              onClick={() => handleSaveAll(true)}
              disabled={saving}
              className="px-5 py-2 bg-[#D81B60] hover:bg-[#b0004a] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              <span>Publicar Todo en Tienda</span>
            </button>
          </div>
        )}
      </div>

      {successCount !== null && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span>¡Se crearon exitosamente {successCount} productos en el catálogo de Flowers For You! Redirigiendo...</span>
        </div>
      )}

      {/* Panel de Configuración de Valores por Defecto */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs space-y-4">
        <h2 className="text-xs font-black uppercase tracking-wider text-stone-700 flex items-center gap-2">
          <Wand2 size={16} className="text-[#D81B60]" />
          <span>Valores Automáticos para Nuevos Ítems</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-stone-500 font-bold mb-1">Categoría Base</label>
            <select
              value={defaultCategory}
              onChange={(e) => setDefaultCategory(e.target.value)}
              className="w-full p-2.5 border rounded-xl bg-white font-medium focus:border-[#D81B60] focus:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-stone-500 font-bold mb-1">Precio Sugerido ($ USD)</label>
            <input
              type="number"
              step="0.01"
              value={defaultPrice}
              onChange={(e) => setDefaultPrice(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 border rounded-xl bg-white font-medium focus:border-[#D81B60] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-stone-500 font-bold mb-1">Stock Inicial</label>
            <input
              type="number"
              value={defaultStock}
              onChange={(e) => setDefaultStock(parseInt(e.target.value) || 0)}
              className="w-full p-2.5 border rounded-xl bg-white font-medium focus:border-[#D81B60] focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleApplyDefaultsToAll}
              disabled={draftItems.length === 0}
              className="w-full py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition disabled:opacity-40"
            >
              Aplicar a Lista Actual
            </button>
          </div>
        </div>
      </div>

      {/* Zona de Subida y Selección */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Subida Múltiple desde PC */}
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
            <p className="text-sm font-black text-stone-900">Seleccionar fotos múltiples de tu computadora</p>
            <p className="text-xs text-stone-400 mt-0.5">Puedes elegir 10, 20 o más archivos a la vez (PNG, JPG, WebP)</p>
          </div>
        </label>

        {/* Añadir por URL */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-800 mb-2">Añadir Imagen por URL</h3>
            <p className="text-xs text-stone-400 mb-3">Pega un enlace web directo de imagen:</p>
            <input
              type="url"
              placeholder="https://ejemplo.com/rosa.jpg"
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

      {/* Tabla de Productos en Preparación */}
      {draftItems.length > 0 && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-stone-900">
              Productos Listos para Importar ({draftItems.length})
            </h3>
            <button
              onClick={() => setDraftItems([])}
              className="text-xs text-red-500 font-bold hover:underline"
            >
              Vaciar Lista
            </button>
          </div>

          <div className="space-y-3">
            {draftItems.map((item, idx) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200 items-center text-xs"
              >
                {/* Imagen */}
                <div className="md:col-span-1 flex items-center justify-center">
                  <img
                    src={item.images[0] || "/logo.jpg"}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-xl border border-stone-200"
                  />
                </div>

                {/* Nombre */}
                <div className="md:col-span-4">
                  <label className="block text-[10px] text-stone-400 font-bold mb-0.5">Nombre Arreglo</label>
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-200 bg-white font-bold text-stone-900"
                  />
                </div>

                {/* Categoría */}
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

                {/* Precio */}
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

                {/* Stock */}
                <div className="md:col-span-1">
                  <label className="block text-[10px] text-stone-400 font-bold mb-0.5">Stock</label>
                  <input
                    type="number"
                    value={item.stock}
                    onChange={(e) => handleItemChange(item.id, "stock", parseInt(e.target.value) || 0)}
                    className="w-full p-2 rounded-lg border border-stone-200 bg-white font-medium"
                  />
                </div>

                {/* Acciones */}
                <div className="md:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 text-stone-400 hover:text-red-500 rounded-lg transition"
                    title="Quitar"
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
