import {getTranslations} from 'next-intl/server';
import { ProductCard } from "@/components/shop/ProductCard/ProductCard";
import { WhatsAppButton } from "@/components/shop/WhatsAppButton/WhatsAppButton";
import { HeroSlider } from "@/components/shop/HeroSlider/HeroSlider";
import { StickyNav } from "@/components/shop/StickyNav";
import { CreditCard } from "lucide-react";
import dbConnect from "@/lib/db";
import { Product } from "@/lib/models/Product";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale});
  await dbConnect();
  const products = await Product.find({ isActive: { $ne: false } }).lean();

  return (
    <main className="min-h-screen bg-[#F9F9F9]">
      <section className="relative h-[60vh] flex flex-col items-center justify-center bg-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-20 w-72 h-72 bg-[#FF97A4] rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 -right-20 w-96 h-96 bg-[#FF97A4] rounded-full blur-3xl animate-pulse delay-700" />
        </div>
        
        <StickyNav />

        <div className="container mx-auto px-6 text-center z-10">
          <h1 className="text-5xl md:text-7xl font-serif font-black text-[#1A1C1C] mb-6 tracking-tighter">
            {t('Index.title')}
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
            {t('Index.description')}
          </p>
          <button className="bg-[#FF97A4] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#B0004A] transition-all shadow-xl shadow-[#FF97A4]/20">
            {t('Index.exploreButton')}
          </button>
        </div>
      </section>

      {/* ... Rest of the component ... */}
      <div className="container mx-auto px-6 -mt-24 relative z-20">
        <HeroSlider />
      </div>

      <section className="container mx-auto px-6 py-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-[#FF97A4] text-xs font-black uppercase tracking-[0.2em]">{t('Index.premiumSelection')}</span>
            <h2 className="text-4xl font-serif font-bold text-[#1A1C1C] mt-2">{t('Index.ourFlowers')}</h2>
          </div>
          <a href="#" className="text-[#FF97A4] font-bold border-b-2 border-[#FF97A4] pb-1 hover:text-[#B0004A] hover:border-[#B0004A] transition-all">
            {t('Index.viewCatalog')}
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
                image={product.images[0] || "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&q=80&w=800"}
              />
            ))
          ) : (
            <p className="text-gray-500">{t('Index.noProducts')}</p>
          )}
        </div>
      </section>

      <WhatsAppButton phoneNumber="16576988586" />

      <footer className="bg-[#1A1C1C] text-gray-200 py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-gray-800 pb-12 mb-12">
            <h3 className="text-2xl font-serif font-bold text-white">Flowers For You</h3>
            <div className="flex gap-6 text-sm font-bold tracking-widest text-gray-300 uppercase">
              <span>{t('Footer.address1')}</span>
              <span>{t('Footer.address2')}</span>
              <span>{t('Footer.boutique')}</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 text-center md:text-left">
            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">
              {t('Footer.copyright')}
            </p>
            <div className="flex justify-center md:justify-end gap-4 items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{t('Footer.accept')}</span>
              <div className="flex gap-3 text-white">
                <CreditCard size={24} strokeWidth={1.5} />
                <span className="text-xs font-semibold">{t('Footer.cards')}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
