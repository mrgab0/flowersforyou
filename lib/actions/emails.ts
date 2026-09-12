"use server";

import dbConnect from "@/lib/db";
import { EmailMessage } from "@/lib/models/EmailMessage";
import { sendEmail, getAdminEmails, getCorporateEmailConfig } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function getEmailsAction(params?: {
  folder?: "inbox" | "sent" | "all";
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  try {
    await dbConnect();
    const folder = params?.folder || "inbox";
    const search = params?.search?.trim() || "";
    const page = params?.page || 1;
    const limit = params?.limit || 50;

    const query: any = {};

    if (folder === "inbox") {
      query.direction = "inbound";
    } else if (folder === "sent") {
      query.direction = "outbound";
    }

    if (params?.type && params.type !== "all") {
      query.type = params.type;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { subject: regex },
        { customerName: regex },
        { customerEmail: regex },
        { customerPhone: regex },
        { from: regex },
        { to: regex },
        { orderId: regex },
      ];
    }

    const total = await EmailMessage.countDocuments(query);
    const unreadCount = await EmailMessage.countDocuments({ direction: "inbound", isRead: false });

    const messages = await EmailMessage.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(messages)),
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  } catch (error: any) {
    console.error("Error al obtener correos:", error);
    return { success: false, error: error?.message || "Error al cargar correos." };
  }
}

export async function sendCustomEmailAction(data: {
  to: string | string[];
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  type?: "direct_email" | "quote" | "delivery_update" | "general";
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  orderId?: string;
  bccAdmins?: boolean;
}) {
  try {
    await dbConnect();
    const emailCfg = await getCorporateEmailConfig();
    const toRecipients = Array.isArray(data.to)
      ? data.to.map((e) => e.trim()).filter(Boolean)
      : data.to.split(",").map((e) => e.trim()).filter(Boolean);

    if (toRecipients.length === 0) {
      return { success: false, error: "Debes ingresar al menos un correo de destino válido." };
    }

    if (!data.subject.trim()) {
      return { success: false, error: "El asunto del correo no puede estar vacío." };
    }

    if (!data.bodyHtml.trim()) {
      return { success: false, error: "El contenido del mensaje no puede estar vacío." };
    }

    // Lista final de destinatarios
    const adminEmails = getAdminEmails();
    const finalRecipients = [...toRecipients];

    if (data.bccAdmins !== false) {
      for (const adm of adminEmails) {
        if (!finalRecipients.includes(adm)) {
          finalRecipients.push(adm);
        }
      }
    }

    // Plantilla visual Flowers For You para correos enviados desde el panel
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://flowerforyoullc.com";
    const logoSrc = `${siteUrl.replace(/\/$/, "")}/logo.jpg`;

    const wrappedHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background: #ffffff;">
        <div style="background-color: #FF97A4; padding: 22px; text-align: center;">
          <table role="presentation" style="margin: 0 auto; border-collapse: collapse;">
            <tr>
              <td style="vertical-align: middle; padding-right: 12px;">
                <img src="${logoSrc}" alt="Logo" style="width: 44px; height: 44px; border-radius: 50%; border: 2px solid #ffffff; display: block; object-fit: cover;" />
              </td>
              <td style="vertical-align: middle; text-align: left;">
                <h1 style="color: #ffffff; margin: 0; font-family: Georgia, serif; font-size: 22px; font-weight: bold;">Flowers For You LLC</h1>
                <p style="color: rgba(255,255,255,0.92); margin: 2px 0 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: bold;">Boutique Digital & Alta Floristería</p>
              </td>
            </tr>
          </table>
        </div>
        
        <div style="padding: 25px 30px; color: #333333; line-height: 1.6; font-size: 14px;">
          ${data.bodyHtml}
        </div>

        <div style="background-color: #1A1C1C; color: white; padding: 15px; text-align: center; font-size: 11px;">
          Flowers For You LLC • Houston, Texas • Atención: (657) 698-8586
        </div>
      </div>
    `;

    const sendRes = await sendEmail({
      to: finalRecipients,
      subject: data.subject.trim(),
      html: wrappedHtml,
      replyTo: emailCfg.replyTo,
    });

    if (!sendRes.success) {
      return { success: false, error: sendRes.error || "No se pudo entregar el correo." };
    }

    // Registrar en MongoDB
    const logged = await EmailMessage.create({
      direction: "outbound",
      type: data.type || "direct_email",
      from: sendRes.sender || emailCfg.senderFormatted,
      to: toRecipients,
      replyTo: emailCfg.replyTo,
      subject: data.subject.trim(),
      bodyHtml: wrappedHtml,
      bodyText: data.bodyText || "",
      status: "sent",
      isRead: true,
      customerName: data.customerName || "",
      customerPhone: data.customerPhone || "",
      customerEmail: data.customerEmail || toRecipients[0],
      orderId: data.orderId || "",
      resendMessageId: sendRes.messageId || "",
      bccAdmins: data.bccAdmins !== false,
      createdAt: new Date(),
    });

    revalidatePath("/admin/correos");
    return {
      success: true,
      message: `Correo enviado exitosamente a ${toRecipients.join(", ")}`,
      data: JSON.parse(JSON.stringify(logged)),
    };
  } catch (error: any) {
    console.error("Error al enviar correo desde el panel:", error);
    return { success: false, error: error?.message || "Error al enviar correo." };
  }
}

export async function markEmailAsReadAction(id: string, isRead: boolean = true) {
  try {
    await dbConnect();
    await EmailMessage.findByIdAndUpdate(id, { isRead });
    revalidatePath("/admin/correos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Error al actualizar estado." };
  }
}

export async function deleteEmailAction(id: string) {
  try {
    await dbConnect();
    await EmailMessage.findByIdAndDelete(id);
    revalidatePath("/admin/correos");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Error al eliminar correo." };
  }
}

export async function getEmailStatsAction() {
  try {
    await dbConnect();
    const unreadInbox = await EmailMessage.countDocuments({ direction: "inbound", isRead: false });
    const totalInbox = await EmailMessage.countDocuments({ direction: "inbound" });
    const totalSent = await EmailMessage.countDocuments({ direction: "outbound" });
    return { success: true, unreadInbox, totalInbox, totalSent };
  } catch (error: any) {
    return { success: false, unreadInbox: 0, totalInbox: 0, totalSent: 0 };
  }
}
