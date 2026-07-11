"use client";

import React, { useState, useEffect } from 'react';
import { ShoppingCart, X, Plus, Minus } from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export const ShoppingCartComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('flower_cart');
    if (savedCart) setCartItems(JSON.parse(savedCart));
  }, []);

  const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <>
      {/* Botón activador - Magenta Style */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-28 right-6 z-50 p-4 bg-[#D81B60] text-white rounded-full shadow-[0px_8px_25px_rgba(216,27,96,0.3)] hover:scale-105 transition-all duration-300 active:scale-95"
      >
        <ShoppingCart size={24} />
        {cartItems.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#1A1C1C] text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
            {cartItems.length}
          </span>
        )}
      </button>

      {/* Side Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <div className="absolute inset-0 bg-[#1A1C1C]/40 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-md bg-[#F9F9F9] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 flex justify-between items-center border-b border-gray-200 bg-white">
              <h2 className="text-2xl font-extrabold text-[#1A1C1C] tracking-tight">Tu Carrito</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                  <ShoppingCart size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">El carrito está vacío</p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-white rounded-xl shadow-[0px_4px_15px_rgba(0,0,0,0.03)] border border-gray-100 items-center">
                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h3 className="font-bold text-[#1A1C1C] text-sm leading-tight">{item.name}</h3>
                      <p className="text-[#D81B60] font-extrabold mt-1">${item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                      <button className="p-1 hover:bg-white rounded transition-colors text-gray-500"><Minus size={14}/></button>
                      <span className="text-xs font-bold text-[#1A1C1C] w-4 text-center">{item.quantity}</span>
                      <button className="p-1 hover:bg-white rounded transition-colors text-gray-500"><Plus size={14}/></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-8 border-t border-gray-200 bg-white">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Total Estimado</span>
                <span className="text-3xl font-extrabold text-[#1A1C1C]">${total.toFixed(2)}</span>
              </div>
              <button 
                disabled={cartItems.length === 0}
                className="w-full bg-[#D81B60] text-white py-5 rounded-xl font-bold hover:bg-[#B0004A] disabled:bg-gray-200 disabled:text-gray-400 transition-all duration-300 shadow-lg shadow-[#D81B60]/20 flex justify-center items-center gap-2 group"
              >
                Tramitar Pedido
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
