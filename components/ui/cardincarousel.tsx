import React from "react";

interface CardInCarouselProps {
  pin: {
    id: number;
    name: string;
    distance: number;
    description?: string;
    latitude: number;
    longitude: number;
  };
  onClick?: (pin: CardInCarouselProps['pin']) => void;
}

const CardInCarousel: React.FC<CardInCarouselProps> = ({ pin, onClick }) => {
  return (
    <div 
      className="min-w-[200px] bg-white p-4 rounded-lg shadow-md border border-gray-200 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onClick?.(pin)}
    >
      <h4 className="text-lg font-bold mb-1">{pin.name}</h4>
      <p className="text-sm text-gray-600">{pin.distance.toFixed(2)} km away</p>
      {pin.description && (
        <p className="mt-2 text-xs text-gray-500">{pin.description}</p>
      )}
    </div>
  );
};

export default CardInCarousel;
