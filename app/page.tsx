import { ProductCard } from "@/components/shop/ProductCard/ProductCard";
import { WhatsAppButton } from "@/components/shop/WhatsAppButton/WhatsAppButton";
import { LoginButton } from "@/components/LoginButton";
import { HeroSlider } from "@/components/shop/HeroSlider/HeroSlider";
import { StickyNav } from "@/components/shop/StickyNav";
import { Footer } from "@/components/shop/Footer";
import dbConnect from "@/lib/db";
import { Product } from "@/lib/models/Product";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  await dbConnect();
  // Obtenemos los productos reales activos (isActive !== false)
  const products = await Product.find({ isActive: { $ne: false } }).lean();

  return (
    <main className="min-h-screen bg-[#F9F9F9]">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex flex-col items-center justify-center bg-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-20 w-72 h-72 bg-[#FF97A4] rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 -right-20 w-96 h-96 bg-[#FF97A4] rounded-full blur-3xl animate-pulse delay-700" />
        </div>
        
        {/* Aquí insertamos la navegación */}
        <StickyNav />

        <div className="container mx-auto px-6 text-center z-10">
          <h1 className="text-5xl md:text-7xl font-serif font-black text-[#1A1C1C] mb-6 tracking-tighter">
            Flowers <span className="text-[#FF97A4]">For You</span> LLC
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            Transformamos el arte de regalar en una experiencia de boutique moderna. Diseños vibrantes que respiran sofisticación.
          </p>
          <a href="/productos" className="inline-block bg-[#FF97A4] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#B0004A] transition-all shadow-xl shadow-[#FF97A4]/20 hover:scale-105 active:scale-95">
            Explorar Colección
          </a>
        </div>
      </section>

      {/* Slider Section */}
      <div className="container mx-auto px-6 -mt-24 relative z-20">
        <HeroSlider />
      </div>

      {/* Product Grid */}
      <section className="container mx-auto px-6 py-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-[#FF97A4] text-xs font-black uppercase tracking-[0.2em]">Selección Premium</span>
            <h2 className="text-4xl font-serif font-bold text-[#1A1C1C] mt-2">Nuestras Flores</h2>
          </div>
          <a href="/productos" className="text-[#FF97A4] font-bold border-b-2 border-[#FF97A4] pb-1 hover:text-[#B0004A] hover:border-[#B0004A] transition-all">
            Ver catálogo completo
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.length > 0 ? (
            products.map((product: any) => (
              <ProductCard 
                key={product._id.toString()}
                id={product._id.toString()}
                name={product.name}
                slug={product.slug}
                price={product.price}
                category={product.category}
                badge={product.badge}
                image={product.images && product.images.length > 0 ? product.images[0] : ""}
              />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500 py-8 font-medium">No hay productos disponibles por el momento.</p>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  );
}
