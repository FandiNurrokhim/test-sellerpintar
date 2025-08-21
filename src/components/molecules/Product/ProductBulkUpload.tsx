"use client";

import React, { useRef, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useBranch } from "@/context/BranchContext";
import { useToast } from "@/components/atoms/ToastProvider";
import { Button } from "@/components/atoms/Forms/Button";
import { Plus } from "lucide-react";
import Swal from "sweetalert2";
import { productApi } from "@/utils/apis/product";
import Modal from "@/components/organisms/Modal/ModalV2";

interface ProductBulkUploadProps {
  onSuccess?: () => void;
}

const EXCEL_MIME = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

export const ProductBulkUpload: React.FC<ProductBulkUploadProps> = ({
  onSuccess,
}) => {
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const { data: session } = useSession();
  const token = session?.user.accessToken;
  const organizationId = session?.organizationId;
  const { branchId } = useBranch();

  const headers = useMemo(() => {
    const h: Record<string, string> = {};
    if (organizationId) h["x-organization-id"] = organizationId;
    if (branchId) h["x-branch-id"] = branchId;
    if (token) h["Authorization"] = `Bearer ${token}`;
    return h;
  }, [organizationId, branchId, token]);

  const handleDownloadTemplate = async () => {
    try {
      const res = await productApi.getTemplate({ headers });
      const url = window.URL.createObjectURL(res as Blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "products-template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast("Template downloaded successfully!", "success");
    } catch (err) {
      showToast("Failed to download template: " + err, "error");
    }
  };

  const validateAndSetFile = (f: File | undefined | null) => {
    if (!f) return;
    if (!EXCEL_MIME.includes(f.type) && !f.name.match(/\.(xlsx|xls)$/i)) {
      showToast("File harus .xlsx atau .xls", "warning");
      return;
    }
    setFile(f);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    validateAndSetFile(f);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    validateAndSetFile(f);
  };

  const handleUpload = async () => {
    if (!file) {
      showToast("Pilih atau drop file Excel terlebih dahulu.", "warning");
      return;
    }
    setIsUploading(true);
    Swal.fire({
      title: "Uploading...",
      html: "Please wait while your products are being uploaded.",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    try {
      const formData = new FormData();
      formData.append("file", file);
      await productApi.uploadProducts(formData, { headers });
      Swal.close();
      showToast("Products uploaded successfully!", "success");
      onSuccess?.();
      if (inputRef.current) inputRef.current.value = "";
      setFile(null);
      setIsOpen(false);
    } catch (err) {
      Swal.close();
      showToast(
        "Failed to upload products: " + (err as Error).message,
        "error"
      );
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 h-10"
        onClick={() => setIsOpen(true)}
        disabled={isUploading}
      >
        <Plus className="size-4" />
        Import Products
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Import Products"
        footer={
          <div className="w-full flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleDownloadTemplate}
              disabled={isUploading}
            >
              Download Template
            </Button>
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex items-center gap-2 !bg-[#1D6F42] !hover:bg-[#218650] text-white"
                onClick={handleUpload}
                disabled={isUploading}
              >
                Upload
              </Button>
            </div>
          </div>
        }
      >
        <div className="my-6">
          <div
            className={[
              "relative w-full rounded-xl border-2 border-dashed p-8 text-center transition",
              dragActive
                ? "border-[#1D6F42] bg-[#1D6F42]/5"
                : "border-gray-300 dark:border-gray-600",
              isUploading ? "opacity-60 pointer-events-none" : "cursor-pointer",
            ].join(" ")}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragActive(false);
            }}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
            }}
            role="button"
            tabIndex={0}
            aria-disabled={isUploading}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              className="hidden"
              onChange={handleInputChange}
              disabled={isUploading}
            />
            <div className="flex flex-col items-center gap-2">
              <div className="text-sm font-medium">
                {file
                  ? "File selected"
                  : "Drop file Excel in this area or click to select"}
              </div>
              {file ? (
                <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                  <span className="truncate max-w-[60vw] md:max-w-[28rem]">
                    {file.name}
                  </span>
                  <Button
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (inputRef.current) inputRef.current.value = "";
                    }}
                  >
                    Delete
                  </Button>
                </div>
              ) : (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Format: .xlsx atau .xls
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
