"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/atoms/Forms/Button";
import { Input } from "@/components/atoms/Forms/Input";
import { Label } from "@/components/atoms/Forms/Label";
import { useZodForm } from "@/hooks/useZodForm";
import { FormField } from "@/components/templates/Forms/FormField";
import { SelectSearch } from "@/components/atoms/Forms/SelectSearch";
import { whatsAppApi } from "@/utils/apis/whatsapp";
import {
  UpdateWhatsAppSettingPayload,
  WhatsAppSetting,
} from "@/types/whatsapp";
import { useToast } from "@/components/atoms/ToastProvider";
import ModalSide from "@/components/organisms/Modal/ModalSide";
import { z } from "zod";

interface AssistantResponse {
  id: string;
  name: string;
  isActive: boolean;
}

interface AssistantsApiResponse {
  success: boolean;
  data: AssistantResponse[];
}

interface EditWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  whatsApp: WhatsAppSetting | null;
}

const whatsAppSettingSchema = z.object({
  name: z.string().min(1, "WhatsApp name is required"),
  assistantId: z.string().min(1, "Assistant is required"),
});

type WhatsAppSettingFormData = z.infer<typeof whatsAppSettingSchema>;

export const EditWhatsAppModal: React.FC<EditWhatsAppModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  whatsApp,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useZodForm(whatsAppSettingSchema);

  const { data: session } = useSession();
  const { showToast } = useToast();
  const organizationId = session?.organizationId;
  const branchId = sessionStorage.getItem("branchId") || session?.branchId;

  const [assistants, setAssistants] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [loadingAssistants, setLoadingAssistants] = useState(false);

  const headers = useMemo(() => {
    const headerObj: Record<string, string> = {};
    const token = session?.user.accessToken;
    if (organizationId) headerObj["x-organization-id"] = organizationId;
    if (branchId) headerObj["x-branch-id"] = branchId;
    if (token) headerObj["Authorization"] = `Bearer ${token}`;
    return headerObj;
  }, [organizationId, branchId, session?.user.accessToken]);

  const fetchAssistants = useCallback(async () => {
    if (!isOpen) return;

    setLoadingAssistants(true);
    try {
      const result = (await whatsAppApi.getAssistants(
        true,
        {},
        headers
      )) as AssistantsApiResponse;

      const assistantsData = result?.data || [];
      const assistantOptions = assistantsData
        .filter((assistant) => assistant.isActive)
        .map((assistant) => ({
          value: assistant.id,
          label: assistant.name,
        }));
      setAssistants(assistantOptions);
    } catch (err) {
      console.error("Failed to fetch assistants:", err);
      showToast("Failed to load assistants", "error");
    } finally {
      setLoadingAssistants(false);
    }
  }, [isOpen, showToast, headers]);

  useEffect(() => {
    fetchAssistants();
  }, [fetchAssistants]);

  useEffect(() => {
    if (whatsApp) {
      reset({
        name: whatsApp.name,
        assistantId: whatsApp.assistantId,
      });
    }
  }, [whatsApp, reset]);

  const onFormSubmit = async (data: WhatsAppSettingFormData): Promise<void> => {
    if (!whatsApp?.id) {
      showToast("WhatsApp setting ID is missing.", "error");
      return;
    }

    try {
      const payload: UpdateWhatsAppSettingPayload = {
        name: data.name,
        assistantId: data.assistantId,
      };
      await whatsAppApi.updateSetting(whatsApp.id, payload, true, {}, headers);
      showToast("WhatsApp setting updated successfully", "success");
      reset();
      onClose();
      onSubmit?.();
    } catch (error: unknown) {
      console.error("Error updating WhatsApp setting:", error);

      let errorMessage = "Failed to update WhatsApp setting";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      showToast(errorMessage, "error");
    }
  };

  const handleClose = (): void => {
    reset();
    onClose();
  };

  return (
    <ModalSide isOpen={isOpen} onClose={handleClose}>
      <div className="flex flex-col h-full">
        <div className="border-b border-gray-200 mb-4">
          <h2 className="text-lg font-bold !font-sentient dark:text-white/80">
            Edit WhatsApp Setting
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Update the details for your WhatsApp bot configuration.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex-1 overflow-y-auto space-y-6 pr-4"
        >
          <div className="space-y-4">
            <FormField
              label={
                <Label className="!font-sentient" htmlFor="name">
                  WhatsApp Name <span className="text-red-500">*</span>
                </Label>
              }
              input={
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter WhatsApp name"
                  className="w-full"
                  required
                />
              }
              error={errors.name}
            />

            <FormField
              label={
                <Label
                  className="!font-sentient"
                  htmlFor="assistantId"
                  tooltip="The assistant that will manage WhatsApp conversations, provide automated responses, and handle customer inquiries through this WhatsApp integration."
                >
                  Assistant <span className="text-red-500">*</span>
                </Label>
              }
              input={
                <SelectSearch
                  value={watch("assistantId") || ""}
                  isCanAdd={false}
                  onChange={(value: string) => setValue("assistantId", value)}
                  options={assistants}
                  placeholder={
                    loadingAssistants
                      ? "Loading assistants..."
                      : "Select assistant"
                  }
                />
              }
              error={errors.assistantId}
            />
          </div>
          <div className="sticky bottom-0 bg-white dark:bg-[#161618] py-4 border-t mt-2 flex justify-end gap-2 z-10">
            <Button variant="ghost" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </form>
      </div>
    </ModalSide>
  );
};
