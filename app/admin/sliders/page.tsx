"use client";

import { getSliders, deleteSlider } from "@/lib/actions/slider";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SlidersPage() {
  const [sliders, setSliders] = useState<any[]>([]);

  useEffect(() => {
    loadSliders();
  }, []);

  async function loadSliders() {
    const { data } = await getSliders();
    if (data) setSliders(data);
  }

  async function handleDelete(id: string) {
    if (confirm("¿Estás seguro de eliminar esta promoción?")) {
      await deleteSlider(id);
      loadSliders();
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Promociones y Publicidad</h1>
        <Link href="/admin/sliders/crear" className="bg-[#FF97A4] text-white px-4 py-2 rounded">
          Crear Nueva Promoción
        </Link>
      </div>

      <div className="grid gap-4">
        {sliders.map((slider) => (
          <div key={slider._id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center border">
            <div>
              <h3 className="font-bold">{slider.title}</h3>
              <p className="text-sm text-gray-500 capitalize">{slider.type}</p>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/sliders/editar/${slider._id}`} className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                Editar
              </Link>
              <button 
                onClick={() => handleDelete(slider._id)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
