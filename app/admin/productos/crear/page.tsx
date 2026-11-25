"use client";

import { useState, useEffect } from "react";
import { createProduct } from "@/lib/actions/product";
import { getAddons } from "@/lib/actions/addon";
import { ProductNameSkuInputs } from "@/components/admin/ProductNameSkuInputs";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { AdminAddonManager } from "@/components/admin/AdminAddonManager";
import { ProductFloralConfigurator } from "@/components/admin/ProductFloralConfigurator";
import { AdminVariantManager } from "@/components/admin/AdminVariantManager";
import { CheckCircle2, Eye, Edit3, ArrowLeft, Flower2 } from "lucide-react";
import Link from "next/link";

export default function CrearProductoPage() {
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ success: boolean; id?: string } | null>(null);
  const [addons, setAddons] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAddons() {
      const res = await getAddons();
      if (res.success && res.data) setAddons(res.data);
    }
    fetchAddons();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createProduct(formData);

    setLoading(false);
    if (result.success) {
      setSuccessData(result);
    } else {
      alert("Hubo un error al guardar el producto.");
    }
  };

  return (
    <div className="relative max-w-3xl mx-auto space-y-6">
      {/* Formulario */}
      <div className={`bg-white p-8 rounded-3xl shadow-sm border border-stone-200 transition-all duration-500 ${
        successData ? "opacity-0 scale-95 pointer-events-none absolute inset-0" : "opacity-100 scale-100"
      }`}>
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-100">
          <Link
            href="/admin/productos"
            className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h2 className="text-2xl font-black text-stone-900">Añadir Arreglo Floral</h2>
            <p className="text-xs text-stone-500">Configura nombre, SKU, fotos, tonos y adicionales para Flowers For You.</p>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre y SKU Auto-generador */}
          <ProductNameSkuInputs />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-stone-700">Precio ($ USD) *</label>
              <input
                name="price"
                type="number"
                step="0.01"
                placeholder="85.00"
                className="p-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D81B60]/20 focus:border-[#D81B60] font-black text-stone-900"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-stone-700">Stock / Unidades *</label>
              <input
                name="stock"
                type="number"
                placeholder="10"
                defaultValue="10"
                className="p-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D81B60]/20 focus:border-[#D81B60]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-stone-700">Categoría *</label>
              <select
                name="category"
                className="p-3 border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-[#D81B60]"
                required
              >
                <option value="Rosas de Lujo">Rosas de Lujo</option>
                <option value="Bouquets & Cajas">Bouquets & Cajas</option>
                <option value="Ramos Gigantes">Ramos Gigantes</option>
                <option value="Flores Exóticas">Flores Exóticas</option>
                <option value="Cumpleaños">Cumpleaños</option>
                <option value="Aniversario">Aniversario</option>
                <option value="General">General</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-stone-700">Distintivo / Badge (Opcional)</label>
              <select
                name="badge"
                className="p-3 border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-[#D81B60]"
              >
                <option value="">Sin distintivo</option>
                <option value="Bestsellers">Bestseller</option>
                <option value="Luxury">Luxury</option>
                <option value="Popular!">Popular!</option>
                <option value="Oferta">Oferta</option>
                <option value="Nuevo">Nuevo</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-stone-700">Descripción del Producto</label>
            <textarea
              name="description"
              placeholder="Detalles sobre el diseño floral, dimensiones, aromas y estilo..."
              className="p-3 border border-stone-200 rounded-xl h-28 focus:outline-none focus:ring-2 focus:ring-[#D81B60]/20 focus:border-[#D81B60]"
              required
            />
          </div>

          {/* Subida Múltiple de Fotos */}
          <ImageUploader />

          {/* Configurador Floral: Tonos y Stem Tiers */}
          <ProductFloralConfigurator />

          {/* Gestor de Adicionales Concierge */}
          <AdminAddonManager addons={addons} />

          <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-[#D81B60] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-[#b0004a] transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              <Flower2 size={16} />
              <span>{loading ? "Guardando en Catálogo..." : "Guardar Arreglo"}</span>
            </button>
            <Link
              href="/admin/productos"
              className="bg-stone-100 text-stone-700 px-6 py-3 rounded-full font-bold text-sm hover:bg-stone-200 transition"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>

      {/* Pantalla de Éxito */}
      {successData && (
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-stone-200 text-center animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center">
          <div className="bg-emerald-100 p-4 rounded-full text-emerald-600 mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-2xl font-black text-stone-900 mb-2">¡Arreglo Creado Exitosamente!</h2>
          <p className="text-stone-500 mb-8 max-w-sm text-xs">
            El producto ya está disponible en la base de datos de Flowers For You.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center text-xs font-bold">
            <Link 
              href="/" 
              target="_blank"
              className="flex items-center justify-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-xl hover:bg-black transition"
            >
              <Eye size={16} /> Ver en Tienda
            </Link>
            <Link 
              href={`/admin/productos/editar/${successData.id}`}
              className="flex items-center justify-center gap-2 bg-[#D81B60] text-white px-6 py-3 rounded-xl hover:bg-[#b0004a] transition"
            >
              <Edit3 size={16} /> Editar
            </Link>
            <button 
              onClick={() => {
                setSuccessData(null);
                window.location.reload();
              }}
              className="flex items-center justify-center gap-2 bg-stone-100 text-stone-700 px-6 py-3 rounded-xl hover:bg-stone-200 transition"
            >
              <ArrowLeft size={16} /> Crear Otro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
