import React, { useState } from "react";
import { ProductImageGallery } from "@/components/molecules/Product/Detail/ProductImageGalery";
import { ProductDetailInfo } from "@/components/molecules/Product/Detail/ProductDetailInfo";
import { ProductCard } from "@/components/molecules/Product/Card";

// Komponen deskripsi lengkap
const ProductFullDescription: React.FC<{ description: string }> = ({
  description,
}) => (
  <section className="mt-12 mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-xl">
    <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">
      Product Description
    </h3>
    <p className="text-gray-700 dark:text-gray-200 text-base">{description}</p>
  </section>
);

const dummyProduct = {
  id: "1",
  name: "Teal Twill Polka Dot Unlined Silk Dressing Gown",
  description:
    "Browse through our carefully curated collection of high-quality clothing & accessories featuring the latest trends and style. This dressing gown is made from premium silk with a unique polka dot pattern, perfect for both comfort and style. Available in multiple sizes and colors to suit your preference. Enjoy luxury and elegance in every detail.",
  price: 147,
  rating: 4,
  reviews: 4.5,
  image: [
    "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/1f8291cc-de62-4ed3-85f2-1d5fef77f5c8.png",
    "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/1f8291cc-de62-4ed3-85f2-1d5fef77f5c8.png",
    "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/1a36dfc0-5d77-4186-98ef-06bcf7678275.png",
    "https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/3c4fa11b-fd12-40f0-82f5-8f0ddecfb025.png",
  ],
  stock: 10,
  status: "active",
  sizes: ["XS", "S", "M", "L", "XL"],
  colors: [
    { label: "Coral", value: "#f08a7d" },
    { label: "Teal", value: "#8dd7d6" },
    { label: "Blue", value: "#1d9ade" },
    { label: "Light Green", value: "#dde88a" },
  ],
  category: {
    id: "cat-001",
    name: "Fashion",
    status: "active",
  },
};

// Dummy list produk lain
const otherProducts = Array.from({ length: 4 }, (_, idx) => ({
  id: `ipad-gen10-${idx}`,
  name: "Apple Ipad (Gen 10)",
  category: { name: "Smartphone" },
  price: 499,
  image: [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHZqj-XReJ2R76nji51cZl4ETk6-eHRmZBRw&s",
  ],
  stock: Math.random() > 0.5 ? 10 : 0,
}));

export const ProductDetail: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("L");
  const [selectedColor, setSelectedColor] = useState(
    dummyProduct.colors[1].value
  );

  return (
    <>
      <section className="flex flex-col md:flex-row md:gap-16 bg-white dark:bg-[#161618]">
        {/* Left: Image Gallery */}
        <div className="md:flex-1">
          <ProductImageGallery
            images={dummyProduct.image}
            selectedIndex={selectedImage}
            onSelect={setSelectedImage}
          />
        </div>
        {/* Right: Product Info */}
        <div className="md:flex-1 mt-10 md:mt-0 flex flex-col justify-between">
          <div>
            <ProductDetailInfo
              name={dummyProduct.name}
              description={dummyProduct.description}
              price={dummyProduct.price}
              rating={dummyProduct.rating}
              reviews={dummyProduct.reviews}
              sizes={dummyProduct.sizes}
              selectedSize={selectedSize}
              onSelectSize={setSelectedSize}
              colors={dummyProduct.colors}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
            />
          </div>
          <button
            className="bg-black text-white w-full md:w-auto py-4 px-10 rounded-full font-semibold hover:bg-gray-900 transition cursor-pointer"
            type="button"
          >
            Buy This Product
          </button>
        </div>
      </section>
      {/* Deskripsi lengkap */}
      <ProductFullDescription description={dummyProduct.description} />
      {/* List produk lain */}
      <section className="mb-8">
        <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">
          Other Products
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {otherProducts.map((product) => (
            <ProductCard
              key={product.id}
              name={product.name}
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
      </section>
    </>
  );
};
