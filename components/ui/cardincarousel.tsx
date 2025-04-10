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
  isSelected?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const CardInCarousel: React.FC<CardInCarouselProps> = ({ 
  pin, 
  onClick, 
  isSelected,
  onMouseEnter,
  onMouseLeave 
}) => {
  return (
    <div 
      className={`min-w-[200px] p-4 rounded-lg shadow-md border-2 transition-colors cursor-pointer
        ${isSelected 
          ? 'bg-gray-50 border-gray-800 shadow-lg' 
          : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg'
        }`}
      onClick={() => onClick?.(pin)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className={`text-lg font-bold ${isSelected ? 'text-gray-800' : 'text-gray-700'}`}>
          {pin.name}
        </h4>
        {isSelected && (
          <div className="w-1.5 h-1.5 rounded-full bg-gray-800"></div>
        )}
      </div>
      <p className="text-sm text-gray-600">{pin.distance.toFixed(2)} km away</p>
      {pin.description && (
        <p className="mt-2 text-xs text-gray-500">{pin.description}</p>
      )}
    </div>
  );
};

export default CardInCarousel;
