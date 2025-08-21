"use client";

import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/atoms/Forms/Button";
import { Label } from "@/components/atoms/Forms/Label";
import ModalSide from "@/components/organisms/Modal/ModalSide";
import type { Assistant } from "@/schemas/assistant/assistant";

interface AssistantDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistant: Assistant;
}

export default function AssistantDetailModal({
  isOpen,
  onClose,
  assistant,
}: AssistantDetailModalProps) {
  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    const date = new Date(iso);
    return date.toLocaleString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <ModalSide isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-gray-200 mb-4 pb-2 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold !font-sentient dark:text-white/80">
              Assistant Detail
            </h2>
            <p className="text-sm text-gray-500">
              View details about this assistant.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-4">
          {/* General */}
          <h3 className="font-semibold text-gray-900 dark:text-white/80">
            General
          </h3>
          <div>
            <Label className="!font-sentient">Name</Label>
            <span className="inline-block rounded bg-blue-50 text-blue-700 px-2 py-1 text-sm font-medium mt-2">
              {assistant.name}
            </span>
          </div>
          <div>
            <Label className="!font-sentient">Description</Label>
            <p className="text-gray-800 dark:text-white/80 mt-2">
              {assistant.description}
            </p>
          </div>
          <div>
            <Label className="!font-sentient">Instructions</Label>
            <p className="text-gray-800 dark:text-white/80 mt-2 whitespace-pre-wrap">
              {assistant.details?.instructions}
            </p>
          </div>
          <div>
            <Label
              className="!font-sentient"
              tooltip="Controls response creativity. Lower values (0-0.3) for focused, consistent responses. Higher values (0.7-1) for more creative, varied responses."
            >
              Temperature
            </Label>
            <p className="text-gray-800 dark:text-white/80 mt-2">
              {assistant.details?.temperature}
            </p>
          </div>

          <div>
            <Label
              className="!font-sentient"
              tooltip="When enabled, this assistant can access sales capabilities such as product catalogs, customer data, order management, and sales reporting features."
            >
              Has Sales Capabilities
            </Label>
            <p className="text-gray-800 dark:text-white/80 mt-2">
              {assistant.details?.hasSalesCapabilities ? "Yes" : "No"}
            </p>
          </div>

          {/* Timestamps */}
          <div>
            <Label className="!font-sentient">Created At</Label>
            <div className="flex items-center gap-2  mt-2">
              <span className="inline-block rounded bg-gray-100 text-gray-800 px-2 py-1 text-sm font-medium">
                {formatDate(assistant.createdAt)}
              </span>
            </div>
          </div>
          <div>
            <Label className="!font-sentient">Updated At</Label>
            <div className="flex items-center gap-2  mt-2">
              <span className="inline-block rounded bg-gray-100 text-gray-800 px-2 py-1 text-sm font-medium">
                {formatDate(assistant.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-[#161618] py-4 border-t mt-2 flex justify-end z-10">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </ModalSide>
  );
}
