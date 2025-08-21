"use client";

import React, { ReactNode } from "react";
import Overlay from "@/components/atoms/Modal/Overlay";
import ModalContent from "@/components/molecules/Modal/ModalContent";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  return (
    <>
      <Overlay isVisible={isOpen} onClick={onClose} />
      <ModalContent isVisible={isOpen}>{children}</ModalContent>
    </>
  );
}
