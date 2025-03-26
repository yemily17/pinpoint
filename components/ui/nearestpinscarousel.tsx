import React from "react";
import CardInCarousel from "./cardincarousel";
import { Cross2Icon } from "@radix-ui/react-icons";

interface NearestPinsCarouselProps {
  pins: Array<{
    id: number;
    name: string;
    distance: number;
    description?: string;
  }>;
  setClosestPinsCarouselOpen: (isOpen: boolean) => void;
}

const NearestPinsCarousel: React.FC<NearestPinsCarouselProps> = ({
  pins,
  setClosestPinsCarouselOpen,
}) => {
  return (
    <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold">Closest Pins</h3>
        <button
          onClick={() => setClosestPinsCarouselOpen(false)}
          className="p-1 rounded hover:bg-gray-200"
        >
          <Cross2Icon />
        </button>
      </div>
      <div className="flex space-x-4 overflow-x-auto">
        {pins.map((pin) => (
          <CardInCarousel key={pin.id} pin={pin} />
        ))}
      </div>
    </div>
  );
};

export default NearestPinsCarousel;
