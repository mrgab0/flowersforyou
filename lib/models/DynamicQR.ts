import mongoose, { Schema, Document } from 'mongoose';

export interface IDynamicQR extends Document {
  code: string; // ej. "promo-rosa", "tarjeta-vip" (identificador único: /qr/[code] o /q/[code])
  title: string;
  destinationUrl: string;
  type: 'url' | 'whatsapp' | 'social' | 'custom';
  description?: string;
  designConfig?: {
    stylePreset?: string;
    fgColor?: string;
    bgColor?: string;
    eyeColor?: string;
    includeLogo?: boolean;
    logoUrl?: string;
    logoSize?: number;
  };
  scanCount: number;
  lastScannedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DynamicQRSchema: Schema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    destinationUrl: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['url', 'whatsapp', 'social', 'custom'],
      default: 'url',
    },
    description: {
      type: String,
      default: '',
    },
    designConfig: {
      type: Object,
      default: {},
    },
    scanCount: {
      type: Number,
      default: 0,
    },
    lastScannedAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const DynamicQR =
  mongoose.models.DynamicQR || mongoose.model<IDynamicQR>('DynamicQR', DynamicQRSchema);
