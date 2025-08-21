"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/atoms/Forms/Button";
import { Label } from "@/components/atoms/Forms/Label";
import ModalSide from "@/components/organisms/Modal/ModalSide";
import { WhatsAppSetting } from "@/types/whatsapp";

interface DetailWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  whatsApp: WhatsAppSetting | null;
}

export const DetailWhatsAppModal: React.FC<DetailWhatsAppModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  whatsApp,
}) => {
  useEffect(() => {
    if (!isOpen) {
      // Membersihkan data saat modal ditutup
      return;
    }
  }, [isOpen]);

  const handleClose = (): void => {
    onClose();
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "CONNECTED":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "CONNECTING":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "INACTIVE":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
      case "ERROR":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  if (!whatsApp) {
    return null;
  }

  return (
    <ModalSide isOpen={isOpen} onClose={handleClose}>
      <div className="flex flex-col h-full">
        <div className="border-b border-gray-200 mb-4">
          <h2 className="text-lg font-bold !font-sentient dark:text-white/80">
            WhatsApp Setting Details
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            View the details of your WhatsApp bot configuration.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-4">
          <div className="space-y-4">
            <div className="flex flex-col">
              <Label className="!font-sentient mb-1" htmlFor="name">
                WhatsApp Name
              </Label>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                {whatsApp.name}
              </p>
            </div>

            <div className="flex flex-col">
              <Label className="!font-sentient mb-1" htmlFor="status">
                Status
              </Label>
              <span
                className={`px-2 py-1 rounded text-xs font-medium w-fit ${getStatusColor(
                  whatsApp.botStatus
                )}`}
              >
                {whatsApp.botStatus}
              </span>
            </div>

            <div className="flex flex-col">
              <Label className="!font-sentient mb-1" htmlFor="phoneNumber">
                Phone Number
              </Label>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                {whatsApp.phoneNumber || "Not Connected"}
              </p>
            </div>

            <div className="flex flex-col">
              <Label
                className="!font-sentient mb-1"
                htmlFor="assistant"
                tooltip="The assistant that will manage WhatsApp conversations, provide automated responses, and handle customer inquiries through this WhatsApp integration."
              >
                Assistant
              </Label>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                {whatsApp.assistantName}
              </p>
            </div>

            <div className="flex flex-col">
              <Label className="!font-sentient mb-1" htmlFor="lastConnected">
                Last Connected At
              </Label>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                {whatsApp.lastConnectedAt
                  ? new Date(whatsApp.lastConnectedAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-[#161618] py-4 border-t mt-2 flex justify-end gap-2 z-10">
          <Button variant="ghost" type="button" onClick={handleClose}>
            Close
          </Button>
          <Button type="button" onClick={onEdit}>
            Edit
          </Button>
        </div>
      </div>
    </ModalSide>
  );
};
