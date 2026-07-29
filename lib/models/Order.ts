import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  orderId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  address: string;
  deliveryMethod?: string;
  deliveryFee?: number;
  couponCode?: string;
  discountAmount?: number;
  items: Array<{ id: string; name: string; price: number; quantity: number; addons?: any[] }>;
  total: number;
  paymentMethod: string;
  paymentRef: string;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, default: "" },
  customerPhone: { type: String, required: true },
  address: { type: String, required: true },
  deliveryMethod: { type: String, default: "Envío Estándar" },
  deliveryFee: { type: Number, default: 0 },
  couponCode: { type: String, default: "" },
  discountAmount: { type: Number, default: 0 },
  items: [{ id: String, name: String, price: Number, quantity: Number, addons: Schema.Types.Mixed }],
  total: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentRef: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
