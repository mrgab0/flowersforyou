"use client";

import { useState, useEffect } from 'react';

const slides = [
  {
    image: "/images/slider/111.jpg",
    title: "Nueva Colección de Lujo",
    description: "Descubre los arreglos más exclusivos de la temporada."
  },
  {
    image: "/images/slider/112.webp",
    title: "20% Off en Rosas",
    description: "Aprovecha nuestra promoción especial de primavera."
  }
];

export const HeroSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-12 relative h-[500px] w-full rounded-2xl shadow-xl border-4 border-white overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img 
            src={slide.image} 
            alt={slide.title} 
            className="h-full w-full object-cover"
          />
          {/* Estilo Banner Comercial - Fondo degradado semitransparente */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col items-start justify-center p-12 text-left">
            <h3 className="text-4xl md:text-5xl font-serif font-extrabold text-white mb-3 tracking-tight">{slide.title}</h3>
            <p className="text-xl text-white/90 mb-6 max-w-lg">{slide.description}</p>
            <button className="bg-[#D81B60] text-white px-8 py-3 rounded-full font-bold hover:bg-[#B0004A] transition-colors shadow-lg">
              Ver Oferta
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
