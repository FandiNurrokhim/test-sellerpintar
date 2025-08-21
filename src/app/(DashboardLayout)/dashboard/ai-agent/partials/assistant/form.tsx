"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import {
  Assistant,
  createAssistantSchema,
  CreateAssistantFormValues,
} from "@/schemas/assistant/assistant";

import { FormField } from "@/components/templates/Forms/FormField";
import { SelectSearch } from "@/components/atoms/Forms/SelectSearch";
import { Textarea } from "@/components/atoms/Forms/Textarea";
import { Input } from "@/components/atoms/Forms/Input";
import { Label } from "@/components/atoms/Forms/Label";
import { Button } from "@/components/atoms/Forms/Button";
import { Range } from "@/components/atoms/Forms/Range";
import { useToast } from "@/components/atoms/ToastProvider";

import ModalSide from "@/components/organisms/Modal/ModalSide";
import Swal from "sweetalert2";

import { useSession } from "next-auth/react";
import { assistantApi } from "@/utils/apis/assistant";

export interface AssistantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isEdit?: boolean;
  initialData?: Assistant | null;
}

export default function AssistantFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
}: AssistantFormModalProps) {
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateAssistantFormValues>({
    resolver: zodResolver(createAssistantSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description,
          instructions: initialData.details?.instructions || "",
          temperature: initialData.details?.temperature ?? 1,
        }
      : {
          name: "",
          instructions: "",
          description: "",
          temperature: 1,
        },
  });

  useEffect(() => {
    if (isOpen) {
      reset(
        initialData
          ? {
              name: initialData.name,
              description: initialData.description,
              instructions: initialData.details?.instructions || "",
              temperature: initialData.details?.temperature ?? 1,
              hasSalesCapabilities: initialData.hasSalesCapabilities ?? false,
              assistantDocumentStores: Array.isArray(
                initialData.assistantDocumentStores
              )
                ? initialData.assistantDocumentStores.map(
                    (doc: string | { id: string }) =>
                      typeof doc === "string" ? doc : doc.id
                  )
                : [],
            }
          : {
              name: "",
              instructions: "",
              description: "",
              temperature: 1,
              hasSalesCapabilities: false,
              assistantDocumentStores: [],
            }
      );
    }
  }, [isOpen, initialData, reset]);

  const title = isEdit ? "Edit Assistant" : "Add Assistant";
  const { showToast } = useToast();

  const { data: session } = useSession();
  const token = session?.user.accessToken;
  const organizationId = session?.organizationId;
  const branchId =
    typeof window !== "undefined"
      ? sessionStorage.getItem("branchId") || session?.branchId
      : undefined;
  const headers = useMemo(() => {
    const h: Record<string, string> = {};
    if (organizationId) h["x-organization-id"] = organizationId;
    if (branchId) h["x-branch-id"] = branchId;
    if (token) h["Authorization"] = `Bearer ${token}`;
    return h;
  }, [organizationId, branchId, token]);

  const [documents, setDocuments] = useState<{ id: string; name: string }[]>(
    []
  );

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await assistantApi.getAssistantsDocuments(true, {
          headers,
        });
        setDocuments(
          (res.data?.documentStores || []).map(
            (doc: { id: string; name: string }) => ({
              id: doc.id,
              name: doc.name,
            })
          )
        );
      } catch (err) {
        await Swal.fire({
          icon: "error",
          title: "Failed",
          text:
            typeof err === "object" &&
            err !== null &&
            "message" in err &&
            typeof (err as { message?: unknown }).message === "string"
              ? (err as { message: string }).message
              : "Failed to Fetch",
        });
      }
    };
    fetchDocuments();
  }, [headers]);

  const handleFormSubmit = async (formData: CreateAssistantFormValues) => {
    try {
      const payload = {
        name: formData.name,
        instructions: formData.instructions,
        temperature: formData.temperature,
        description: formData.description,
        hasSalesCapabilities: formData.hasSalesCapabilities ?? false,
        assistantDocumentStores: formData.assistantDocumentStores || [],
      };

      if (isEdit && initialData?.id) {
        await assistantApi.updateAssistant(initialData.id, payload, true, {
          headers,
        });
        showToast("Assistant updated successfully!", "success");
      } else {
        await assistantApi.createAssistant(payload, true, { headers });
        showToast("Assistant created successfully!", "success");
      }
      onSubmit();
      onClose();
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to create or update assistant",
      });
      console.error("Failed to submit assistant:", err);
    }
  };

  const temperature = watch("temperature");

  return (
    <ModalSide isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-gray-200 mb-4 pb-2 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold !font-sentient dark:text-white/80">
              {title}
            </h2>
            <p className="text-sm text-gray-500">
              {isEdit
                ? "Update the details below to edit the assistant."
                : "Fill in the details below to create a new assistant."}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex-1 overflow-y-auto space-y-6 pr-4"
        >
          {/* General */}
          <h3 className="font-semibold text-gray-900 dark:text-white/80">
            General
          </h3>
          <FormField
            label={<Label htmlFor="name">Name</Label>}
            input={
              <Input
                id="name"
                {...register("name")}
                placeholder="Assistant name"
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
                {...register("description")}
                placeholder="Brief description"
                className="w-full"
              />
            }
            error={errors.description}
          />
          <FormField
            label={<Label htmlFor="instructions">Instructions</Label>}
            input={
              <Textarea
                id="instructions"
                {...register("instructions")}
                placeholder="Assistant instructions"
                className="w-full border rounded p-2 bg-white dark:bg-transparent text-gray-900 dark:text-gray-100"
                rows={10}
              />
            }
            error={errors.instructions}
          />
          <FormField
            label={
              <div className="flex justify-between items-center">
                <Label
                  htmlFor="temperature"
                  tooltip="Controls response creativity. Lower values (0-0.3) for focused, consistent responses. Higher values (0.7-1) for more creative, varied responses."
                >
                  Temperature
                </Label>
                <span className="text-xs text-gray-500">
                  {String(typeof temperature === "number" ? temperature : 1)}
                </span>
              </div>
            }
            input={
              <Range
                isDecimal
                min={0}
                max={1}
                value={temperature ?? 1}
                onChange={(val: number) =>
                  setValue("temperature", val, {
                    shouldValidate: true,
                  })
                }
                className="w-full"
              />
            }
            error={errors.temperature}
          />

          <FormField
            label={
              <Label
                htmlFor="hasSalesCapabilities"
                tooltip="When enabled, this assistant can access sales capabilities such as product catalogs, customer data, order management, and sales reporting features."
              >
                Sales Capabilities
              </Label>
            }
            input={
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="true"
                    checked={watch("hasSalesCapabilities") === true}
                    onChange={() =>
                      setValue("hasSalesCapabilities", true, {
                        shouldValidate: true,
                      })
                    }
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    Enable
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="false"
                    checked={watch("hasSalesCapabilities") === false}
                    onChange={() =>
                      setValue("hasSalesCapabilities", false, {
                        shouldValidate: true,
                      })
                    }
                  />
                  <span className="text-gray-700 dark:text-gray-300">
                    Disable
                  </span>
                </label>
              </div>
            }
            error={errors.hasSalesCapabilities}
          />
          <FormField
            label={
              <Label
                htmlFor="assistantDocumentStores"
                tooltip="Choose which document stores this assistant can reference to answer questions and provide information based on your uploaded documents."
              >
                Documents
              </Label>
            }
            input={
              <SelectSearch
                isMultiple={true}
                value={watch("assistantDocumentStores") || []}
                onChange={(value: string[]) =>
                  setValue("assistantDocumentStores", value)
                }
                options={documents.map((doc) => ({
                  value: doc.id,
                  label: doc.name,
                }))}
                placeholder="Select documents"
              />
            }
            error={
              Array.isArray(errors.assistantDocumentStores)
                ? errors.assistantDocumentStores[0]
                : errors.assistantDocumentStores
            }
          />
          {/* Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-[#161618] py-4 border-t mt-2 flex justify-end gap-2 z-10">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Update" : "Submit"}</Button>
          </div>
        </form>
      </div>
    </ModalSide>
  );
}
