"use client";

import React, { useEffect, useState, useCallback } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className,
}: ModalProps) {
  const [mounted, setMounted] = useState(isOpen);
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (mounted) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [mounted, onClose]);

  const stop = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  if (!mounted) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4
      bg-black/40 backdrop-blur-sm transition-opacity duration-300
      ${visible ? "opacity-100" : "opacity-0"}`}
      onClick={onClose}
    >
      <div
        onClick={stop}
        className={`w-full max-w-4xl bg-white dark:bg-[#161618] rounded-md
        shadow-2xl overflow-hidden transform transition-all duration-300
        ${
          visible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-2 scale-95"
        }
        ${className || ""}`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10">
          <h3 className="text-[18px] font-semibold text-blue-600 hover:text-blue-800 transition dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="h-9 w-9 grid place-items-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Close"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-blue-600 hover:text-blue-800 transition dark:text-white/80"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 max-h-[70vh] overflow-auto">{children}</div>

        <div className="px-6 py-4 border-t border-black/10 dark:border-white/10 bg-gray-50/60 dark:bg-white/5">
          <div className="flex justify-end gap-2">{footer}</div>
        </div>
      </div>
    </div>
  );
}
