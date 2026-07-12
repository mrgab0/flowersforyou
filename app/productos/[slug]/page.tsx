import dbConnect from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  await dbConnect();
  
  const resolvedParams = await params;
  const product = await Product.findOne({ slug: resolvedParams.slug }).lean();

  if (!product) {
    notFound();
  }

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
            
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="flex flex-col gap-4">
              <button className="bg-[#D81B60] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#B0004A] transition-all shadow-lg shadow-[#D81B60]/20">
                Añadir al Carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
