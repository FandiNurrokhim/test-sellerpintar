"use client";

import React, { ReactNode } from "react";
import Overlay from "@/components/atoms/Modal/Overlay";
import ModalSideContentSimple from "@/components/molecules/ModalSide/ModalSideSimple";

interface ModalSideProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function ModalSideSimple({
  isOpen,
  onClose,
  children,
}: ModalSideProps) {
  return (
    <>
      <Overlay isVisible={isOpen} onClick={onClose} />
      <ModalSideContentSimple isVisible={isOpen}>
        {children}
      </ModalSideContentSimple>
    </>
  );
}
