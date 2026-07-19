"use client";

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { InquiryModal } from '../InquiryModal';

interface InquiryButtonProps {
  phoneNumber: string; // Mantener por si acaso, aunque no se use
}

/**
 * InquiryButton: Magenta Flora Modern Style
 * Reemplaza la funcionalidad de WhatsApp por el nuevo Chatbot de consultas.
 */
export const WhatsAppButton = ({ phoneNumber }: InquiryButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-4 bg-[#FF97A4] text-white pl-5 pr-7 py-4 rounded-full shadow-[0px_10px_30px_rgba(216,27,96,0.3)] hover:scale-105 transition-all duration-300 active:scale-95 group"
        aria-label="Abrir consulta floral"
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

      <InquiryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

