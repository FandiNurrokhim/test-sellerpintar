"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, X as CloseIcon } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    setToasts((prev) => {
      const exists = prev.some((t) => t.message === message && t.type === type);
      if (exists) return prev;
      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          message,
          type,
        },
      ];
    });
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999999999999999999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [isPaused, setIsPaused] = useState(false);
  const duration = 4000; // ms

  const icons = {
    success: <CheckCircle2 className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
    warning: <Info className="w-5 h-5" />,
  };
  const bgColor = {
    success: "bg-green-600/70 backdrop-blur-md",
    error: "bg-red-600/70 backdrop-blur-md",
    info: "bg-blue-600/70 backdrop-blur-md",
    warning: "bg-yellow-600/70 backdrop-blur-md",
  }[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`pointer-events-auto max-w-sm w-full ${bgColor} rounded-lg shadow-lg overflow-hidden`}
    >
      {/* Content */}
      <div className="flex items-start p-4 gap-2 text-white">
        {icons[toast.type]}
        <div className="flex-1 text-sm">{toast.message}</div>
        <button onClick={onClose} className="opacity-80 hover:opacity-100">
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/40 overflow-hidden">
        <div
          className="h-full bg-white"
          style={{
            animation: `shrink ${duration}ms linear forwards`,
            animationPlayState: isPaused ? "paused" : "running",
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onAnimationEnd={onClose}
        />
      </div>

      {/* Keyframes for shrink */}
      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </motion.div>
  );
}
