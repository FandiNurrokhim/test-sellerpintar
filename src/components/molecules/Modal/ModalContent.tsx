import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ModalContentProps {
  children: ReactNode;
  isVisible: boolean;
}

export default function ModalContent({
  children,
  isVisible,
}: ModalContentProps) {
  return (
    <div
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-lg transition-all duration-300 dark:bg-[#161618]",
        isVisible
          ? "scale-100 opacity-100"
          : "scale-95 opacity-0 pointer-events-none"
      )}
    >
      {children}
    </div>
  );
}
