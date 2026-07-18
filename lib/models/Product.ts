import mongoose, { Schema, Document } from 'mongoose';

// Interface para el Producto
export interface IProduct extends Document {
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  category: string;
  flowerType: string;
  dimensions: string;
  careInstructions: string;
  addons: mongoose.Types.ObjectId[] | any[]; // Reforzado
  seo: {
    title: string;
    description: string;
  };
  createdAt: Date;
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  sku: { type: String, default: "" },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: [{ type: String }],
  stock: { type: Number, default: 0 },
  category: { type: String, required: true },
  flowerType: { type: String, default: "" },
  dimensions: { type: String, default: "" },
  careInstructions: { type: String, default: "" },
  features: [{ label: String, value: String }],
  flowerCount: { type: Number },
  bouquetType: { type: String },
  addons: [{ type: Schema.Types.ObjectId, ref: 'Addon' }],
  seo: {
    title: { type: String },
    description: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Normaliza acentos
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
    .replace(/\s+/g, '-') // Reemplaza espacios por -
    .replace(/[^\w\-]+/g, '') // Elimina caracteres especiales (incluyendo rayas especiales)
    .replace(/\-\-+/g, '-') // Evita guiones múltiples --
    .replace(/^-+/, '') // Quita guiones iniciales
    .replace(/-+$/, ''); // Quita guiones finales
}

// Middleware para generar slug si no existe (opcional)
ProductSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    const name = this.get('name') as string;
    this.set('slug', slugify(name));
  }
  next();
});

export const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
