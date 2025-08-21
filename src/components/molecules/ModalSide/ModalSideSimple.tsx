import React, { ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ModalSideContentProps {
  children: ReactNode;
  isVisible: boolean;
}

export default function ModalSideContentSimple({
  children,
  isVisible,
}: ModalSideContentProps) {
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  return (
    <>
      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-screen bg-white shadow-lg transition-all duration-300 dark:bg-[#161618] max-w-sm rounded-l-3xl",
          isVisible
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "translate-x-full opacity-0 pointer-events-none"
        )}
        style={{
          transitionProperty: "transform, opacity",
          transitionTimingFunction: "ease-in-out",
        }}
      >
        {children}
      </div>
    </>
  );
}
