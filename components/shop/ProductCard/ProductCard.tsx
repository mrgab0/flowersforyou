"use client";

import React from 'react';

interface ProductCardProps {
  name: string;
  price: number;
  image: string;
  category: string;
}

/**
 * ProductCard: Magenta Flora Modern Style
 * Enfoque en "Lujo Editorial", espacio en blanco y tipografía Manrope/Jakarta.
 */
export const ProductCard = ({ name, price, image, category }: ProductCardProps) => {
  return (
    <div className="group relative bg-white rounded-2xl transition-all duration-500 overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0px_12px_30px_rgba(0,0,0,0.08)]">
      {/* Contenedor de Imagen con Zoom suave */}
      <div className="relative aspect-[4/5] overflow-hidden bg-[#F9F9F9]">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {/* Badge Flotante estilo Chip */}
        <div className="absolute top-4 left-4">
          <span className="bg-[#FDF2F7] text-[#D81B60] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-[0.05em] shadow-sm">
            {category}
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Tipografía: Manrope para títulos */}
        <h3 className="text-xl font-bold text-[#1A1C1C] leading-tight mb-2 tracking-tight group-hover:text-[#D81B60] transition-colors duration-300">
          {name}
        </h3>
        
        <div className="flex items-end justify-between mt-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">Precio</span>
            {/* El precio destaca en Magenta según DESIGN.md */}
            <span className="text-2xl font-extrabold text-[#D81B60]">${price.toFixed(2)}</span>
          </div>
          
          {/* Botón de acción minimalista */}
          <button className="bg-[#D81B60] text-white px-5 py-2.5 rounded-lg hover:bg-[#B0004A] active:scale-95 transition-all duration-300 font-bold text-sm shadow-md shadow-[#D81B60]/20">
            Añadir
          </button>
        </div>
      </div>
    </div>
  );
};
