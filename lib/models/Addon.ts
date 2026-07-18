import mongoose, { Schema, Document } from 'mongoose';

export interface IAddon extends Document {
  name: string;
  price: number;
  isActive: boolean;
  category: string; // e.g., 'Globos', 'Chocolates'
  type: 'select' | 'text'; // 'select' for predefined options, 'text' for custom input
}

const AddonSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
  category: { type: String, required: true },
  type: { type: String, enum: ['select', 'text'], default: 'select' },
});

export const Addon = mongoose.models.Addon || mongoose.model<IAddon>('Addon', AddonSchema);
