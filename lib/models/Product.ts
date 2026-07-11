import mongoose, { Schema, Document } from 'mongoose';

// Interface para el Producto
export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  category: string;
  occasion: string;
  seo: {
    title: string;
    description: string;
  };
  createdAt: Date;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }],
  stock: { type: Number, default: 0 },
  category: { type: String, required: true },
  occasion: { type: String },
  seo: {
    title: { type: String },
    description: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});

// Middleware para generar slug si no existe (opcional)
ProductSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    // Lógica simple de slug
    this.set('slug', this.get('name').toLowerCase().replace(/ /g, '-'));
  }
  next();
});

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
