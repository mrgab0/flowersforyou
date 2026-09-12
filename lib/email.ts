import nodemailer from "nodemailer";
import dbConnect from "@/lib/db";
import { SiteConfig } from "@/lib/models/SiteConfig";

export interface SmtpConfigOverride {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
}

export async function getCorporateEmailConfig() {
  let senderEmail = "sales@flowersforyou.com";
  let senderName = "Flowers For You LLC";
  let replyTo = "sales@flowersforyou.com";
  let smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  let smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
  let smtpUser = process.env.SMTP_USER || "";
  let smtpPass = process.env.SMTP_PASS || "";

  try {
    await dbConnect();
    const config: any = await SiteConfig.findOne({ key: "global" }).lean();
    if (config) {
      if (config.corporateSenderEmail) senderEmail = config.corporateSenderEmail.trim();
      if (config.corporateSenderName) senderName = config.corporateSenderName.trim();
      if (config.corporateReplyToEmail) replyTo = config.corporateReplyToEmail.trim();

      if (config.smtpHostOverride) smtpHost = config.smtpHostOverride.trim();
      if (config.smtpPortOverride && config.smtpPortOverride > 0) smtpPort = config.smtpPortOverride;
      if (config.smtpUserOverride) smtpUser = config.smtpUserOverride.trim();
      if (config.smtpPassOverride) smtpPass = config.smtpPassOverride.trim();
    }
  } catch (e) {
    // Si MongoDB no está disponible en tiempo de ejecución, se usan las variables de entorno
  }

  const senderFormatted = `"${senderName}" <${senderEmail}>`;

  return {
    senderFormatted,
    senderEmail,
    senderName,
    replyTo,
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPass,
  };
}

export async function getTransporter(override?: SmtpConfigOverride) {
  const emailCfg = await getCorporateEmailConfig();

  const host = override?.host || emailCfg.smtpHost;
  const port = override?.port || emailCfg.smtpPort;
  const user = override?.user || emailCfg.smtpUser;
  const pass = override?.pass || emailCfg.smtpPass;

  if (!user || !pass) {
    throw new Error("Credenciales SMTP no configuradas. Por favor define SMTP_USER y SMTP_PASS en las variables de entorno o en el Panel de Administración.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export const DEFAULT_CORPORATE_SENDER = process.env.SMTP_FROM || `"Flowers For You LLC" <sales@flowersforyou.com>`;

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  attachments?: any[];
  smtpOverride?: SmtpConfigOverride;
}

export async function sendEmail({ to, subject, html, from, replyTo, attachments, smtpOverride }: SendMailOptions) {
  try {
    const emailCfg = await getCorporateEmailConfig();
    const transporter = await getTransporter(smtpOverride);
    const recipients = Array.isArray(to) ? to.join(", ") : to;

    const fromAddress = from || emailCfg.senderFormatted;
    const replyToAddress = replyTo || emailCfg.replyTo;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: recipients,
      replyTo: replyToAddress,
      subject,
      html,
      attachments,
    });

    console.log(`[Email Success] Enviado a ${recipients} desde ${fromAddress} | ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId, sender: fromAddress };
  } catch (error: any) {
    console.error("[Email Error] Error al enviar correo:", error);
    return { success: false, error: error?.message || "Error al enviar correo" };
  }
}
