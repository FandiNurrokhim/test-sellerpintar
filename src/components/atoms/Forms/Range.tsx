"use client";

import * as React from "react";
import { Label } from "@/components/atoms/Forms/Label";
import { cn } from "@/lib/utils";

export interface RangeProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
  label?: string;
  className?: string;
  isDecimal?: boolean;
}

export function Range({
  value,
  min = 0,
  max = 100,
  onChange,
  label,
  className,
  isDecimal = false,
}: RangeProps) {
  const step = isDecimal ? 0.1 : 1;
  const displayValue = isDecimal ? value.toFixed(1) : value;

  return (
    <div className={cn("mb-4", className)}>
      {label && (
        <Label>
          {label} <span>({displayValue})</span>
        </Label>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full custom-range"
        style={
          {
            "--progress": `${((value - min) / (max - min)) * 100}%`,
          } as React.CSSProperties
        }
      />
    </div>
  );
}
