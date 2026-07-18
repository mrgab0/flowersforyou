"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { AddonSelection } from "@/components/shop/AddonSelection";

export const ProductDetail = ({ product }: { product: any }) => {
  console.log("Product data received in ProductDetail:", product);
  const [selectedAddons, setSelectedAddons] = useState<{ addonId: string; value?: string }[]>([]);

  return (
    <main className="min-h-screen bg-[#F9F9F9] py-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          {/* Imagen */}
          <div className="md:sticky md:top-20 h-fit">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />
            </div>
          </div>

          {/* Detalles */}
          <div className="flex flex-col">
            <span className="text-[#FF97A4] font-black uppercase tracking-[0.2em] text-xs mb-3">{product.category}</span>
            <h1 className="text-3xl md:text-5xl font-serif font-black text-[#1A1C1C] mb-6 leading-tight tracking-tighter">{product.name}</h1>
            <p className="text-4xl font-black text-[#FF97A4] mb-8">${product.price.toFixed(2)}</p>
            
            {/* Características */}
            {product.features && product.features.length > 0 && (
              <div className="mb-10">
                <h3 className="font-bold text-lg text-[#1A1C1C] mb-4">Características</h3>
                <div className="bg-gray-50 rounded-2xl p-6">
                  {product.features.map((feature: any, index: number) => (
                    <div key={index} className="flex py-2 border-b border-gray-200 last:border-0">
                      <span className="text-gray-500 w-1/2">{feature.label}</span>
                      <span className="text-gray-900 font-bold w-1/2">{feature.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sección de Addons */}
            {product.addons && product.addons.length > 0 && (
              <div className="mb-10">
                <h3 className="font-bold text-lg text-[#1A1C1C] mb-4">Adicionales</h3>
                <AddonSelection addons={product.addons} onSelectionChange={setSelectedAddons} />
              </div>
            )}

            <div className="mb-8">
              <h3 className="font-bold text-lg text-[#1A1C1C] mb-4">Descripción</h3>
              <p className="text-gray-600 leading-relaxed text-lg font-light">
                {product.description}
              </p>
            </div>

            <div className="mt-auto">
              <AddToCartButton product={{...product, selectedAddons}} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
