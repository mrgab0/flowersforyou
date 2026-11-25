import mongoose, { Schema, Document } from "mongoose";

export interface ICorporateAccount {
  id: string;
  email: string;
  name: string;
  role: string;
  color?: string;
  isDefault?: boolean;
  signature?: string;
}

export interface IThemeConfig {
  announcementBg?: string;
  announcementText?: string;
  headerBg?: string;
  headerText?: string;
  buttonPrimaryBg?: string;
  buttonPrimaryText?: string;
  buttonPrimaryHoverBg?: string;
  buttonSecondaryBg?: string;
  buttonSecondaryText?: string;
  accentColor?: string;
  headingColor?: string;
  bodyTextColor?: string;
  scriptTextColor?: string;
  footerBg?: string;
  footerText?: string;
  footerAccent?: string;
  pageBg?: string;
  cardBg?: string;
  cardBorder?: string;
  priceColor?: string;
  badgeBg?: string;
  badgeText?: string;
}

export interface ISiteConfig extends Document {
  key: string; // "global"
  heroTitle: string;
  heroSlogan: string;
  heroButtonText: string;
  footerTitle: string;
  footerSlogan: string;
  footerCopyright: string;

  // Personalización del Home & Cuadrícula de Productos
  productColumnsDesktop?: number;
  productColumnsMobile?: number;

  // Identidad de Marca y Menú de Navegación
  logoUrl?: string;
  brandSlogan?: string;
  primaryColor?: string;

  // Redes Sociales en Cabecera
  enableHeaderSocials?: boolean;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  whatsappUrl?: string;

  // Campos SEO por defecto
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImage?: string;
  businessName?: string;
  businessPhone?: string;
  businessAddress?: string;

  // Configuración de Correo Corporativo & Resend
  corporateSenderEmail?: string;
  corporateSenderName?: string;
  corporateReplyToEmail?: string;
  resendApiKey?: string;
  adminNotifyEmails?: string[];
  corporateAccounts?: ICorporateAccount[];

  // Editor de Tema Visual de la Tienda
  themeConfig?: IThemeConfig;

  updatedAt: Date;
}

const SiteConfigSchema: Schema = new Schema({
  key: { type: String, required: true, unique: true, default: "global" },
  heroTitle: { type: String, default: "Flowers For You" },
  heroSlogan: { type: String, default: "Floristería Boutique & Arreglos Florales Exclusivos para Sorprender." },
  heroButtonText: { type: String, default: "Ver Catálogo" },
  footerTitle: { type: String, default: "Flowers For You" },
  footerSlogan: { type: String, default: "Alta Floristería de Lujo & Diseños Únicos" },
  footerCopyright: { type: String, default: "© 2026 Flowers For You. Todos los derechos reservados." },

  productColumnsDesktop: { type: Number, default: 3 },
  productColumnsMobile: { type: Number, default: 2 },

  logoUrl: { type: String, default: "/logo.jpg" },
  brandSlogan: { type: String, default: "Floristería Boutique & Regalos Exclusivos" },
  primaryColor: { type: String, default: "#D81B60" },

  enableHeaderSocials: { type: Boolean, default: true },
  facebookUrl: { type: String, default: "" },
  instagramUrl: { type: String, default: "" },
  tiktokUrl: { type: String, default: "" },
  whatsappUrl: { type: String, default: "" },

  seoTitle: { type: String, default: "Flowers For You | Alta Floristería & Diseños Exclusivos" },
  seoDescription: { type: String, default: "Arreglos florales de lujo, rosas frescas y regalos personalizados a domicilio." },
  seoKeywords: { type: String, default: "flores, rosas, arreglos florales, floristeria, boutique floral" },
  ogImage: { type: String, default: "/logo.jpg" },
  businessName: { type: String, default: "Flowers For You" },
  businessPhone: { type: String, default: "" },
  businessAddress: { type: String, default: "" },

  corporateSenderEmail: { type: String, default: "orders@flowersforyou.com" },
  corporateSenderName: { type: String, default: "Flowers For You" },
  corporateReplyToEmail: { type: String, default: "contact@flowersforyou.com" },
  resendApiKey: { type: String, default: "" },
  adminNotifyEmails: { type: [String], default: ["orders@flowersforyou.com"] },
  corporateAccounts: {
    type: [
      {
        id: { type: String, required: true },
        email: { type: String, required: true },
        name: { type: String, required: true },
        role: { type: String, default: "General" },
        color: { type: String, default: "#D81B60" },
        isDefault: { type: Boolean, default: false },
        signature: { type: String, default: "" },
      },
    ],
    default: [
      {
        id: "contacto",
        email: "contact@flowersforyou.com",
        name: "Flowers For You",
        role: "Atención al Cliente",
        color: "#D81B60",
        isDefault: true,
        signature: "Flowers For You • Alta Floristería Boutique",
      },
    ],
  },

  themeConfig: {
    announcementBg: { type: String, default: "#D81B60" },
    announcementText: { type: String, default: "#ffffff" },
    headerBg: { type: String, default: "#ffffff" },
    headerText: { type: String, default: "#1A1A1A" },
    buttonPrimaryBg: { type: String, default: "#D81B60" },
    buttonPrimaryText: { type: String, default: "#ffffff" },
    buttonPrimaryHoverBg: { type: String, default: "#AD1457" },
    buttonSecondaryBg: { type: String, default: "#FCE4EC" },
    buttonSecondaryText: { type: String, default: "#D81B60" },
    accentColor: { type: String, default: "#D81B60" },
    headingColor: { type: String, default: "#1A1A1A" },
    bodyTextColor: { type: String, default: "#4A5568" },
    scriptTextColor: { type: String, default: "#D81B60" },
    footerBg: { type: String, default: "#1A1A1A" },
    footerText: { type: String, default: "#ffffff" },
    footerAccent: { type: String, default: "#D81B60" },
    pageBg: { type: String, default: "#FFFFFF" },
    cardBg: { type: String, default: "#ffffff" },
    cardBorder: { type: String, default: "#f3f4f6" },
    priceColor: { type: String, default: "#D81B60" },
    badgeBg: { type: String, default: "#D81B60" },
    badgeText: { type: String, default: "#ffffff" },
  },

  updatedAt: { type: Date, default: Date.now },
});

export const SiteConfig = mongoose.models.SiteConfig || mongoose.model<ISiteConfig>("SiteConfig", SiteConfigSchema);
