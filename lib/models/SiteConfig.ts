import mongoose, { Schema, Document } from "mongoose";

export interface ISiteConfig extends Document {
  key: string; // "global"
  heroTitle: string;
  heroSlogan: string;
  heroButtonText: string;
  footerTitle: string;
  footerSlogan: string;
  footerCopyright: string;

  // Campos de 2FA (Seguridad de Dos Factores)
  twoFactorMode?: "none" | "pin" | "totp"; // "none" (desactivado), "pin" (PIN de 6 dígitos), "totp" (App Autenticadora)
  twoFactorPin?: string;
  twoFactorSecret?: string;

  // Código OTP de rescate por email de emergencia
  rescueOtpCode?: string;
  rescueOtpExpiresAt?: Date;

  updatedAt: Date;
}

const SiteConfigSchema: Schema = new Schema({
  key: { type: String, required: true, unique: true, default: "global" },
  heroTitle: { type: String, default: "Flowers For You" },
  heroSlogan: { type: String, default: "Arreglos florales exclusivos y detalles de lujo diseñados para sorprender a quien más amas." },
  heroButtonText: { type: String, default: "Explorar Colección" },
  footerTitle: { type: String, default: "Flowers For You LLC" },
  footerSlogan: { type: String, default: "Boutique Digital de Alta Floristería • Entregas a Domicilio" },
  footerCopyright: { type: String, default: "© 2026 Flowers For You LLC. Todos los derechos reservados." },

  twoFactorMode: { type: String, default: "none" },
  twoFactorPin: { type: String, default: "" },
  twoFactorSecret: { type: String, default: "" },

  rescueOtpCode: { type: String, default: "" },
  rescueOtpExpiresAt: { type: Date, default: null },

  updatedAt: { type: Date, default: Date.now }
});

export const SiteConfig = mongoose.models.SiteConfig || mongoose.model<ISiteConfig>("SiteConfig", SiteConfigSchema);
