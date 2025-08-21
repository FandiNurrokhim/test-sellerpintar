"use client";

import React, { useState } from "react";
import { ProductCard } from "@/components/molecules/Product/Card";
import ProductPagination from "@/components/molecules/Product/ProductPagination";

const pageSize = 8;

const dummyProducts = Array.from({ length: 100 }, (_, idx) => ({
  id: `ipad-gen10-${idx}`,
  name: "Apple Ipad (Gen 10)",
  category: { name: "Smartphone" },
  price: 499,
  image: [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHZqj-XReJ2R76nji51cZl4ETk6-eHRmZBRw&s",
  ],
  stock: Math.random() > 0.5 ? 10 : 0,
}));

export default function ProductList() {
  const [pageIndex, setPageIndex] = useState(0);

  const paginatedProducts = dummyProducts.slice(
    pageIndex * pageSize,
    pageIndex * pageSize + pageSize
  );
  const pageCount = Math.ceil(dummyProducts.length / pageSize);

  return (
    <div className="max-w-7xl mx-auto bg-white dark:bg-[#161618] rounded-2xl p-4 md:p-8">
      <h2 className="!font-sentient font-bold dark:text-white/80 text-2xl mb-1">Product List</h2>
      <p className="text-gray-500 dark:text-white/80 mb-6 text-[15px]">
        Enables a restriction that forces the a
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            name={product.name + " " + product.id}
            category={product.category?.name}
            price={`$${product.price}`}
            image={product.image[0]}
            status={product.stock === 0 ? "Sold Out" : "Available"}
            item={product}
            onView={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        ))}
      </div>
      <ProductPagination
        pageIndex={pageIndex}
        pageCount={pageCount}
        onPageChange={setPageIndex}
      />
    </div>
  );
}
