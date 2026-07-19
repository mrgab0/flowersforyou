"use client";

import { X } from "lucide-react";

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InquiryModal = ({ isOpen, onClose }: InquiryModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 z-10"
        >
          <X size={20} />
        </button>
        <iframe 
          src="https://flowers-for-you-chatbot-de-ventas.ai.studio/"
          className="w-full h-full border-none"
          title="Consulta Floral Chatbot"
        />
      </div>
    </div>
  );
};
