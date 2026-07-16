import Link from "next/link";
import dbConnect from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { deleteProduct } from "@/lib/actions/product";

export default async function InventarioAdmin() {
  await dbConnect();
  const products = await Product.find({}).lean();

  return (
    <div className="space-y-8">
      {/* Cabecera Inventario */}
      <div className="flex justify-between items-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold">Inventario Actual</h2>
        <div className="flex gap-4">
          <Link href="/admin/productos" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">
            Editar Productos
          </Link>
          <Link href="/admin/productos/crear" className="bg-[#FF97A4] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#B0004A]">
            + Crear Producto
          </Link>
        </div>
      </div>

      {/* Tabla Listado */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-gray-500 uppercase text-xs tracking-wider">
                <th className="p-4">SKU</th>
                <th className="p-4">Producto</th>
                <th className="p-4">Precio</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: any) => (
                <tr key={product._id.toString()} className="border-b text-sm">
                  <td className="p-4 font-mono text-gray-500">{product.sku || "S/N"}</td>
                  <td className="p-4 font-bold text-[#1A1C1C]">{product.name}</td>
                  <td className="p-4">${product.price.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full font-bold text-xs ${
                      product.stock > 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {product.stock || 0} u.
                    </span>
                  </td>
                  <td className="p-4 flex gap-4">
                    <a href={`/admin/productos/editar/${product._id.toString()}`} className="text-blue-500 hover:text-blue-700 font-bold">
                      Editar
                    </a>
                    <form action={deleteProduct.bind(null, product._id.toString())}>
                      <button type="submit" className="text-red-500 hover:text-red-700 font-bold">
                        Eliminar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

