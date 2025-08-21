"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/atoms/Forms/Button";
import { Label } from "@/components/atoms/Forms/Label";
import ModalSide from "@/components/organisms/Modal/ModalSide";
import { assistantApi } from "@/utils/apis/assistant";
import type { AssistantDocumentStore, AssistantDocumentFile } from "@/schemas/assistant/documentStore";

interface DocumentStoreDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentStore: AssistantDocumentStore;
}

export default function DocumentStoreDetailModal({
  isOpen,
  onClose,
  documentStore,
}: DocumentStoreDetailModalProps) {
  const [files, setFiles] = useState<AssistantDocumentFile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      if (!documentStore?.id) return;
      setLoading(true);
      try {
        const res = await assistantApi.getAssistantDocumentFiles(documentStore.id, true);
        setFiles(res.data.files || []);
      } catch {
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };
    if (isOpen) fetchFiles();
  }, [isOpen, documentStore?.id]);

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleString() : "-";

  return (
    <ModalSide isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-gray-200 mb-4 pb-2 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold !font-sentient dark:text-white/80">
              Document Store Detail
            </h2>
            <p className="text-sm text-gray-500">
              View details and files for this document store.
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-4">
          <div>
            <Label className="!font-sentient">Name</Label>
            <span className="inline-block rounded bg-blue-50 text-blue-700 px-2 py-1 text-sm font-medium mt-2">
              {documentStore.name}
            </span>
          </div>
          <div>
            <Label className="!font-sentient">Description</Label>
            <p className="text-gray-800 dark:text-white/80 mt-2">{documentStore.description}</p>
          </div>
          <div>
            <Label className="!font-sentient">Files</Label>
            {loading ? (
              <p className="text-gray-400 italic mt-2">Loading files...</p>
            ) : files.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {files.map((file) => (
                  <li key={file.id} className="flex flex-col gap-1 border-b pb-2">
                    <span className="font-medium">{file.source}</span>
                    <span className="text-xs text-gray-500">
                      Uploaded: {formatDate(file.createdAt)}
                    </span>
                    <span className="text-xs text-gray-500">
                      Status: {file.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 italic mt-2">No files uploaded</p>
            )}
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