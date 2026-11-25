import mongoose, { Schema, Document } from "mongoose";

export interface IEmailMessage extends Document {
  direction: "inbound" | "outbound";
  type: string;
  from: string;
  to: string[];
  replyTo?: string;
  subject: string;
  bodyText?: string;
  bodyHtml: string;
  status: "sent" | "received" | "failed" | "draft";
  isRead: boolean;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  orderId?: string;
  isDeleted?: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const EmailMessageSchema: Schema = new Schema(
  {
    direction: { type: String, enum: ["inbound", "outbound"], default: "outbound" },
    type: { type: String, default: "order_receipt" },
    from: { type: String, default: "" },
    to: [{ type: String }],
    replyTo: { type: String, default: "" },
    subject: { type: String, default: "" },
    bodyText: { type: String, default: "" },
    bodyHtml: { type: String, default: "" },
    status: { type: String, enum: ["sent", "received", "failed", "draft"], default: "sent" },
    isRead: { type: Boolean, default: true },
    customerName: { type: String, default: "" },
    customerPhone: { type: String, default: "" },
    customerEmail: { type: String, default: "" },
    orderId: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const EmailMessage =
  mongoose.models.EmailMessage ||
  mongoose.model<IEmailMessage>("EmailMessage", EmailMessageSchema);
