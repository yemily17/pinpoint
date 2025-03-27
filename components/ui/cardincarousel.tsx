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
  onClick?: () => void;
  selected?: boolean;
}

const CardInCarousel: React.FC<CardInCarouselProps> = ({ pin, onClick, selected }) => {
  return (
    <div 
      className={`min-w-[200px] p-4 rounded-lg border cursor-pointer transition-all
        ${selected 
          ? "bg-gray-500 text-white shadow-xl border-gray-700" 
          : "bg-white text-black shadow-md border-gray-200 hover:shadow-lg"
        }`}
      onClick={onClick}
    >
      <h4 className="text-lg font-bold mb-1">{pin.name}</h4>
      <p className="text-sm">{pin.distance.toFixed(2)} km away</p>
      {pin.description && (
        <p className="mt-2 text-xs opacity-80">{pin.description}</p>
      )}
    </div>
  );
};

export default CardInCarousel;
