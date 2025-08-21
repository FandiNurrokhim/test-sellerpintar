"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type RadioProps = React.InputHTMLAttributes<HTMLInputElement>;

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, ...props }, ref) => {
    return (
      <label className="inline-flex items-center space-x-2 cursor-pointer">
        <input
          type="radio"
          ref={ref}
          className={cn("peer sr-only", className)}
          {...props}
        />
        <div
          className={cn(
            "size-4 rounded-full border border-gray-300 dark:border-gray-600",
            "flex items-center justify-center",
            "bg-transparent dark:bg-gray-800",
            "peer-checked:border-[6px] peer-checked:border-primary peer-checked:bg-primary/20 dark:peer-checked:border-primary dark:peer-checked:bg-primary/30",
            "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        />
      </label>
    );
  }
);

Radio.displayName = "Radio";

export { Radio };
