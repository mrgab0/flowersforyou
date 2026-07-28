"use client";

import { useState, useEffect } from 'react';
import { getSliders } from "@/lib/actions/slider";

export const HeroSlider = () => {
  const [slides, setSlides] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchSliders() {
      const { data } = await getSliders();
      if (data) {
        // Ordenar por campo order si existe
        const sorted = [...data].sort((a, b) => (a.order || 0) - (b.order || 0));
        setSlides(sorted);
      }
    }
    fetchSliders();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides]);

  if (slides.length === 0) return null;

  return (
    <div className="mt-8 md:mt-12 relative h-[350px] sm:h-[420px] md:h-[500px] w-full rounded-2xl shadow-xl border-2 sm:border-4 border-white overflow-hidden bg-gray-100">
      {slides.map((slide, index) => {
        const isCurrent = index === currentIndex;
        const isVideo = slide.image?.match(/\.(mp4|webm|ogg)$/i);

        return (
          <div
            key={slide._id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {slide.type === 'banner' ? (
              <div className="relative w-full h-full">
                {/* Banner de Video o Imagen Responsiva */}
                {isVideo ? (
                  <video 
                    src={slide.image} 
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <a href={slide.link || '#'} className={slide.link ? "cursor-pointer" : "cursor-default"}>
                    <picture className="w-full h-full block">
                      {slide.mobileImage && (
                        <source media="(max-width: 768px)" srcSet={slide.mobileImage} />
                      )}
                      <img 
                        src={slide.image} 
                        alt={slide.title || 'Banner'} 
                        className="h-full w-full object-cover"
                      />
                    </picture>
                  </a>
                )}

                {/* Superposición de Texto y Botón CTA (Solo si showOverlay es true/undefined) */}
                {slide.showOverlay !== false && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent flex flex-col items-start justify-center p-6 md:p-12 text-left pointer-events-none">
                    <div className="pointer-events-auto max-w-xl">
                      {slide.title && (
                        <h3 className="text-2xl sm:text-4xl md:text-5xl font-serif font-extrabold text-white mb-2 md:mb-3 tracking-tight">
                          {slide.title}
                        </h3>
                      )}
                      {slide.description && (
                        <p className="text-sm sm:text-base md:text-xl text-white/90 mb-4 md:mb-6 line-clamp-3">
                          {slide.description}
                        </p>
                      )}
                      {slide.link && (
                        <a 
                          href={slide.link} 
                          className="inline-block bg-[#FF97A4] text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full font-bold text-xs sm:text-sm md:text-base hover:bg-[#B0004A] transition-all shadow-lg hover:scale-105 active:scale-95"
                        >
                          {slide.ctaText || "Ver Oferta"}
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 bg-white">
                <h3 className="text-3xl font-bold mb-4">{slide.title}</h3>
                <div className="text-6xl font-black text-green-600 mb-4">{slide.discountPercentage}% OFF</div>
                <p className="text-gray-500">Expira: {new Date(slide.discountExpiry).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        );
      })}

      {/* Indicadores de Diapositiva (Dots) */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? "w-8 bg-[#FF97A4]" : "w-2.5 bg-white/60 hover:bg-white"
              }`}
              title={`Ir al banner ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};


