"use client";

import Link from 'next/link';
import React from 'react';
import { useCart } from "@/components/shop/Cart/CartContext";

interface ProductCardProps {
  id: string; // ID es necesario para el carrito
  name: string;
  slug: string;
  price: number;
  image: string;
  category: string;
}

export const ProductCard = ({ id, name, slug, price, image, category }: ProductCardProps) => {
  const { addToCart } = useCart();

  return (
    <div className="group relative bg-white rounded-2xl transition-all duration-500 overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0px_12px_30px_rgba(0,0,0,0.08)]">
      <Link href={`/productos/${slug}`} className="block">
        {/* Contenedor de Imagen con Zoom suave */}
        <div className="relative aspect-square overflow-hidden bg-[#F9F9F9]">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Badge Flotante estilo Chip */}
          <div className="absolute top-4 left-4">
            <span className="bg-[#FDF2F7] text-[#FF97A4] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-[0.05em] shadow-sm">
              {category}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-6">
        {/* Tipografía: Manrope para títulos */}
        <h3 className="text-xl font-bold text-[#1A1C1C] leading-tight mb-2 tracking-tight group-hover:text-[#FF97A4] transition-colors duration-300">
          {name}
        </h3>
        
        <div className="flex items-end justify-between mt-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Precio</span>
            <span className="text-2xl font-extrabold text-[#FF97A4]">${price.toFixed(2)}</span>
          </div>
          
          {/* Botón de acción minimalista */}
          <button 
            onClick={() => addToCart({ id, name, price, image })}
            className="bg-[#FF97A4] text-white px-5 py-2.5 rounded-lg hover:bg-[#B0004A] active:scale-95 transition-all duration-300 font-bold text-sm shadow-md shadow-[#FF97A4]/20"
          >
            Añadir
          </button>
        </div>
      </div>
    </div>
  );
};

