"use client";

import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useBranch } from "@/context/BranchContext";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Radio } from "@/components/atoms/Forms/Radio";
import { FormField } from "@/components/templates/Forms/FormField";
import { Input } from "@/components/atoms/Forms/Input";
import { Label } from "@/components/atoms/Forms/Label";
import { Eye, X as XIcon } from "lucide-react";
import { useToast } from "@/components/atoms/ToastProvider";
import Swal from "sweetalert2";

import {
  AssistantDocument,
  AssistantDocumentFile,
  documentStoreFormSchema,
  DocumentStoreFormValues,
} from "@/schemas/assistant/documentStore";

import { assistantApi } from "@/utils/apis/assistant";

export interface DocumentFormRef {
  submitForm: () => Promise<boolean>;
  isLoading: boolean;
  fetchPrevItem?: () => Promise<void>;
}

interface DocumentFormProps {
  onSubmitSuccess?: () => void;
}

export const DocumentForm = forwardRef<DocumentFormRef, DocumentFormProps>(
  ({ onSubmitSuccess }, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isEdit, setIsEdit] = useState(false);
    const [docId, setDocId] = useState<string | null>(
      sessionStorage.getItem("documentStoreId")
    );

    const { showToast } = useToast();
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

    const {
      register,
      handleSubmit,
      formState: { errors },
      reset,
    } = useForm<DocumentStoreFormValues>({
      resolver: zodResolver(documentStoreFormSchema),
      defaultValues: {
        name: "",
        description: "",
        url: "",
      },
    });

    const [existingFiles, setExistingFiles] = useState<AssistantDocumentFile[]>(
      []
    );
    const [fileInputs, setFileInputs] = useState<(File | null)[]>([null]);
    const [fileType, setFileType] = useState<"url" | "file">("file");

    const scrapeUrl = async (url: string) => {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const raw = await res.text(); // <<— selalu text
      if (!res.ok) {
        // Coba parse JSON error dari server; kalau gagal, tampilin raw
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

    // Fetch previous document
    const fetchPreviousDocumentItem = useCallback(async () => {
      if (!docId) {
        reset({ name: "", description: "", url: "" });
        setExistingFiles([]);
        setIsEdit(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await assistantApi.getAssistantDocumentStoreById(
          docId,
          true,
          { headers }
        );
        const doc = (res as { data?: AssistantDocument })?.data;
        reset({
          name: doc?.name ?? "",
          description: doc?.description ?? "",
          url: doc?.url ?? "",
        });

        const filesRes = await assistantApi.getAssistantDocumentFiles(
          docId,
          true,
          { headers }
        );
        setExistingFiles(filesRes.data.files || []);
        setIsEdit(true);
      } catch (err) {
        showToast(
          "Failed to fetch document: " +
            (err instanceof Error ? err.message : "Unknown error"),
          "error"
        );
        reset({ name: "", description: "", url: "" });
        setExistingFiles([]);
      } finally {
        setIsLoading(false);
      }
    }, [docId, headers, reset, showToast]);

    useEffect(() => {
      fetchPreviousDocumentItem();
    }, [fetchPreviousDocumentItem]);

    const handleFileChange = (idx: number, file: File | null) => {
      const newFiles = [...fileInputs];
      newFiles[idx] = file;
      if (idx === fileInputs.length - 1 && file) {
        newFiles.push(null);
      }
      setFileInputs(newFiles);
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
      if (result.isConfirmed && docId) {
        try {
          await assistantApi.deleteAssistantDocument(file.id, true, {
            headers,
          });
          setExistingFiles((prev) => prev.filter((f) => f.id !== file.id));
          showToast("File deleted successfully", "success");
        } catch {
          showToast("Failed to delete file", "error");
        }
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

    useImperativeHandle(ref, () => ({
      submitForm: async () => {
        let success = false;
        await handleSubmit(async (data) => {
          setIsLoading(true);

          try {
            let documentStoreId = docId;

            if (isEdit && documentStoreId) {
              await assistantApi.updateAssistantDocument(
                documentStoreId,
                { name: data.name, description: data.description },
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
                throw new Error("Failed to create document");
              sessionStorage.setItem("documentStoreId", documentStoreId);
              setDocId(documentStoreId);
            }

            // Tambahkan support untuk fileType
            if (fileType === "url" && data.url) {
              // Pastikan ada fungsi scrapeUrl
              const scraped = await scrapeUrl(data.url);
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
            }

            if (fileType === "file") {
              const filesToUpload = fileInputs.filter(
                (f) => f !== null
              ) as File[];
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
                ? "Document updated successfully!"
                : "Document created successfully!",
              "success"
            );
            onSubmitSuccess?.();
            success = true;

            await fetchPreviousDocumentItem();
          } catch (err) {
            showToast(
              "Failed to save document: " +
                (err instanceof Error ? err.message : "Unknown error"),
              "error"
            );
          } finally {
            setIsLoading(false);
          }
        })();

        return success;
      },
      isLoading,
      fetchPrevItem: fetchPreviousDocumentItem,
    }));

    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading Document...</p>
          </div>
        </div>
      );
    }

    return (
      <form className="grid grid-cols-1 gap-6">
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
              placeholder="Document description"
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
                {isLoading ? (
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
                  <div className="text-gray-400 italic">No files uploaded</div>
                )}
              </div>
            )}
            {/* Input file baru */}
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
      </form>
    );
  }
);

DocumentForm.displayName = "DocumentForm";
