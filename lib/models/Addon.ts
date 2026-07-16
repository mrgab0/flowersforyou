import mongoose, { Schema, Document } from 'mongoose';

export interface IAddon extends Document {
  name: string;
  price: number;
  isActive: boolean;
}

const AddonSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
});

export const Addon = mongoose.models.Addon || mongoose.model<IAddon>('Addon', AddonSchema);
