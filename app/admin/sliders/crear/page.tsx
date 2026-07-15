"use client";

import { useState } from "react";
import { createSlider } from "@/lib/actions/slider";
import { useRouter } from "next/navigation";

export default function CrearSliderPage() {
  const [type, setType] = useState<'banner' | 'spotlight'>('banner');
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const data = Object.fromEntries(formData.entries());
    data.type = type;
    const result = await createSlider(data);
    if (result.success) {
      router.push("/admin/sliders");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Crear Nuevo Slider</h1>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="font-bold">Estándar de Imágenes:</p>
        <p>Resolución recomendada: 1920x500px, Formato: WebP, DPI: 72.</p>
      </div>

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-bold mb-1">Tipo de Slider</label>
          <select value={type} onChange={(e) => setType(e.target.value as any)} className="border p-2 w-full rounded">
            <option value="banner">Banner Promocional (Imagen grande)</option>
            <option value="spotlight">Spotlight de Productos (Cards + Contador)</option>
          </select>
        </div>
        
        {type === 'banner' ? (
          <>
            <input name="title" placeholder="Título" className="border p-2 w-full rounded" required />
            <input name="description" placeholder="Descripción" className="border p-2 w-full rounded" />
            <input name="image" placeholder="URL de la Imagen" className="border p-2 w-full rounded" required />
            <input name="link" placeholder="Enlace (URL)" className="border p-2 w-full rounded" />
          </>
        ) : (
          <>
            <input name="title" placeholder="Título del Spotlight" className="border p-2 w-full rounded" required />
            <input name="discountPercentage" type="number" placeholder="% Descuento" className="border p-2 w-full rounded" required />
            <input name="discountExpiry" type="datetime-local" className="border p-2 w-full rounded" required />
            <p className="text-sm text-gray-500">Nota: Los productos se seleccionarán en la siguiente versión.</p>
          </>
        )}
        
        <button type="submit" className="bg-[#FF97A4] text-white px-6 py-3 rounded-lg font-bold w-full hover:bg-[#B0004A]">Guardar Slider</button>
      </form>
    </div>
  );
}
