"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ModalSide from "@/components/organisms/Modal/ModalSide";
import { Eye, X as XIcon } from "lucide-react";
import { FormField } from "@/components/templates/Forms/FormField";
import { Input } from "@/components/atoms/Forms/Input";
import { Label } from "@/components/atoms/Forms/Label";
import { Button } from "@/components/atoms/Forms/Button";
import { Radio } from "@/components/atoms/Forms/Radio";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import { assistantApi } from "@/utils/apis/assistant";
import Swal from "sweetalert2";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/atoms/ToastProvider";
import {
  AssistantDocumentFile,
  documentStoreFormSchema,
  DocumentStoreFormValues,
} from "@/schemas/assistant/documentStore";
import { ModalFire } from "@/components/molecules/Modal/ModalFire";

export interface DocumentStoreFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isEdit?: boolean;
  initialData?: { id?: string; name: string; description: string } | null;
}

export default function DocumentStoreFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
}: DocumentStoreFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    resetField,
  } = useForm<DocumentStoreFormValues>({
    resolver: zodResolver(documentStoreFormSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      files: null,
      url: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData || {
          name: "",
          description: "",
          files: null,
          url: "",
        }
      );
    }
  }, [isOpen, initialData, reset]);

  const [uploading, setUploading] = useState(false);
  const { showToast } = useToast();
  const [existingFiles, setExistingFiles] = useState<AssistantDocumentFile[]>(
    []
  );
  const [fileInputs, setFileInputs] = useState<(File | null)[]>([null]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [fileType, setFileType] = useState<"url" | "file">("file");
  const { data: session } = useSession();
  const token = session?.user.accessToken;
  const organizationId = session?.organizationId;
  const branchId =
    typeof window !== "undefined" && sessionStorage.getItem("branchId")
      ? sessionStorage.getItem("branchId")
      : session?.branchId;

  const headers: Record<string, string> = {};
  if (organizationId) headers["x-organization-id"] = organizationId;
  if (branchId) headers["x-branch-id"] = branchId;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  useEffect(() => {
    const fetchFiles = async () => {
      if (!isEdit || !initialData?.id) {
        setExistingFiles([]);
        return;
      }
      setLoadingFiles(true);
      try {
        const res = await assistantApi.getAssistantDocumentFiles(
          initialData.id,
          true
        );
        setExistingFiles(res.data.files || []);
      } catch {
        setExistingFiles([]);
      } finally {
        setLoadingFiles(false);
      }
    };
    if (isOpen) fetchFiles();
  }, [isOpen, isEdit, initialData?.id]);

  const handleFileChange = (idx: number, file: File | null) => {
    const newFiles = [...fileInputs];
    newFiles[idx] = file;
    if (idx === fileInputs.length - 1 && file) {
      newFiles.push(null);
    }
    setFileInputs(newFiles);
  };

  const scrapeUrl = async (url: string) => {
    const res = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const raw = await res.text();
    if (!res.ok) {
      try {
        const err = JSON.parse(raw);
        throw new Error(
          err?.details
            ? `${err.error || "Failed to scrape"}: ${
                typeof err.details === "string"
                  ? err.details
                  : JSON.stringify(err.details)
              }`
            : err?.error || raw
        );
      } catch {
        throw new Error(raw);
      }
    }
    return { markdown: raw };
  };

  const handleFormSubmit = async (data: DocumentStoreFormValues) => {
    try {
      setUploading(true);

      if (fileType === "url" && data.url) {
        const scraped = await scrapeUrl(data.url);

        const escapeHtml = (s: string) =>
          s.replace(
            /[&<>"'`]/g,
            (c) =>
              ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
                "`": "&#96;",
              }[c] || c)
          );

        const result = await ModalFire.fire({
          title: "Preview Scraped Content",
          html: `<div style="max-height:60vh;overflow:auto;text-align:left">
           <pre style="white-space:pre-wrap;word-break:break-word;margin:0;font-size: 10px !important;
    color: #6b6b6b;">${escapeHtml(scraped.markdown || "")}</pre>
         </div>`,
          showCancelButton: true,
          confirmButtonText: "Confirm & Upload",
          cancelButtonText: "Cancel",
          width: "60rem",
        });

        if (!result.isConfirmed) {
          resetField("url");
          setUploading(false);
          return;
        }

        let documentStoreId = initialData?.id;

        if (isEdit && documentStoreId) {
          await assistantApi.updateAssistantDocument(
            documentStoreId,
            {
              name: data.name,
              description: data.description,
            },
            true,
            { headers }
          );
        } else {
          const created = await assistantApi.createAssistantDocument(
            { name: data.name, description: data.description },
            true,
            { headers }
          );
          documentStoreId = created?.data?.id;
          if (!documentStoreId)
            throw new Error("Failed to create document store");
        }

        const textBlob = new Blob([scraped.markdown || ""], {
          type: "text/plain",
        });
        const formData = new FormData();
        formData.append("files", textBlob, `${data.name}.txt`);
        formData.append("id", documentStoreId);

        await assistantApi.createAssistantDocumentFiles(
          documentStoreId,
          formData,
          true,
          { headers }
        );

        showToast(
          isEdit
            ? "Document store updated successfully!"
            : "Document store created successfully!",
          "success"
        );

        onSubmit();
        onClose();
        return;
      }

      let documentStoreId = initialData?.id;

      if (isEdit && documentStoreId) {
        await assistantApi.updateAssistantDocument(
          documentStoreId,
          {
            name: data.name,
            description: data.description,
          },
          true,
          { headers }
        );
      } else {
        const res = await assistantApi.createAssistantDocument(
          { name: data.name, description: data.description },
          true,
          { headers }
        );
        documentStoreId = res?.data?.id;
        if (!documentStoreId)
          throw new Error("Failed to create document store");
      }

      if (fileType === "file") {
        const filesToUpload = fileInputs.filter((f) => f !== null) as File[];
        if (filesToUpload.length > 0 && documentStoreId) {
          const formData = new FormData();
          filesToUpload.forEach((file) => {
            formData.append("files", file);
          });
          formData.append("id", documentStoreId);

          await assistantApi.createAssistantDocumentFiles(
            documentStoreId,
            formData,
            true,
            { headers }
          );
        }
      }

      showToast(
        isEdit
          ? "Document store updated successfully!"
          : "Document store created successfully!",
        "success"
      );

      onSubmit();
      onClose();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "Failed to create or update document store";
      showToast(message, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleViewFile = (file: AssistantDocumentFile) => {
    Swal.fire({
      title: file.source,
      html: `<div style="word-break:break-all">${file.source}</div>`,
      icon: "info",
      confirmButtonText: "Close",
    });
  };

  const handleDeleteFile = async (file: AssistantDocumentFile) => {
    const result = await Swal.fire({
      title: `Delete file "${file.source}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });
    if (result.isConfirmed && initialData?.id) {
      try {
        const formData = new FormData();
        formData.append("id", initialData.id);
        formData.append("fileId", file.id);
        await assistantApi.deleteAssistantDocumentFiles(
          file.id,
          formData,
          true,
          { headers }
        );
        setExistingFiles((prev) => prev.filter((f) => f.id !== file.id));
        showToast("File deleted successfully", "success");
      } catch {
        showToast("Failed to delete file", "error");
      }
    }
  };

  return (
    <ModalSide isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col h-full">
        <div className="border-b border-gray-200 mb-4 pb-2 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold !font-sentient dark:text-white/80">
              {isEdit ? "Edit Document" : "Add Document"}
            </h2>
            <p className="text-sm text-gray-500">
              {isEdit
                ? "Update the details below to edit the document."
                : "Fill in the details below to create a new document."}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex-1 overflow-y-auto space-y-6 pr-4"
        >
          <FormField
            label={<Label htmlFor="name">Name</Label>}
            input={
              <Input
                id="name"
                {...register("name", { required: "Name is required" })}
                placeholder="Document name"
                className="w-full"
              />
            }
            error={errors.name}
          />
          <FormField
            label={<Label htmlFor="description">Description</Label>}
            input={
              <Input
                id="description"
                {...register("description", {
                  required: "Description is required",
                })}
                placeholder="Description"
                className="w-full"
              />
            }
            error={errors.description}
          />

          <div className="space-y-2">
            <Label>File Type</Label>

            <label className="flex items-center gap-2">
              <Radio
                id="file-option"
                name="fileType"
                value="file"
                checked={fileType === "file"}
                onChange={() => setFileType("file")}
              />
              <Label htmlFor="file-option">File</Label>
            </label>

            <label className="flex items-center gap-2">
              <Radio
                id="url-option"
                name="fileType"
                value="url"
                checked={fileType === "url"}
                onChange={() => setFileType("url")}
              />
              <Label htmlFor="url-option">URL</Label>
            </label>
          </div>

          {fileType === "file" ? (
            <div>
              <Label className="mb-2">Files</Label>
              {isEdit && (
                <div className="mb-2">
                  {loadingFiles ? (
                    <div className="text-gray-400 italic">Loading files...</div>
                  ) : existingFiles.length > 0 ? (
                    <ul className="text-sm mt-1 space-y-1">
                      {existingFiles.map((file) => (
                        <li key={file.id} className="flex items-center gap-2">
                          <span>{file.source}</span>
                          <span className="text-xs text-gray-400">
                            ({file.status})
                          </span>
                          <button
                            type="button"
                            className="p-1 hover:bg-gray-100 rounded"
                            title="View file"
                            onClick={() => handleViewFile(file)}
                          >
                            <Eye className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            type="button"
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Delete file"
                            onClick={() => handleDeleteFile(file)}
                          >
                            <XIcon className="w-4 h-4 text-red-600" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-400 italic">
                      No files uploaded
                    </div>
                  )}
                </div>
              )}
              {fileInputs.map((file, idx) => (
                <div key={idx} className="mb-2">
                  <Input
                    type="file"
                    onChange={(e) =>
                      handleFileChange(
                        idx,
                        e.target.files && e.target.files[0]
                          ? e.target.files[0]
                          : null
                      )
                    }
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          ) : (
            <FormField
              label={<Label htmlFor="url">URL</Label>}
              input={
                <Input
                  id="url"
                  {...register("url", {
                    required: "URL is required",
                    pattern: {
                      value: /^(https?:\/\/[^\s$.?#].[^\s]*)$/,
                      message: "Invalid URL format",
                    },
                  })}
                  placeholder="Enter file URL"
                  className="w-full"
                />
              }
            />
          )}

          <div className="sticky bottom-0 bg-white dark:bg-[#161618] py-4 border-t mt-2 flex justify-end gap-2 z-10">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : isEdit ? "Update" : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </ModalSide>
  );
}
