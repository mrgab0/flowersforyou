"use client";

import { useState, useEffect } from 'react';
import { getSliders } from "@/lib/actions/slider";

export const HeroSlider = () => {
  const [slides, setSlides] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchSliders() {
      const { data } = await getSliders();
      if (data) setSlides(data);
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
    <div className="mt-12 relative h-[500px] w-full rounded-2xl shadow-xl border-4 border-white overflow-hidden bg-gray-100">
      {slides.map((slide, index) => (
        <div
          key={slide._id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {slide.type === 'banner' ? (
            <>
              <img 
                src={slide.image} 
                alt={slide.title} 
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col items-start justify-center p-12 text-left">
                <h3 className="text-4xl md:text-5xl font-serif font-extrabold text-white mb-3 tracking-tight">{slide.title}</h3>
                <p className="text-xl text-white/90 mb-6 max-w-lg">{slide.description}</p>
                <a href={slide.link} className="bg-[#FF97A4] text-white px-8 py-3 rounded-full font-bold hover:bg-[#B0004A] transition-colors shadow-lg">
                  Ver Oferta
                </a>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 bg-white">
              <h3 className="text-3xl font-bold mb-4">{slide.title}</h3>
              <div className="text-6xl font-black text-green-600 mb-4">{slide.discountPercentage}% OFF</div>
              <p className="text-gray-500">Expira: {new Date(slide.discountExpiry).toLocaleDateString()}</p>
              {/* Aquí se añadirían las mini-cards de productos en la siguiente fase */}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

