import dbConnect from "@/lib/db";
import { Product, IProduct } from "@/lib/models/Product";
import { updateProduct } from "@/lib/actions/product";

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  
  const resolvedParams = await params;
  const product = (await Product.findById(resolvedParams.id).lean()) as IProduct | null;

  if (!product) {
    return <div className="p-8">Producto no encontrado</div>;
  }

  const updateProductWithId = async (formData: FormData) => {
    'use server';
    await updateProduct(product._id.toString(), formData);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-[#1A1C1C]">Editar Producto</h2>
      
      <form action={updateProductWithId} className="space-y-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nombre del Producto</label>
          <input name="name" defaultValue={product.name} placeholder="Ramo Magenta Imperial" className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D81B60]" required />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">SKU (Código único)</label>
          <input name="sku" defaultValue={product.sku || ""} placeholder="RAM-MAG-001" className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D81B60]" required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Precio ($ USD)</label>
            <input name="price" type="number" step="0.01" defaultValue={product.price} placeholder="85.00" className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D81B60]" required />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Stock / Cantidad Total</label>
            <input name="stock" type="number" defaultValue={product.stock || 0} placeholder="10" className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D81B60]" required />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Categoría</label>
          <input name="category" defaultValue={product.category} placeholder="Bestseller" className="p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D81B60]" required />
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Imágenes del Producto (URLs)</label>
          <input name="images" defaultValue={product.images[0] || ""} placeholder="URL Imagen 1 (Principal)" className="p-3 border rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#D81B60]" required />
          <input name="images" defaultValue={product.images[1] || ""} placeholder="URL Imagen 2" className="p-3 border rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#D81B60]" />
          <input name="images" defaultValue={product.images[2] || ""} placeholder="URL Imagen 3" className="p-3 border rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-[#D81B60]" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Descripción del Producto</label>
          <textarea name="description" defaultValue={product.description} placeholder="Detalles sobre el diseño floral..." className="p-3 border rounded-xl h-32 focus:outline-none focus:ring-2 focus:ring-[#D81B60]" required />
        </div>
        
        <div className="flex gap-4 pt-4 border-t">
            <button type="submit" className="bg-[#D81B60] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-[#B0004A] transition-colors shadow-md">
              Guardar Cambios
            </button>
            <a href="/admin/productos" className="bg-gray-100 text-gray-700 px-8 py-3 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors">
              Cancelar
            </a>
        </div>
      </form>
    </div>
  );
}
