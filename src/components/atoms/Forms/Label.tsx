"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/molecules/Tooltip/Tooltip";

interface LabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {
  tooltip?: string;
  required?: boolean;
}

function Label({
  className,
  tooltip,
  children,
  required,
  ...props
}: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-1 text-sm text-[#262626] leading-none font-light select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 dark:text-white/80",
        className
      )}
      {...props}
    >
      {children}

      {required && <span className="text-red-500">*</span>}

      {tooltip && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info
              className="w-3 h-3 text-gray-500 hover:text-gray-700 cursor-pointer"
              strokeWidth={1.5}
            />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs break-words text-sm leading-snug">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </LabelPrimitive.Root>
  );
}

export { Label };
