import nodemailer from "nodemailer";

export function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "465", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error("Missing SMTP credentials (SMTP_USER, SMTP_PASS)");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export const DEFAULT_CORPORATE_SENDER = process.env.SMTP_FROM || `"Flowers For You LLC" <sales@flowersforyou.org>`;

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: any[];
}

export async function sendEmail({ to, subject, html, replyTo, attachments }: SendMailOptions) {
  try {
    const transporter = getTransporter();
    const recipients = Array.isArray(to) ? to.join(", ") : to;

    const info = await transporter.sendMail({
      from: DEFAULT_CORPORATE_SENDER,
      to: recipients,
      replyTo: replyTo || "sales@flowersforyou.org",
      subject,
      html,
      attachments,
    });

    console.log(`[Email Success] Sent to ${recipients} | ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("[Email Error] Failed to send email:", error);
    return { success: false, error: error?.message || "Failed to send email" };
  }
}
