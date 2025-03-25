import React from "react";
import CardInCarousel from "./cardincarousel";

interface NearestPinsCarouselProps {
  pins: Array<{
    id: number;
    name: string;
    distance: number;
    description?: string;
  }>;
}

const NearestPinsCarousel: React.FC<NearestPinsCarouselProps> = ({ pins }) => {
  return (
    <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-2">Closest Pins</h3>
      <div className="flex space-x-4 overflow-x-auto">
        {pins.map((pin) => (
          <CardInCarousel key={pin.id} pin={pin} />
        ))}
      </div>
    </div>
  );
};

export default NearestPinsCarousel;
