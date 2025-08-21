"use client";

import React, { ReactNode } from "react";
import Overlay from "@/components/atoms/Modal/Overlay";
import ModalSideContent from "@/components/molecules/ModalSide/ModalSide";

interface ModalSideProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function ModalSide({
  isOpen,
  onClose,
  children,
}: ModalSideProps) {
  return (
    <>
      <Overlay isVisible={isOpen} onClick={onClose} />
      <ModalSideContent isVisible={isOpen}>{children}</ModalSideContent>
    </>
  );
}
