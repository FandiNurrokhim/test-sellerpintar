import React from "react";

interface WidgetHeaderProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  variant?: "default" | "primary";
}

const WidgetHeader: React.FC<WidgetHeaderProps> = ({
  title,
  value,
  icon,
  variant = "default",
}) => (
  <div
    className={`px-8 py-4 rounded-2xl flex items-center gap-4 transition-transform duration-200 hover:scale-105
    ${
      variant === "primary"
        ? "bg-gradient-to-br from-[#2F49B3] to-[#001363]"
        : "bg-white dark:bg-[#161618]"
    }
    `}
  >
    {icon && (
      <div
        className={`
        rounded-full p-3 inline-flex items-center justify-center shadow-md
        ${
          variant === "primary"
            ? "bg-white"
            : "bg-gradient-to-br from-[#2F49B3] to-[#001363]"
        }`}
      >
        {icon && <span>{icon}</span>}
      </div>
    )}
    <div>
      <p className={`text-xs font-light mb-0 mt-1 text-[#A3AED0]`}>{title}</p>
      <p
        className={`text-lg font-semibold m-0
        ${variant === "primary" ? "text-white" : "text-blue-600 hover:text-blue-800 transition dark:text-[#2F49B3]"}`}
      >
        {value}
      </p>
    </div>
  </div>
);

export default WidgetHeader;
