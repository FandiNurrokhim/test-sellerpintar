import React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  selectedIndex: number;
  onSelect: (idx: number) => void;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  selectedIndex,
  onSelect,
}) => (
  <div>
    <div className="rounded-xl overflow-hidden shadow-lg relative flex items-center justify-center">
      <Image
        src={images[selectedIndex]}
        alt="Product"
        width={400}
        height={400}
        className="w-full object-cover rounded-xl"
        unoptimized
      />
    </div>
    <nav className="flex items-center justify-center space-x-4 mt-5 overflow-x-scroll scrollbar-hide">
      <button
        className="hidden md:block group bg-white dark:bg-gray-600 rounded-full p-2 border-2 border-black  dark:border-gray-600 hover:bg-black dark:hover:bg-gray-700 transition disabled:opacity-50 cursor-pointer"
        onClick={() => onSelect(selectedIndex > 0 ? selectedIndex - 1 : 0)}
        disabled={selectedIndex === 0}
        aria-label="Previous image"
        type="button"
      >
        <ChevronLeft className="w-6 h-6 text-black dark:text-gray-300 group-hover:text-white transition" />
      </button>
      {images.map((img, idx) => (
        <div
          key={img + idx}
          className={`w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer ${
            idx === selectedIndex
              ? "border-orange-500"
              : "border-transparent hover:border-gray-300"
          }`}
          onClick={() => onSelect(idx)}
        >
          <Image
            src={img}
            alt={`Thumbnail ${idx + 1}`}
            width={80}
            height={80}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      ))}
      <button
        className="hidden md:block group bg-white dark:bg-gray-600 rounded-full p-2 border-2 border-black dark:border-gray-600 hover:bg-black dark:hover:bg-gray-700 transition disabled:opacity-50 cursor-pointer"
        onClick={() =>
          onSelect(
            selectedIndex < images.length - 1
              ? selectedIndex + 1
              : selectedIndex
          )
        }
        disabled={selectedIndex === images.length - 1}
        aria-label="Next image"
        type="button"
      >
        <ChevronRight className="w-6 h-6 text-black dark:text-gray-300 group-hover:text-white transition" />
      </button>
    </nav>
  </div>
);
