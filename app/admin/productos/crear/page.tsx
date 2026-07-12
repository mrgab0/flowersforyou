"use client";

import { useState } from "react";
import { createProduct } from "@/lib/actions/product";
import { CheckCircle2, Eye, Edit3, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CrearProductoPage() {
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<{ success: boolean; id?: string } | null>(null);

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
    <div className="relative max-w-2xl mx-auto">
      {/* Formulario */}
      <div className={`bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transition-all duration-500 ${
        successData ? "opacity-0 scale-95 pointer-events-none absolute inset-0" : "opacity-100 scale-100"
      }`}>
        <h2 className="text-2xl font-bold mb-6 text-[#1A1C1C]">Añadir Nuevo Producto</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nombre del Producto</label>
            <input name="name" placeholder="Ramo Magenta Imperial" className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4]" required />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">SKU (Código único)</label>
            <input name="sku" placeholder="RAM-MAG-001" className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4]" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Precio ($ USD)</label>
              <input name="price" type="number" step="0.01" placeholder="85.00" className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4]" required />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stock / Cantidad Total</label>
              <input name="stock" type="number" placeholder="10" className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4]" required />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categoría</label>
            <input name="category" placeholder="Bestseller" className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4]" required />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">URL de Imagen</label>
            <input name="image" placeholder="https://images.unsplash.com/..." className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF97A4]" required />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Descripción del Producto</label>
            <textarea name="description" placeholder="Detalles sobre el diseño floral..." className="p-3 border rounded-xl h-32 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]" required />
          </div>
          
          <div className="flex gap-4 pt-4 border-t">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-[#FF97A4] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-[#B0004A] transition-colors shadow-md disabled:bg-gray-400 flex items-center gap-2"
              >
                {loading ? "Guardando..." : "Guardar Producto"}
              </button>
              <Link href="/admin/productos" className="bg-gray-100 text-gray-700 px-8 py-3 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors">
                Cancelar
              </Link>
          </div>
        </form>
      </div>

      {/* Pantalla de Éxito Animada */}
      {successData && (
        <div className="bg-white p-12 rounded-2xl shadow-xl border border-gray-100 text-center animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center">
          <div className="bg-green-100 p-4 rounded-full text-green-600 mb-6 animate-bounce">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">¡Producto Creado!</h2>
          <p className="text-gray-500 mb-8 max-w-sm">El producto se ha guardado correctamente en tu catálogo de MongoDB Atlas.</p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link 
              href="/" 
              target="_blank"
              className="flex items-center justify-center gap-2 bg-[#1A1C1C] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-black transition-all"
            >
              <Eye size={18} /> Ver Publicación
            </Link>
            <Link 
              href={`/admin/productos/editar/${successData.id}`}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all"
            >
              <Edit3 size={18} /> Editar Nuevamente
            </Link>
            <button 
              onClick={() => {
                setSuccessData(null);
                // Reseteamos el formulario recargando
                window.location.reload();
              }}
              className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
            >
              <ArrowLeft size={18} /> Crear Otro
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

