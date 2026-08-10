"use server";

import dbConnect from "@/lib/db";
import { SiteConfig } from "@/lib/models/SiteConfig";
import { revalidatePath } from "next/cache";

const DEFAULT_SITE_CONFIG = {
  key: "global",
  heroTitle: "Flowers For You",
  heroSlogan: "Arreglos florales exclusivos y detalles de lujo diseñados para sorprender a quien más amas.",
  heroButtonText: "Explorar Colección",
  footerTitle: "Flowers For You LLC",
  footerSlogan: "Boutique Digital de Alta Floristería • Entregas a Domicilio",
  footerCopyright: "© 2026 Flowers For You LLC. Todos los derechos reservados.",
  productColumnsDesktop: 3,
  productColumnsMobile: 2,
  logoUrl: "/logo.jpg",
  brandSlogan: "Boutique Floral Digital • Houston, Texas",
  menuHomeLabel: "Inicio",
  menuCatalogLabel: "Colección",
  menuTrackingLabel: "📦 Rastreo",
  menuAboutLabel: "Nosotros",
  menuContactLabel: "Contacto",
  primaryColor: "#FF97A4",
  enableHeaderSocials: true,
  facebookUrl: "https://facebook.com",
  instagramUrl: "https://instagram.com",
  tiktokUrl: "https://tiktok.com",
  whatsappUrl: "https://wa.me/16576988586",
  enableSocialFeed: false,
  socialFeedTitle: "Síguenos en Instagram & TikTok 📸",
  socialEmbedHtml: "",
  enableReviewsSection: true,
  reviewsTitle: "Lo que dicen nuestros clientes en Houston ⭐⭐⭐⭐⭐",
  reviewsRatingScore: "4.9 / 5.0",
  reviewsCountText: "+180 Opiniones Verificadas",
  trustpilotWidgetHtml: "",
  enableCustomIframe: false,
  customIframeTitle: "Ubicación & Promociones Destacadas",
  customIframeHtml: ""
};

export async function getSiteConfig() {
  await dbConnect();
  try {
    let config = await SiteConfig.findOne({ key: "global" }).lean();
    if (!config) {
      config = await SiteConfig.create(DEFAULT_SITE_CONFIG);
    }
    return { success: true, data: JSON.parse(JSON.stringify(config)) };
  } catch (error) {
    console.error("Error al obtener configuración del sitio:", error);
    return { success: true, data: DEFAULT_SITE_CONFIG };
  }
}

export async function updateSiteConfig(formData: FormData) {
  await dbConnect();
  try {
    const heroTitle = formData.get("heroTitle") as string || DEFAULT_SITE_CONFIG.heroTitle;
    const heroSlogan = formData.get("heroSlogan") as string || DEFAULT_SITE_CONFIG.heroSlogan;
    const heroButtonText = formData.get("heroButtonText") as string || DEFAULT_SITE_CONFIG.heroButtonText;
    const footerTitle = formData.get("footerTitle") as string || DEFAULT_SITE_CONFIG.footerTitle;
    const footerSlogan = formData.get("footerSlogan") as string || DEFAULT_SITE_CONFIG.footerSlogan;
    const footerCopyright = formData.get("footerCopyright") as string || DEFAULT_SITE_CONFIG.footerCopyright;

    // Campos de Cuadrícula de Productos
    const productColumnsDesktop = parseInt(formData.get("productColumnsDesktop") as string) || 3;
    const productColumnsMobile = parseInt(formData.get("productColumnsMobile") as string) || 2;

    // Identidad y Menú
    const logoUrl = formData.get("logoUrl") as string || "/logo.jpg";
    const brandSlogan = formData.get("brandSlogan") as string || DEFAULT_SITE_CONFIG.brandSlogan;
    const menuHomeLabel = formData.get("menuHomeLabel") as string || DEFAULT_SITE_CONFIG.menuHomeLabel;
    const menuCatalogLabel = formData.get("menuCatalogLabel") as string || DEFAULT_SITE_CONFIG.menuCatalogLabel;
    const menuTrackingLabel = formData.get("menuTrackingLabel") as string || DEFAULT_SITE_CONFIG.menuTrackingLabel;
    const menuAboutLabel = formData.get("menuAboutLabel") as string || DEFAULT_SITE_CONFIG.menuAboutLabel;
    const menuContactLabel = formData.get("menuContactLabel") as string || DEFAULT_SITE_CONFIG.menuContactLabel;
    const primaryColor = formData.get("primaryColor") as string || "#FF97A4";

    // Redes Sociales en Cabecera (Toggle ON/OFF)
    const enableHeaderSocials = formData.get("enableHeaderSocials") === "true";
    const facebookUrl = formData.get("facebookUrl") as string || "";
    const instagramUrl = formData.get("instagramUrl") as string || "";
    const tiktokUrl = formData.get("tiktokUrl") as string || "";
    const whatsappUrl = formData.get("whatsappUrl") as string || "";

    // Módulo Social de Instagram/TikTok (Toggle ON/OFF)
    const enableSocialFeed = formData.get("enableSocialFeed") === "true";
    const socialFeedTitle = formData.get("socialFeedTitle") as string || DEFAULT_SITE_CONFIG.socialFeedTitle;
    const socialEmbedHtml = formData.get("socialEmbedHtml") as string || "";

    // Módulo de Reseñas / Opiniones & Trustpilot (Toggle ON/OFF)
    const enableReviewsSection = formData.get("enableReviewsSection") === "true";
    const reviewsTitle = formData.get("reviewsTitle") as string || DEFAULT_SITE_CONFIG.reviewsTitle;
    const reviewsRatingScore = formData.get("reviewsRatingScore") as string || DEFAULT_SITE_CONFIG.reviewsRatingScore;
    const reviewsCountText = formData.get("reviewsCountText") as string || DEFAULT_SITE_CONFIG.reviewsCountText;
    const trustpilotWidgetHtml = formData.get("trustpilotWidgetHtml") as string || "";

    // Módulo de iFrames / Widgets (Toggle ON/OFF)
    const enableCustomIframe = formData.get("enableCustomIframe") === "true";
    const customIframeTitle = formData.get("customIframeTitle") as string || DEFAULT_SITE_CONFIG.customIframeTitle;
    const customIframeHtml = formData.get("customIframeHtml") as string || "";

    await SiteConfig.findOneAndUpdate(
      { key: "global" },
      {
        heroTitle,
        heroSlogan,
        heroButtonText,
        footerTitle,
        footerSlogan,
        footerCopyright,
        productColumnsDesktop,
        productColumnsMobile,
        logoUrl,
        brandSlogan,
        menuHomeLabel,
        menuCatalogLabel,
        menuTrackingLabel,
        menuAboutLabel,
        menuContactLabel,
        primaryColor,
        enableHeaderSocials,
        facebookUrl,
        instagramUrl,
        tiktokUrl,
        whatsappUrl,
        enableSocialFeed,
        socialFeedTitle,
        socialEmbedHtml,
        enableReviewsSection,
        reviewsTitle,
        reviewsRatingScore,
        reviewsCountText,
        trustpilotWidgetHtml,
        enableCustomIframe,
        customIframeTitle,
        customIframeHtml,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    revalidatePath("/", "layout");
    revalidatePath("/admin/configuracion");
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar configuración del sitio:", error);
    return { success: false, error: "No se pudo guardar la configuración modular." };
  }
}

export async function updateSeoConfig(formData: FormData) {
  await dbConnect();
  try {
    const seoTitle = formData.get("seoTitle") as string || "";
    const seoDescription = formData.get("seoDescription") as string || "";
    const seoKeywords = formData.get("seoKeywords") as string || "";
    const ogImage = formData.get("ogImage") as string || "";
    const googleSiteVerification = formData.get("googleSiteVerification") as string || "";
    const bingSiteVerification = formData.get("bingSiteVerification") as string || "";
    const googleAnalyticsId = formData.get("googleAnalyticsId") as string || "";
    const businessName = formData.get("businessName") as string || "";
    const businessPhone = formData.get("businessPhone") as string || "";
    const businessAddress = formData.get("businessAddress") as string || "";
    const businessCity = formData.get("businessCity") as string || "";

    await SiteConfig.findOneAndUpdate(
      { key: "global" },
      {
        seoTitle,
        seoDescription,
        seoKeywords,
        ogImage,
        googleSiteVerification,
        bingSiteVerification,
        googleAnalyticsId,
        businessName,
        businessPhone,
        businessAddress,
        businessCity,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    revalidatePath("/", "layout");
    revalidatePath("/admin/seo");
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar configuración SEO:", error);
    return { success: false, error: "No se pudieron guardar las configuraciones de SEO." };
  }
}
