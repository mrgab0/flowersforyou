"use client";

import { X } from "lucide-react";

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InquiryModal = ({ isOpen, onClose }: InquiryModalProps) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay opcional solo en móviles para enfocar el chat */}
      <div className="fixed inset-0 z-[90] bg-black/20 sm:hidden" onClick={onClose} />
      
      <div className="fixed bottom-24 right-4 sm:right-8 z-[100] w-[calc(100vw-2rem)] sm:w-[380px] h-[60vh] sm:h-[550px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">
        <div className="flex justify-between items-center p-3 border-b bg-white">
          <span className="font-bold text-sm text-gray-700">Consulta Floral</span>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full text-gray-500"
          >
            <X size={18} />
          </button>
        </div>
        <iframe 
          src="https://flowers-for-you-chatbot-de-ventas.ai.studio/"
          className="w-full flex-1 border-none"
          title="Consulta Floral Chatbot"
        />
      </div>
    </>
  );
};
