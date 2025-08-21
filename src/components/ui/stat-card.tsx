import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon?: ReactNode;
  title: string;
  value: string | number;
  footer?: ReactNode;
  variant?: "outline" | "fill";
  className?: string;
}

export function StatCard({
  icon,
  title,
  value,
  variant = "outline",
  className = "",
}: StatCardProps) {
  const isDark = variant === "fill";

  return (
    <div
      className={cn(
        "rounded-2xl px-6 py-5 flex flex-col justify-between transition-colors",
        isDark
          ? "bg-gradient-to-r from-[#2A388F] to-[#1B2653] text-white"
          : "bg-white dark:bg-[#161618] text-[#1B2653]",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p
            className={cn(
              "text-sm font-medium",
              isDark ? "text-white/70" : "text-[#A3AED0]"
            )}
          >
            {title}
          </p>
          <h2 className="text-2xl font-semibold tabular-nums dark:text-white">
            {value}
          </h2>
        </div>

        {icon && (
          <div
            className={cn(
              "p-2 rounded-full flex items-center justify-center",
              isDark ? "bg-white/10" : "bg-[#F4F7FE]"
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
