"use client";

import { useCart } from "@/components/shop/Cart/CartContext";

export const AddToCartButton = ({ product }: { product: any }) => {
  const { addToCart } = useCart();

  return (
    <button 
      onClick={() => addToCart({ 
        id: product._id.toString(), 
        name: product.name, 
        price: product.price, 
        image: product.images[0] 
      })}
      className="bg-[#D81B60] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#B0004A] transition-all shadow-lg shadow-[#D81B60]/20"
    >
      Añadir al Carrito
    </button>
  );
};
