import React from "react";
import { cn } from "@/lib/utils";

interface OverlayProps {
  isVisible: boolean;
  onClick?: () => void;
}

export default function Overlay({ isVisible, onClick }: OverlayProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-300 z-50",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      onClick={onClick}
    />
  );
}
