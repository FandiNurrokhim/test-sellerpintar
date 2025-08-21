import { createPortal } from "react-dom";
import React, { useEffect, useRef, useState, useCallback } from "react";

type Props = {
  children: React.ReactNode;
  anchorEl: HTMLElement | null;
  position: "top" | "bottom";
  onClose: () => void;
};

export default function PortalDropdown({ children, anchorEl, position, onClose }: Props) {
  const [coords, setCoords] = useState({ left: 0, top: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  const updateCoords = useCallback(() => {
    if (anchorEl) {
      const rect = anchorEl.getBoundingClientRect();
      setCoords({
        left: rect.left,
        top: position === "bottom" ? rect.bottom : rect.top,
      });
    }
  }, [anchorEl, position]);

  useEffect(() => {
    updateCoords();
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [anchorEl, position, updateCoords]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!anchorEl) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        left: coords.left - 150,
        top: coords.top + (position === "bottom" ? 8 : -8),
        zIndex: 9999,
      }}
    >
      {children}
    </div>,
    document.body
  );
}