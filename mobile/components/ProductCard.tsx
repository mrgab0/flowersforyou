import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface ProductCardProps {
  name: string;
  price: number;
  image: string;
  onPress: () => void;
}

/**
 * ProductCard Mobile: Magenta Flora Modern Style
 * Implementado con NativeWind usando el nuevo sistema de diseño.
 */
export const ProductCard = ({ name, price, image, onPress }: ProductCardProps) => {
  return (
    <StyledTouchableOpacity 
      onPress={onPress}
      activeOpacity={0.8}
      className="bg-white rounded-2xl shadow-sm m-2 overflow-hidden border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 20,
        elevation: 2
      }}
    >
      <Image 
        source={{ uri: image }} 
        resizeMode="contain"
        className="w-full h-56 bg-gray-50"
      />
      
      <StyledView className="p-5">
        <StyledText className="text-[#FF97A4] text-[10px] font-bold uppercase tracking-[2px] mb-1">
          Premium Selection
        </StyledText>
        
        <StyledText className="text-xl font-bold text-[#1A1C1C] mb-3">
          {name}
        </StyledText>
        
        <StyledView className="flex-row justify-between items-center pt-3 border-t border-gray-50">
          <StyledView>
            <StyledText className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">Desde</StyledText>
            <StyledText className="text-2xl font-black text-[#FF97A4]">
              ${price.toFixed(2)}
            </StyledText>
          </StyledView>
          
          <StyledView className="bg-[#FF97A4] px-6 py-3 rounded-xl shadow-lg shadow-[#FF97A4]/30">
            <StyledText className="text-white text-xs font-black uppercase tracking-widest">
              Añadir
            </StyledText>
          </StyledView>
        </StyledView>
      </StyledView>
    </StyledTouchableOpacity>
  );
};

