"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "@/components/shop/ProductCard/ProductCard";
import { ShopHeader } from "@/components/shop/ShopHeader";
import { WhatsAppButton } from "@/components/shop/WhatsAppButton/WhatsAppButton";
import { Search, SlidersHorizontal, ArrowUpDown, Sparkles, Flower2, RefreshCw } from "lucide-react";

interface CatalogClientProps {
  initialProducts: any[];
}

export function CatalogClient({ initialProducts }: CatalogClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");

  // Extraer categorías únicas dinámicamente
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [initialProducts]);

  // Filtrado y Ordenamiento en tiempo real
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((product) => {
        // Filtro por término de búsqueda (Nombre, Categoría o Tipo de Flor)
        const matchSearch =
          searchTerm === "" ||
          product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.flowerType?.toLowerCase().includes(searchTerm.toLowerCase());

        // Filtro por Categoría
        const matchCategory =
          selectedCategory === "all" ||
          product.category?.toLowerCase() === selectedCategory.toLowerCase();

        return matchSearch && matchCategory;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        return 0; // featured (orden por defecto)
      });
  }, [initialProducts, searchTerm, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      <ShopHeader />

      <main className="flex-1 py-10 md:py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl space-y-10">
          
          {/* Cabecera del Catálogo */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-[#FF97A4] text-xs font-extrabold uppercase tracking-[0.25em] bg-pink-50 px-4 py-1.5 rounded-full border border-pink-100 inline-block">
              🌸 Catálogo de Arreglos Exclusivos
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-black text-[#1A1C1C] tracking-tight">
              Explora Nuestra Colección
            </h1>
            <p className="text-gray-500 text-sm md:text-base font-medium leading-relaxed">
              Encuentra el arreglo perfecto para cada ocasión especial: ramos de rosas frescas, cajas elegantes y composiciones boutique.
            </p>
          </div>

          {/* BARRA DE BÚSQUEDA Y FILTROS */}
          <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              
              {/* Campo de Búsqueda con Icono */}
              <div className="relative w-full md:w-96">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar arreglos, rosas, ramos o tulipanes..."
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF97A4] transition-all bg-gray-50/50"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-200 rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Selector de Ordenamiento */}
              <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                  <ArrowUpDown size={14} className="text-[#FF97A4]" /> Ordenar por:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="p-3 border border-gray-200 rounded-2xl bg-white text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF97A4]"
                >
                  <option value="featured">Destacados 🌟</option>
                  <option value="price-asc">Precio: Menor a Mayor ($)</option>
                  <option value="price-desc">Precio: Mayor a Menor ($)</option>
                </select>
              </div>
            </div>

            {/* Pastillas de Categorías (Pills) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2 border-t border-gray-100 scrollbar-none">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === "all"
                    ? "bg-[#FF97A4] text-white shadow-md shadow-[#FF97A4]/20"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Todas las Colecciones ({initialProducts.length})
              </button>

              {categories.map((cat) => {
                const count = initialProducts.filter((p) => p.category === cat).length;
                const isSelected = selectedCategory === cat;

                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                      isSelected
                        ? "bg-[#FF97A4] text-white shadow-md shadow-[#FF97A4]/20"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* RESULTADOS DE PRODUCTOS */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Mostrando <strong className="text-[#1A1C1C]">{filteredProducts.length}</strong> arreglos florales
              </span>
              {(searchTerm || selectedCategory !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="text-xs font-bold text-[#FF97A4] hover:underline flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Limpiar Filtros
                </button>
              )}
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    id={product._id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    category={product.category}
                    badge={product.badge}
                    image={product.images[0] || "https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&q=80&w=800"}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center space-y-4 max-w-lg mx-auto shadow-sm">
                <Flower2 size={48} className="mx-auto text-pink-200" />
                <h3 className="text-xl font-bold text-[#1A1C1C]">No encontramos arreglos con esa búsqueda</h3>
                <p className="text-xs text-gray-400">
                  Prueba cambiando las palabras clave o seleccionando otra categoría en el menú superior.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="bg-[#FF97A4] text-white px-6 py-2.5 rounded-full font-bold text-xs hover:bg-[#B0004A] transition-colors"
                >
                  Ver Todo el Catálogo
                </button>
              </div>
            )}
          </div>

        </div>
      </main>

      <WhatsAppButton phoneNumber="16576988586" />
    </div>
  );
}
