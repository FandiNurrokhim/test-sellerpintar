"use client";

import { CheckCircle2 } from "lucide-react";
import React from "react";
import clsx from "clsx";
import Image from "next/image";

type CardPlanProps = {
  title: string;
  price: string;
  duration: string;
  description: string;
  details: string[];
  isFeatured?: boolean;
  isPreview?: boolean;
  checked: boolean;
  onChange: () => void;
};

export const CardPlan: React.FC<CardPlanProps> = ({
  title,
  price,
  duration,
  description,
  details,
  isFeatured = false,
  isPreview = false,
  checked,
  onChange,
}) => {
  return (
    <label
      className={clsx(
        "relative block cursor-pointer rounded-xl border py-8 px-10 transition-all",
        checked
          ? "border-blue-600 dark:border-blue-400"
          : "border-gray-300 dark:border-gray-700",
        isFeatured
          ? "bg-gradient-to-br from-[#2F49B3] to-[#001363] text-white"
          : "bg-white dark:bg-[#232336] dark:text-white text-[#151515]"
      )}
    >
      {isFeatured && (
        <Image
          src="/images/background/pricing-card-bg.png"
          alt="Featured Plan"
          width={1000}
          height={1000}
          className="absolute w-full h-full top-0 right-0"
        />
      )}

      {/* Radio Button */}
      {!isPreview && (
        <input
          type="radio"
          className="absolute right-4 top-4 h-5 w-5 accent-blue-600 dark:accent-blue-400"
          checked={checked}
          onChange={onChange}
        />
      )}

      {/* Title & Price */}
      <div className="mb-4">
        <div
          className={clsx(
            "text-sm font-normal text-[#A3AED0] !font-sentient",
            isFeatured ? "text-[#A3AED0] !font-sentient" : "dark:text-gray-400"
          )}
        >
          {title}
        </div>
        <div className="text-2xl font-medium !font-sentient dark:text-white">
          {price}
          <span
            className={clsx(
              "text-base font-normal ml-1 !font-sentient",
              isFeatured
                ? "text-[#A3AED0]"
                : "text-[#A3AED0] dark:text-gray-400"
            )}
          >
            /{duration}
          </span>
        </div>
      </div>

      {/* Description */}
      <p
        className={clsx(
          "text-sm font-normal mb-4",
          isFeatured ? "text-white/80" : "text-[#A3AED0]/70 dark:text-gray-400"
        )}
      >
        {description}
      </p>

      {/* Details List */}
      <ul className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
        {details.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <CheckCircle2
              size={16}
              className={clsx(
                "mt-0.5",
                isFeatured
                  ? "text-[#00B815]"
                  : "text-[#00B815] dark:text-[#00B815]"
              )}
            />
            <span
              className={clsx(isFeatured ? "text-white" : "dark:text-white")}
            >
              {item}
            </span>
          </li>
        ))}
      </ul>
    </label>
  );
};
