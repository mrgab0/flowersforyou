"use client";

import Link from 'next/link';
import React from 'react';
import { useCart } from "@/components/shop/Cart/CartContext";
import { useTranslations } from "next-intl";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  badge?: string;
  image: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  slug,
  price,
  category,
  badge,
  image
}) => {
  const { addToCart } = useCart();
  const t = useTranslations("common");

  return (
    <div className="group relative bg-white rounded-2xl transition-all duration-500 overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0px_12px_30px_rgba(0,0,0,0.08)]">
      <Link href={`/productos/${slug}`} className="block">
        {/* Contenedor de Imagen con Zoom suave */}
        <div className="relative aspect-square overflow-hidden bg-white">
          <img
            src={image || "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=800"}
            alt={name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Badge Flotante estilo Categoría */}
          <div className="absolute top-4 left-4">
            <span className="bg-[#FDF2F7] text-[#FF97A4] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-[0.05em] shadow-sm">
              {category}
            </span>
          </div>

          {/* Insignia / Badge Personalizada */}
          {badge && (
            <div className="absolute top-4 right-4">
              <span className="bg-[#1A1C1C] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                {badge}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-6">
        <h3 className="font-serif font-bold text-lg text-[#1A1C1C] group-hover:text-[#FF97A4] transition-colors mb-2">
          <Link href={`/productos/${slug}`}>{name}</Link>
        </h3>
        <div className="flex justify-between items-center mt-4">
          <span className="text-2xl font-extrabold text-[#FF97A4]">${price.toFixed(2)}</span>
          <button 
            onClick={() => addToCart({ id, name, price, image })}
            className="bg-[#FF97A4] text-white px-5 py-2.5 rounded-xl hover:bg-[#B0004A] active:scale-95 transition-all duration-300 font-bold text-sm shadow-md shadow-[#FF97A4]/20"
          >
            {t('addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
};
