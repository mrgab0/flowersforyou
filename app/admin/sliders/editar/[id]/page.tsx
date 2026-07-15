"use client";

import { useState, useEffect } from "react";
import { getSliderById, updateSlider } from "@/lib/actions/slider";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function EditarSliderPage() {
  const [slider, setSlider] = useState<any>(null);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    async function loadSlider() {
      const { data } = await getSliderById(id as string);
      if (data) setSlider(data);
    }
    loadSlider();
  }, [id]);

  const handleSubmit = async (formData: FormData) => {
    const data = Object.fromEntries(formData.entries());
    await updateSlider(id as string, data);
    router.push("/admin/sliders");
  };

  if (!slider) return <div>Cargando...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Editar Promoción</h1>

      <form action={handleSubmit} className="space-y-4">
        {/* Usamos el tipo cargado para mostrar campos */}
        <input name="title" defaultValue={slider.title} className="border p-2 w-full rounded" required />
        {slider.type === 'banner' ? (
          <>
            <input name="description" defaultValue={slider.description} className="border p-2 w-full rounded" />
            <input name="image" defaultValue={slider.image} className="border p-2 w-full rounded" required />
            <input name="link" defaultValue={slider.link} className="border p-2 w-full rounded" />
          </>
        ) : (
          <>
            <input name="discountPercentage" type="number" defaultValue={slider.discountPercentage} className="border p-2 w-full rounded" required />
            <input name="discountExpiry" type="datetime-local" defaultValue={slider.discountExpiry ? new Date(slider.discountExpiry).toISOString().slice(0, 16) : ''} className="border p-2 w-full rounded" required />
          </>
        )}
        
        <button type="submit" className="bg-[#FF97A4] text-white px-6 py-3 rounded-lg font-bold w-full">Guardar Cambios</button>
      </form>
    </div>
  );
}
