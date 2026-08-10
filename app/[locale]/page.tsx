import {getTranslations} from 'next-intl/server';
import { ProductCard } from "@/components/shop/ProductCard/ProductCard";
import { WhatsAppButton } from "@/components/shop/WhatsAppButton/WhatsAppButton";
import { HeroSlider } from "@/components/shop/HeroSlider/HeroSlider";
import { StickyNav } from "@/components/shop/StickyNav";
import { Footer } from "@/components/shop/Footer";
import { SocialFeedSection } from "@/components/shop/SocialFeedSection";
import { ReviewsSection } from "@/components/shop/ReviewsSection";
import { CustomIframeSection } from "@/components/shop/CustomIframeSection";
import dbConnect from "@/lib/db";
import { Product } from "@/lib/models/Product";
import { getSiteConfig } from "@/lib/actions/siteConfig";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale});
  await dbConnect();
  const products = await Product.find({ isActive: { $ne: false } }).lean();
  const { data: siteConfig } = await getSiteConfig();

  const desktopCols = siteConfig?.productColumnsDesktop || 3;
  let gridColsClass = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8";
  if (desktopCols === 4) {
    gridColsClass = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6";
  } else if (desktopCols === 5) {
    gridColsClass = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6";
  }

  return (
    <main className="min-h-screen bg-[#F9F9F9] dark:bg-[#0B0C10] transition-colors duration-300">
      <section className="relative min-h-[440px] py-10 sm:py-14 flex flex-col items-center justify-center bg-white dark:bg-[#12131A] overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-20 w-72 h-72 bg-[#FF97A4] rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 -right-20 w-96 h-96 bg-[#FF97A4] rounded-full blur-3xl animate-pulse delay-700" />
        </div>
        
        <StickyNav siteConfig={siteConfig} />

        <div className="container mx-auto px-6 text-center z-10 pt-8 pb-8">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-black text-[#1A1C1C] dark:text-white mb-4 tracking-tighter">
            {siteConfig?.heroTitle || t('Index.title')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-500 dark:text-gray-300 max-w-3xl mx-auto mb-8 font-medium leading-relaxed">
            {siteConfig?.heroSlogan || t('Index.description')}
          </p>
          <a href="/productos" className="inline-block bg-[#FF97A4] text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:bg-[#B0004A] transition-all shadow-xl shadow-[#FF97A4]/20 hover:scale-105 active:scale-95">
            {siteConfig?.heroButtonText || t('Index.exploreButton')}
          </a>
        </div>
      </section>

      {/* Slider Section */}
      <div className="container mx-auto px-6 -mt-12 sm:-mt-14 relative z-20">
        <HeroSlider />
      </div>

      {/* Módulo iFrame Personalizado (si está activo en el Editor del Home) */}
      {siteConfig?.enableCustomIframe && (
        <CustomIframeSection
          title={siteConfig.customIframeTitle}
          iframeHtml={siteConfig.customIframeHtml}
        />
      )}

      {/* Product Grid con Columnas Dinámicas (3, 4 o 5) */}
      <section className="container mx-auto px-6 py-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-[#FF97A4] text-xs font-black uppercase tracking-[0.2em]">{t('Index.premiumSelection')}</span>
            <h2 className="text-4xl font-serif font-bold text-[#1A1C1C] dark:text-white mt-2">{t('Index.ourFlowers')}</h2>
          </div>
          <a href="/productos" className="text-[#FF97A4] font-bold border-b-2 border-[#FF97A4] pb-1 hover:text-[#B0004A] hover:border-[#B0004A] transition-all">
            {t('Index.viewCatalog')}
          </a>
        </div>

        <div className={gridColsClass}>
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
                image={product.images && product.images.length > 0 ? product.images[0] : "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&q=80&w=800"}
              />
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center">{t('Index.noProducts')}</p>
          )}
        </div>
      </section>

      {/* Módulo de Reseñas / Calificaciones de Clientes & Trustpilot */}
      {siteConfig?.enableReviewsSection !== false && (
        <ReviewsSection
          title={siteConfig?.reviewsTitle}
          ratingScore={siteConfig?.reviewsRatingScore}
          countText={siteConfig?.reviewsCountText}
          trustpilotWidgetHtml={siteConfig?.trustpilotWidgetHtml}
        />
      )}

      {/* Módulo Social Instagram / TikTok (si está activo en el Editor del Home) */}
      {siteConfig?.enableSocialFeed && (
        <SocialFeedSection
          title={siteConfig.socialFeedTitle}
          embedHtml={siteConfig.socialEmbedHtml}
        />
      )}

      <WhatsAppButton phoneNumber="16576988586" />

      <Footer siteConfig={siteConfig} />
    </main>
  );
}
