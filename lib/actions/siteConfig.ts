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
  footerCopyright: "© 2026 Flowers For You LLC. Todos los derechos reservados."
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

    await SiteConfig.findOneAndUpdate(
      { key: "global" },
      {
        heroTitle,
        heroSlogan,
        heroButtonText,
        footerTitle,
        footerSlogan,
        footerCopyright,
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    revalidatePath("/");
    revalidatePath("/es");
    revalidatePath("/en");
    revalidatePath("/admin/configuracion");
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar lemas del sitio:", error);
    return { success: false, error: "No se pudieron guardar los lemas del sitio." };
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

    revalidatePath("/");
    revalidatePath("/admin/seo");
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar configuración SEO:", error);
    return { success: false, error: "No se pudieron guardar las configuraciones de SEO." };
  }
}

