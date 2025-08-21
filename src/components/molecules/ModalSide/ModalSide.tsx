import React, { ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface ModalSideContentProps {
  children: ReactNode;
  isVisible: boolean;
}

export default function ModalSideContent({
  children,
  isVisible,
}: ModalSideContentProps) {
  const [isFullSize, setIsFullSize] = React.useState(false);
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    setIsFullSize(false);
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  return (
    <>
      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-screen bg-white p-6 shadow-lg transition-all duration-300 dark:bg-[#161618]",
          isVisible
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "translate-x-full opacity-0 pointer-events-none",
          isFullSize ? "w-full max-w-full" : "max-w-sm rounded-l-3xl"
        )}
        style={{
          transitionProperty: "transform, opacity, width, max-width",
          transitionTimingFunction: "ease-in-out",
        }}
      >
        <div
          className={cn(
            "absolute p-1 z-20 cursor-pointer hover:shadow-lg transition-transform duration-300 bg-[#2F49B3] shadow-md rounded-full",
            isFullSize
              ? "left-4 bottom-10 top-auto -translate-y-0"
              : "-left-4 top-1/2 -translate-y-1/2 hover:translate-x-1"
          )}
        >
          {!isFullSize ? (
            <ChevronLeft
              className="w-6 h-6 text-white"
              onClick={() => setIsFullSize(true)}
            />
          ) : (
            <ChevronRight
              className="w-6 h-6 text-white"
              onClick={() => setIsFullSize(false)}
            />
          )}
        </div>
        {children}
      </div>
    </>
  );
}
