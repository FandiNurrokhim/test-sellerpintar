import React from "react";
import { Input } from "@/components/atoms/Forms/Input";
import { Select } from "@/components/atoms/Forms/Select";

export default function Hero({
  onCategoryChange,
  onSearch,
  category,
  search,
  loading,
}: {
  onCategoryChange: (value: string) => void;
  onSearch: (value: string) => void;
  category: string;
  search: string;
  loading?: boolean;
}) {
  return (
    <section
      className="relative w-full h-[560px] md:h-[500px] flex items-center justify-center bg-blue-600 overflow-hidden mb-8"
      style={{
        backgroundImage:
          "url('/images/background/article-hero-background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-[#2563EBDB]" />
      <div className="max-w-3xl mx-auto relative text-center w-full !font-archivo px-6">
        <p className="text-white/90 font-bold text-center text-lg md:text-lg mb-6 mt-4 sm:mt-0">
          Blog Geznet
        </p>
        <h1 className="text-white font-medium text-4xl md:text-5xl mb-2">
          The Journal : Design Resources, Interviews, and Industry News
        </h1>
        <p className="text-white/90 font-normal text-xl md:text-2xl mb-6">
          Your daily dose of design insights!
        </p>
        <div className="max-w-xl mx-auto">
          <form className="grid grid-cols-1 md:grid-cols-3 gap-2 justify-center items-center bg-blue-500 rounded-lg p-2">
            <Select
              className="rounded-lg border-none col-span-1 h-[40px] py-0"
              options={[
                { value: "", label: "Select category" },
                { value: "Technology", label: "Technology" },
                { value: "Design", label: "Design" },
              ]}
              value={category}
              onChange={(e) => onCategoryChange(e.target.value)}
            />
            <Input
              type="search"
              placeholder="Search articles..."
              className="col-span-2 h-[40px] rounded-lg border-none text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 w-full"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
            />
          </form>
        </div>
      </div>
    </section>
  );
}
