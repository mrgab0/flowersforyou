import mongoose, { Schema, Document } from 'mongoose';

export interface ISlider extends Document {
  type: 'banner' | 'spotlight';
  title?: string;
  description?: string;
  image?: string; // Para banners
  link?: string;
  
  // Para spotlight
  products?: mongoose.Types.ObjectId[];
  discountPercentage?: number;
  discountExpiry?: Date;
  
  isActive: boolean;
  createdAt: Date;
}

const SliderSchema: Schema = new Schema({
  type: { type: String, enum: ['banner', 'spotlight'], required: true },
  title: { type: String },
  description: { type: String },
  image: { type: String },
  link: { type: String },
  
  products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  discountPercentage: { type: Number },
  discountExpiry: { type: Date },
  
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const Slider = mongoose.models.Slider || mongoose.model<ISlider>('Slider', SliderSchema);
