import Link from "next/link";
import React from "react";

const products = [
  {
    id: "1",
    name: "Vitamin Boost",
    sku: "SP009105K",
    price: "$8",
    sold: 2300,
    icon: "🍊",
  },
  {
    id: "2",
    name: "Organic Protein Bar",
    sku: "SP009105K",
    price: "$3",
    sold: 1200,
    icon: "🍫",
  },
  {
    id: "3",
    name: "Pain Relief Cream",
    sku: "SP009105K",
    price: "$5",
    sold: 1100,
    icon: "🧴",
  },
];

export const TopProductSales: React.FC = () => (
  <div className="w-full bg-white dark:bg-[#161618] rounded-2xl p-6 shadow">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
        Top Product Sales
      </h3>
      <Link href="/dashboard/products" className="text-xs text-blue-600 dark:text-blue-400">
        View All
      </Link>
    </div>
    <ul className="space-y-4">
      {products.map((product) => (
        <li key={product.id} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{product.icon}</span>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {product.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                SKU: {product.sku}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {product.price}/item
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {product.sold.toLocaleString()} sold
            </span>
          </div>
        </li>
      ))}
    </ul>
  </div>
);
