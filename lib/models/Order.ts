import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  orderId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
  total: number;
  paymentMethod: string;
  paymentRef: string;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  address: { type: String, required: true },
  items: [{ id: String, name: String, price: Number, quantity: Number }],
  total: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentRef: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
