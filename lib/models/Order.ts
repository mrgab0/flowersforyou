import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  orderId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  address: string;
  destLat?: number;
  destLng?: number;
  distanceMiles?: number;
  googleMapsUrl?: string;
  deliveryMethod?: string;
  deliveryFee?: number;
  couponCode?: string;
  discountAmount?: number;
  taxAmount?: number;
  cardMessage?: string;
  items: Array<{ id: string; name: string; price: number; quantity: number; addons?: any[] }>;
  total: number;
  paymentMethod: string;
  paymentRef: string;
  status: string;
  // Campos de Uber Direct
  uberDeliveryId?: string;
  uberTrackingUrl?: string;
  uberStatus?: string;
  uberFee?: number;
  uberCourier?: {
    name?: string;
    phone?: string;
    vehicle?: string;
    img?: string;
    location?: { lat: number; lng: number };
  };
  uberDropoffEta?: Date;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, default: "" },
  customerPhone: { type: String, required: true },
  address: { type: String, required: true },
  destLat: { type: Number, default: 0 },
  destLng: { type: Number, default: 0 },
  distanceMiles: { type: Number, default: 0 },
  googleMapsUrl: { type: String, default: "" },
  deliveryMethod: { type: String, default: "Envío Estándar" },
  deliveryFee: { type: Number, default: 0 },
  couponCode: { type: String, default: "" },
  discountAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  cardMessage: { type: String, default: "" },
  items: [{ id: String, name: String, price: Number, quantity: Number, addons: Schema.Types.Mixed }],
  total: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  paymentRef: { type: String, required: true },
  status: { 
    type: String, 
    default: "En diseño",
  },
  // Campos de Uber Direct
  uberDeliveryId: { type: String, default: "" },
  uberTrackingUrl: { type: String, default: "" },
  uberStatus: { type: String, default: "" },
  uberFee: { type: Number, default: 0 },
  uberCourier: {
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    vehicle: { type: String, default: "" },
    img: { type: String, default: "" },
    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 }
    }
  },
  uberDropoffEta: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

export const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
