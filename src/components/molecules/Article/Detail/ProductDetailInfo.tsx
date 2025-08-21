import React from "react";
import { Star } from "lucide-react";

interface ProductDetailInfoProps {
  name: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  sizes: string[];
  selectedSize: string;
  onSelectSize: (size: string) => void;
  colors: { label: string; value: string }[];
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export const ProductDetailInfo: React.FC<ProductDetailInfoProps> = ({
  name,
  description,
  price,
  rating,
  reviews,
  sizes,
  selectedSize,
  onSelectSize,
  colors,
  selectedColor,
  onSelectColor,
}) => (
  <div className="bg-white dark:bg-[#161618] rounded-xl p-4">
    <h1 className="text-3xl font-extrabold mb-3 text-gray-900 dark:text-white">{name}</h1>
    <p className="text-gray-600 dark:text-gray-300 mb-4 max-w-lg">{description}</p>
    <div className="flex items-center space-x-2 mb-5 text-yellow-400">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${
            i < Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-300 text-gray-300 dark:fill-gray-700 dark:text-gray-700"
          }`}
          fill={i < Math.floor(rating) ? "#facc15" : "#d1d5db"}
          stroke="none"
        />
      ))}
      <span className="text-gray-500 dark:text-gray-400">({reviews} reviews)</span>
    </div>
    <p className="text-orange-600 dark:text-orange-400 text-2xl font-semibold mb-6">${price}</p>
    <div className="mb-6">
      <label className="block font-semibold mb-1 text-gray-800 dark:text-white">Select Size</label>
      <div className="flex flex-wrap items-center gap-3">
        {sizes.map((size) => (
          <button
            key={size}
            className={`border rounded-md py-1.5 px-4 transition ${
              selectedSize === size
                ? "bg-orange-500 text-white font-semibold"
                : "border-gray-300 dark:border-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
            type="button"
            onClick={() => onSelectSize(size)}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
    <div className="mb-10">
      <p className="font-semibold mb-2 text-gray-800 dark:text-white">Colours Available</p>
      <div className="flex items-center space-x-4">
        {colors.map((color) => (
          <button
            key={color.value}
            aria-label={`Color ${color.label}`}
            style={{ backgroundColor: color.value }}
            className={`w-7 h-7 rounded-full border transition ${
              selectedColor === color.value
                ? "border-2 border-orange-500 shadow-lg"
                : "border-gray-300 dark:border-gray-600 hover:ring-2 hover:ring-offset-1 hover:ring-orange-500"
            }`}
            type="button"
            onClick={() => onSelectColor(color.value)}
          ></button>
        ))}
      </div>
    </div>
  </div>
);