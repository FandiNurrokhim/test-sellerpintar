import React from "react";
import { formatDateSeparator } from "@/utils/chatHelper";

export const DateSeparator: React.FC<{ date: Date }> = ({ date }) => (
  <div className="flex justify-center mb-4 mt-6">
    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-600 px-3 py-1 rounded-full">
      {formatDateSeparator(date)}
    </span>
  </div>
);