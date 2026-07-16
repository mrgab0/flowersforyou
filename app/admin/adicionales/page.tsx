"use client";

import { useState, useEffect } from "react";
import { getAddons, createAddon, deleteAddon } from "@/lib/actions/addon";

export default function AdicionalesPage() {
  const [addons, setAddons] = useState<any[]>([]);

  useEffect(() => {
    loadAddons();
  }, []);

  async function loadAddons() {
    const { data } = await getAddons();
    if (data) setAddons(data);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    await createAddon(formData);
    form.reset();
    loadAddons();
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gestionar Adicionales</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border mb-8 flex gap-4">
        <input name="name" placeholder="Nombre (ej: Ferrero Rocher)" className="border p-2 rounded w-full" required />
        <input name="price" type="number" step="0.01" placeholder="Precio" className="border p-2 rounded w-24" required />
        <button type="submit" className="bg-[#FF97A4] text-white px-4 py-2 rounded font-bold">Añadir</button>
      </form>

      <div className="space-y-2">
        {addons.map((addon) => (
          <div key={addon._id} className="bg-white p-4 rounded border flex justify-between items-center">
            <span>{addon.name} - <span className="font-bold">${addon.price.toFixed(2)}</span></span>
            <button onClick={() => deleteAddon(addon._id).then(loadAddons)} className="text-red-500 font-bold">Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
