import React from "react";
import { cn } from "@/lib/utils";

interface TabItemProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const TabItem: React.FC<TabItemProps> = ({
  label,
  isActive,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 font-medium text-sm border-b-2 transition-all cursor-pointer duration-300",
        isActive
          ? "text-[#2F49B3] border-[#2F49B3] hover:text-[#2F49B3] dark:text-blue-400 dark:border-blue-400 dark:hover:text-blue-400"
          : "text-[#6B7280] border-transparent hover:text-[#2F49B3] hover:border-[#2F49B3] dark:text-gray-400 dark:hover:text-blue-400 dark:hover:border-blue-400"
      )}
    >
      {label}
    </button>
  );
};
