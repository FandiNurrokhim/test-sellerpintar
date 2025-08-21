"use client";

import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button } from "@/components/atoms/Forms/Button";

type FireOptions = {
  title?: React.ReactNode;
  html?: string;
  content?: React.ReactNode;
  showCancelButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  width?: number | string;
  allowOutsideClick?: boolean;
  className?: string;
};

type FireResult = { isConfirmed: boolean; isDismissed: boolean };

function Panel({
  visible,
  onBackdrop,
  title,
  html,
  content,
  footer,
  width,
  className,
}: {
  visible: boolean;
  onBackdrop: () => void;
  title?: React.ReactNode;
  html?: string;
  content?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number | string;
  className?: string;
}) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onBackdrop();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onBackdrop]);

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={onBackdrop}
    >
      <div
        className="
      bg-[white]/20 p-2 rounded-4xl
      "
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ width: typeof width === "number" ? `${width}px` : width }}
          className={`w-full max-w-5xl bg-white dark:bg-[#161618] rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 ${
            visible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 -translate-y-2 scale-95"
          } ${className || ""}`}
        >
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{
              boxShadow: "0 4px 27.1px 0 rgba(0, 0, 0, 0.11)",
            }}
          >
            <h3 className="text-[18px] !font-sentient font-semibold text-blue-600 hover:text-blue-800 transition dark:text-white">
              {title}
            </h3>
            <button
              onClick={onBackdrop}
              className="h-9 w-9 grid place-items-center cursor-pointer rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
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
          <div className="px-6 py-5 max-h-[70vh] overflow-auto">
            {html ? (
              <div dangerouslySetInnerHTML={{ __html: html }} />
            ) : (
              content
            )}
          </div>
          {footer ? (
            <div className="px-6 py-3 bg-[#EDEDED]">
              <div className="flex justify-end gap-2">{footer}</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Instance({
  options,
  resolve,
  cleanup,
}: {
  options: FireOptions;
  resolve: (r: FireResult) => void;
  cleanup: () => void;
}) {
  const [mounted, setMounted] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const closeWith = (r: FireResult) => {
    setVisible(false);
    setTimeout(() => {
      setMounted(false);
      resolve(r);
      cleanup();
    }, 300);
  };

  const footer = (
    <>
      {options.showCancelButton && (
        <Button
          variant="outline"
          onClick={() => closeWith({ isConfirmed: false, isDismissed: true })}
          className="rounded-lg"
        >
          {options.cancelButtonText || "Cancel"}
        </Button>
      )}
      <Button
        variant="default"
        onClick={() => closeWith({ isConfirmed: true, isDismissed: false })}
        className="rounded-lg"
      >
        {options.confirmButtonText || "Confirm"}
      </Button>
    </>
  );

  if (!mounted) return null;

  return (
    <Panel
      visible={visible}
      onBackdrop={() =>
        options.allowOutsideClick === false
          ? null
          : closeWith({ isConfirmed: false, isDismissed: true })
      }
      title={options.title}
      html={options.html}
      content={options.content}
      footer={footer}
      width={options.width || "60rem"}
      className={options.className}
    />
  );
}

export const ModalFire = {
  fire(options: FireOptions): Promise<FireResult> {
    return new Promise((resolve) => {
      const el = document.createElement("div");
      document.body.appendChild(el);
      const root = createRoot(el);
      const cleanup = () => {
        root.unmount();
        el.remove();
      };
      root.render(
        <Instance options={options} resolve={resolve} cleanup={cleanup} />
      );
    });
  },
};
