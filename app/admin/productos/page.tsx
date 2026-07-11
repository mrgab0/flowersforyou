import { createProduct } from "@/lib/actions/product";

export default function ProductosAdmin() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Añadir Nuevo Producto</h2>
      
      <form action={createProduct} className="space-y-4">
        <input name="name" placeholder="Nombre" className="w-full p-2 border rounded" required />
        <input name="price" type="number" step="0.01" placeholder="Precio" className="w-full p-2 border rounded" required />
        <input name="category" placeholder="Categoría" className="w-full p-2 border rounded" required />
        <input name="image" placeholder="URL de Imagen (Unsplash, etc.)" className="w-full p-2 border rounded" required />
        <textarea name="description" placeholder="Descripción" className="w-full p-2 border rounded" required />
        
        <button type="submit" className="bg-[#D81B60] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#B0004A]">
          Guardar Producto
        </button>
      </form>
    </div>
  );
}
