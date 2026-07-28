"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/shop/AddToCartButton";
import { AddonSelection } from "@/components/shop/AddonSelection";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { ShoppingCartComponent } from "@/components/shop/Cart/ShoppingCart";
import { CheckCircle2, Flower2, Package, Sparkles, ShieldCheck, Truck, Clock, Tag } from "lucide-react";

export const ProductDetail = ({ product }: { product: any }) => {
  const [selectedAddons, setSelectedAddons] = useState<{ addonId: string; value?: string }[]>([]);
  const images = product.images && product.images.length > 0 ? product.images : ["https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&q=80&w=800"];
  const [activeImage, setActiveImage] = useState(images[0]);

  // Formateador de viñetas para la descripción si contiene guiones o saltos de línea
  const descriptionBullets = (product.description || "")
    .split("\n")
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0);

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col font-sans">
      {/* Header Visible con Logo al Home y Carrito */}
      <ShopHeader />

      {/* Carrito Flotante de la Tienda */}
      <ShoppingCartComponent />

      {/* Contenido Principal */}
      <main className="flex-1 py-10 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl space-y-10">
          
          {/* Tarjeta Principal de Producto */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-gray-100">
            
            {/* COLUMNA IZQUIERDA: Galería de Imágenes (hasta 7 fotos) */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 shadow-sm group">
                <img
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                
                {/* Insignia o Categoría Flotante */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-[#1A1C1C] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                    {product.category}
                  </span>
                  {product.badge && (
                    <span className="bg-[#FF97A4] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      {product.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Tira de Miniaturas Seleccionables */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        activeImage === img ? "border-[#FF97A4] ring-2 ring-[#FF97A4]/30 scale-105" : "border-gray-200 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* COLUMNA DERECHA: Información y Especificaciones Estructuradas */}
            <div className="flex flex-col space-y-6">
              
              {/* Titular y Precio */}
              <div>
                <span className="text-[#FF97A4] text-xs font-black uppercase tracking-[0.2em] block mb-1">
                  Arreglo Floral Exclusivo
                </span>
                <h1 className="text-3xl md:text-4xl font-serif font-black text-[#1A1C1C] leading-tight mb-3">
                  {product.name}
                </h1>

                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-4xl font-extrabold text-[#FF97A4]">
                    ${product.price?.toFixed(2)} USD
                  </span>
                  <span className="text-xs text-green-600 font-bold bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                    Disponible para Envío Hoy 🚚
                  </span>
                </div>
              </div>

              {/* CAJA VISUAL DE ESPECIFICACIONES (Estilo CMS / DoorDash / Shopify) */}
              <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                  <Sparkles size={14} className="text-[#FF97A4]" /> Especificaciones del Diseño
                </h3>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  {product.flowerCount ? (
                    <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-2.5">
                      <div className="p-2 bg-[#FF97A4]/10 text-[#FF97A4] rounded-lg">
                        <Flower2 size={16} />
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Flores</span>
                        <span className="font-bold text-gray-800">{product.flowerCount} Rosas Frescas</span>
                      </div>
                    </div>
                  ) : null}

                  {product.bouquetType ? (
                    <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-2.5">
                      <div className="p-2 bg-[#FF97A4]/10 text-[#FF97A4] rounded-lg">
                        <Package size={16} />
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px] uppercase font-bold">Presentación</span>
                        <span className="font-bold text-gray-800 capitalize">{product.bouquetType}</span>
                      </div>
                    </div>
                  ) : null}

                  <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-2.5">
                    <div className="p-2 bg-[#FF97A4]/10 text-[#FF97A4] rounded-lg">
                      <Truck size={16} />
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Entrega</span>
                      <span className="font-bold text-gray-800">Mismo Día Disponible</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-2.5">
                    <div className="p-2 bg-[#FF97A4]/10 text-[#FF97A4] rounded-lg">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Garantía</span>
                      <span className="font-bold text-gray-800">Flores 100% Frescas</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* VIÑETAS / CARACTERÍSTICAS DINÁMICAS (Features) */}
              {product.features && product.features.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">¿Qué incluye este arreglo?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.features.map((feature: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-xs bg-white p-2.5 rounded-xl border border-gray-100">
                        <CheckCircle2 size={16} className="text-[#FF97A4] flex-shrink-0" />
                        <span className="font-medium text-gray-700">
                          <strong className="text-gray-900">{feature.label}:</strong> {feature.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECCIÓN DE ADICIONALES COMPATIBLES */}
              {product.addons && product.addons.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-2">
                    <Tag size={14} className="text-[#FF97A4]" /> Completa tu Regalo (Opcional)
                  </h3>
                  <AddonSelection addons={product.addons} onSelectionChange={setSelectedAddons} />
                </div>
              )}

              {/* DESCRIPCIÓN SECTORIZADA EN VIÑETAS LIMPIAS */}
              <div className="space-y-3 pt-2 border-t border-gray-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">Detalles y Descripción</h3>
                <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-2 text-sm text-gray-600 font-light leading-relaxed">
                  {descriptionBullets.map((paragraph: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF97A4] mt-2 flex-shrink-0" />
                      <p>{paragraph}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* BOTÓN AGREGAR AL CARRITO */}
              <div className="pt-4 mt-auto">
                <AddToCartButton product={{ ...product, selectedAddons }} />
              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
};
