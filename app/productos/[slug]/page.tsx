import dbConnect from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/shop/AddToCartButton";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  
  const resolvedParams = await params;
  const productDoc = await Product.findOne({ slug: resolvedParams.slug }).lean();

  if (!productDoc) {
    notFound();
  }

  // Convertimos a JSON plano para que React pueda pasarlo a un Client Component
  const product = JSON.parse(JSON.stringify(productDoc));

  return (
    <main className="min-h-screen bg-[#F9F9F9] py-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          {/* Imagen */}
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Detalles */}
          <div className="flex flex-col justify-center">
            <span className="text-[#D81B60] font-bold uppercase tracking-widest text-xs mb-2">{product.category}</span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#1A1C1C] mb-4">{product.name}</h1>
            <p className="text-3xl font-extrabold text-[#D81B60] mb-6">${product.price.toFixed(2)}</p>
            
            {/* Especificaciones Técnicas */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-[10px] text-gray-500 font-bold uppercase">SKU</p>
                <p className="font-mono font-bold text-sm">{product.sku || "N/A"}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-[10px] text-gray-500 font-bold uppercase">Stock</p>
                <p className="font-bold text-sm">{product.stock || 0} unidades</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-bold text-sm uppercase tracking-widest text-[#1A1C1C] mb-3">Detalles</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <AddToCartButton product={product} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
