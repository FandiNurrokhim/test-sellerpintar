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

import { FormField } from "@/components/templates/Forms/FormField";
import { SelectSearch } from "@/components/atoms/Forms/SelectSearch";
import { Input } from "@/components/atoms/Forms/Input";
import { Label } from "@/components/atoms/Forms/Label";
import { Textarea } from "@/components/atoms/Forms/Textarea";
import { Range } from "@/components/atoms/Forms/Range";
import { useToast } from "@/components/atoms/ToastProvider";

import { assistantApi } from "@/utils/apis/assistant";
import {
  Assistant,
  createAssistantSchema,
  CreateAssistantFormValues,
} from "@/schemas/assistant/assistant";

export interface AssistantRef {
  submitForm: () => Promise<boolean>;
  isLoading: boolean;
  fetchPrevItem?: () => Promise<void>;
}

interface AssistantProps {
  onSubmitSuccess?: () => void;
}

export const AssistantForm = forwardRef<AssistantRef, AssistantProps>(
  ({ onSubmitSuccess }, ref) => {
    const [isLoading, setIsLoading] = useState(true);
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

    // --- UPDATE: gunakan createAssistantSchema dan CreateAssistantFormValues ---
    const {
      register,
      handleSubmit,
      setValue,
      watch,
      formState: { errors },
      trigger,
      reset,
    } = useForm<CreateAssistantFormValues>({
      resolver: zodResolver(createAssistantSchema),
      defaultValues: {
        name: "",
        description: "",
        instructions: "",
        temperature: 1,
        hasSalesCapabilities: false,
        assistantDocumentStores: [],
      },
    });

    const temperature = watch("temperature");

    // --- Fetch previous item jika ada ---
    const fetchPreviousItem = useCallback(async () => {
      setIsLoading(true);

      try {
        const aiConfigId = sessionStorage.getItem("aiConfigId");

        if (!aiConfigId) {
          reset({
            name: "",
            description: "",
            instructions: "",
            temperature: 1,
            hasSalesCapabilities: false,
            assistantDocumentStores: [],
          });
        } else {
          const result = await assistantApi.getById(aiConfigId);
          const aiConfig = (result as { data?: Assistant })?.data;

          if (!aiConfig) {
            reset({
              name: "",
              description: "",
              instructions: "",
              temperature: 1,
              hasSalesCapabilities: false,
              assistantDocumentStores: [],
            });
          } else {
            reset({
              name: aiConfig.name ?? "",
              description: aiConfig.description ?? "",
              instructions: aiConfig.details?.instructions ?? "",
              temperature: aiConfig.details?.temperature ?? 1,
              hasSalesCapabilities: aiConfig.hasSalesCapabilities ?? false,
              assistantDocumentStores: Array.isArray(
                aiConfig.assistantDocumentStores
              )
                ? aiConfig.assistantDocumentStores.map(
                    (doc: string | { id: string }) =>
                      typeof doc === "string" ? doc : doc.id
                  )
                : [],
            });
          }
        }
      } catch (err) {
        showToast(
          "Failed to fetch previous AI config: " +
            (err instanceof Error ? err.message : "Unknown error"),
          "error"
        );
        reset({
          name: "",
          description: "",
          instructions: "",
          temperature: 1,
          assistantDocumentStores: [],
        });
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 400);
      }
    }, [reset, showToast]);

    useEffect(() => {
      fetchPreviousItem();
    }, [branchId, fetchPreviousItem]);

    // --- Fetch documents ---
    const [documents, setDocuments] = useState<{ id: string; name: string }[]>(
      []
    );
    const fetchDocuments = useCallback(async () => {
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
        showToast(
          "Failed to fetch documents: " +
            (err instanceof Error ? err.message : "Unknown error"),
          "error"
        );
      }
    }, [headers, showToast]);

    useEffect(() => {
      fetchDocuments();
    }, [branchId, fetchDocuments]);

    // --- Submit handler ---
    const handleSubmitForm = async () => {
      setIsLoading(true);
      let isValid = false;

      try {
        const isFormValid = await trigger();
        if (!isFormValid) {
          showToast("Please fill in all required fields correctly", "error");
          return false;
        }

        await handleSubmit(async (data) => {
          const result = createAssistantSchema.safeParse(data);
          if (!result.success) {
            showToast("Validation failed", "error");
            return;
          }

          const payload = {
            name: data.name,
            description: data.description,
            instructions: data.instructions,
            temperature: data.temperature,
            assistantDocumentStores: data.assistantDocumentStores || [],
          };

          try {
            const aiConfigId = sessionStorage.getItem("aiConfigId");
            if (aiConfigId) {
              await assistantApi.updateAssistant(aiConfigId, payload, true, {
                headers,
              });
              showToast("AI configuration updated successfully!", "success");
              sessionStorage.setItem("alreadySetupAI", "true");
            } else {
              const res = await assistantApi.createAssistant(payload, true, {
                headers,
              });
              const newId = res?.data?.id;
              if (newId) {
                sessionStorage.setItem("aiConfigId", newId);
                showToast("AI configuration created successfully!", "success");
              }
            }

            isValid = true;
            onSubmitSuccess?.();
          } catch (error) {
            showToast(
              "Failed to save AI configuration" +
                (error instanceof Error ? error.message : "Unknown error"),
              "error"
            );
          }
        })();
      } finally {
        setIsLoading(false);
      }

      return isValid;
    };

    useImperativeHandle(ref, () => ({
      submitForm: async () => {
        const result = await handleSubmitForm();
        return result;
      },
      isLoading,
      fetchPrevItem: fetchPreviousItem,
    }));

    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading Assistant...</p>
          </div>
        </div>
      );
    }

    return (
      <form>
        <div className="grid grid-cols-1 gap-6">
          <FormField
            label={<Label htmlFor="name">Name</Label>}
            input={
              <Input
                id="name"
                {...register("name")}
                placeholder="AI Name"
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
                placeholder="AI Description"
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
                placeholder="AI Instructions"
                className="w-full border rounded p-2 bg-white dark:bg-transparent text-gray-900 dark:text-gray-100"
                rows={10}
              />
            }
            error={errors.instructions}
          />

          <FormField
            label={
              <div className="flex justify-between items-center">
                <Label htmlFor="temperature">Temperature</Label>
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
              <Label htmlFor="hasSalesCapabilities">Sales Capabilities</Label>
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
                  <span>Enable</span>
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
                  <span>Disable</span>
                </label>
              </div>
            }
            error={errors.hasSalesCapabilities}
          />

          <FormField
            label={<Label htmlFor="assistantDocumentStores">Documents</Label>}
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
        </div>
      </form>
    );
  }
);

AssistantForm.displayName = "Assistant Page";
