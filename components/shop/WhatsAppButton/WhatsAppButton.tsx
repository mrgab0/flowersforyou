"use client";

import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
  productName?: string;
}

/**
 * WhatsAppButton: Magenta Flora Modern Style
 * Adaptado a la estética de lujo editorial con el color de acción Magenta.
 */
export const WhatsAppButton = ({ 
  phoneNumber, 
  message = "Hola! Me interesa este arreglo floral: ",
  productName 
}: WhatsAppButtonProps) => {
  
  const handleClick = () => {
    const finalMessage = productName ? `${message} ${productName}` : "Hola! Me gustaría hacer una consulta.";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(finalMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-8 right-8 z-50 flex items-center gap-4 bg-[#FF97A4] text-white pl-5 pr-7 py-4 rounded-full shadow-[0px_10px_30px_rgba(216,27,96,0.3)] hover:scale-105 transition-all duration-300 active:scale-95 group"
      aria-label="Contactar por WhatsApp"
    >
      <div className="relative bg-white/20 p-2 rounded-full backdrop-blur-sm">
        <MessageCircle size={24} fill="white" className="text-transparent" />
        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
      </div>
      <div className="flex flex-col items-start leading-none">
        <span className="text-[9px] uppercase font-black tracking-widest opacity-70 mb-0.5">Atención VIP</span>
        <span className="text-base font-bold">Consulta Floral</span>
      </div>
    </button>
  );
};

