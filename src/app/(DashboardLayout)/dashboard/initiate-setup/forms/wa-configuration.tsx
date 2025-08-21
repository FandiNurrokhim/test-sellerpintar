import { Input } from "@/components/atoms/Forms/Input";
import { Label } from "@/components/atoms/Forms/Label";
import { useToast } from "@/components/atoms/ToastProvider";
import { FormField } from "@/components/templates/Forms/FormField";
import {
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useForm, useWatch } from "react-hook-form";
import { useSession } from "next-auth/react";
import { whatsAppApi } from "@/utils/apis/whatsapp";
import type { CreateWhatsAppSettingPayload } from "@/types/whatsapp";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectSearch } from "@/components/atoms/Forms/SelectSearch";
import { QRCodeDisplay } from "@/components/organisms/QRCodeDisplay";

import {
  whatsAppConfigSchema,
  WhatsAppFormData,
} from "@/schemas/initiateSetup/whatsapp";

export interface WhatsAppRef {
  submitForm: () => Promise<boolean>;
  isLoading: boolean;
  fetchPrevItem?: () => Promise<void>;
  isShowingQR?: boolean;
}

interface WhatsAppProps {
  onSubmitSuccess?: () => void;
}

interface AssistantResponse {
  id: string;
  name: string;
  isActive: boolean;
}

interface AssistantsApiResponse {
  success: boolean;
  data: AssistantResponse[];
}

export const WhatsAppPage = forwardRef<WhatsAppRef, WhatsAppProps>(
  ({ onSubmitSuccess }, ref) => {
    const [isLoading, setIsLoading] = useState(false);
    const [assistants, setAssistants] = useState<
      Array<{ value: string; label: string }>
    >([]);
    const [loadingAssistants, setLoadingAssistants] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    const { showToast } = useToast();
    const { data: session } = useSession();

    const org = JSON.parse(sessionStorage.getItem("organization") || "{}");
    const branch = JSON.parse(sessionStorage.getItem("branch") || "{}");
    const organizationId = org.id || session?.organizationId;
    const branchId =
      branch.id || sessionStorage.getItem("branchId") || session?.branchId;

    const headers = useMemo(() => {
      return {
        "x-organization-id": organizationId,
        "x-branch-id": branchId,
        ...(session?.user?.accessToken && {
          Authorization: `Bearer ${session.user.accessToken}`,
        }),
      };
    }, [organizationId, branchId, session?.user?.accessToken]);

    const {
      register,
      handleSubmit,
      setValue,
      control,
      formState: { errors },
      trigger,
      getValues,
    } = useForm<WhatsAppFormData>({
      resolver: zodResolver(whatsAppConfigSchema),
      mode: "onChange",
      defaultValues: {
        name: "",
        description: "",
        instruction: "",
        temperature: 0,
        top_p: 0,
        ai: "",
      },
    });

    const aiValue = useWatch({ control, name: "ai" });

    const fetchAssistants = useCallback(async () => {
      setLoadingAssistants(true);
      try {
        const result = (await whatsAppApi.getAssistants(
          true,
          {},
          headers
        )) as AssistantsApiResponse;

        let assistantsData: AssistantResponse[] = [];
        if (result?.data && Array.isArray(result.data)) {
          assistantsData = result.data;
        }

        const assistantOptions = assistantsData
          .filter((assistant) => assistant.isActive)
          .map((assistant) => ({
            value: assistant.id,
            label: assistant.name,
          }));

        setAssistants(assistantOptions);
      } catch {
        showToast("Failed to load assistants", "error");
      } finally {
        setLoadingAssistants(false);
      }
    }, [showToast, headers]);

    useEffect(() => {
      fetchAssistants();
    }, [fetchAssistants]);

    const fetchPreviousItem = async () => {
      if (!organizationId || !branchId) {
        showToast("Organization or branch information not found", "error");
        return;
      }

      try {
        setIsLoading(true);
        const response = await whatsAppApi.getSettings(true, {}, headers);

        if (response.success && response.data && response.data.length > 0) {
          const existingSetting =
            response.data.find(
              (item) =>
                item.organizationId === organizationId &&
                item.branchId === branchId
            ) || response.data[0];
          if (existingSetting) {
            setValue("name", existingSetting.name ?? "");
            setValue("ai", existingSetting.assistantId ?? "");
            sessionStorage.setItem("whatsappConfigId", existingSetting.data.id);
            setShowQRCode(true);
            showToast("Previous WhatsApp config loaded", "success");
          } else {
            setShowQRCode(false);
          }
        }
      } catch {
        showToast("Failed to fetch previous WhatsApp config", "error");
        setShowQRCode(false);
      } finally {
        setIsLoading(false);
      }
    };

    const onFormSubmit = async (data: WhatsAppFormData): Promise<boolean> => {
      if (!data.name || !data.ai) {
        showToast("Please fill in all required fields", "error");
        return false;
      }

      if (!organizationId || !branchId) {
        showToast("Organization or branch information not found", "error");
        return false;
      }

      try {
        const createPayload: CreateWhatsAppSettingPayload = {
          name: data.name,
          assistantId: data.ai,
          autoReply: true,
        };

        const newSetting = await whatsAppApi.createSetting(
          createPayload,
          true,
          {},
          headers
        );

        if (newSetting?.data?.id) {
          sessionStorage.setItem("whatsappConfigId", newSetting.data.id);
          setShowQRCode(true);
          showToast("WhatsApp configuration created successfully!", "success");
          onSubmitSuccess?.();
          return true;
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes("Assistant ID is required")) {
            showToast("Please select a valid AI assistant", "error");
          } else if (error.message.includes("Setting name is required")) {
            showToast(
              "Please provide a name for the WhatsApp setting",
              "error"
            );
          } else {
            showToast(
              `Failed to save WhatsApp configuration: ${error.message}`,
              "error"
            );
          }
        } else {
          showToast("Failed to save WhatsApp configuration", "error");
        }
        return false;
      }
    };

    const handleSubmitForm = async (): Promise<boolean> => {
      setIsLoading(true);

      try {
        const isFormValid = await trigger();
        if (!isFormValid) {
          showToast("Please fill in all required fields correctly", "error");
          return false;
        }

        const formData = getValues();
        const result = await onFormSubmit(formData);
        return result;
      } catch {
        showToast("An error occurred while submitting the form", "error");
        return false;
      } finally {
        setIsLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      submitForm: showQRCode ? async () => true : handleSubmitForm,
      isLoading,
      fetchPrevItem: fetchPreviousItem,
      isShowingQR: showQRCode,
    }));

    return (
      <div>
        {!showQRCode ? (
          <div>
            <form onSubmit={handleSubmit(onFormSubmit)}>
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
                  label={
                    <Label className="!font-sentient" htmlFor="ai">
                      AI
                    </Label>
                  }
                  input={
                    <SelectSearch
                      value={aiValue}
                      onChange={(value: string) => setValue("ai", value)}
                      options={assistants}
                      placeholder={
                        loadingAssistants
                          ? "Loading assistants..."
                          : "Select an AI assistant"
                      }
                    />
                  }
                  error={errors.ai}
                />
              </div>
            </form>
          </div>
        ) : (
          <QRCodeDisplay />
        )}
      </div>
    );
  }
);

WhatsAppPage.displayName = "WhatsAppPage";

export { QRCodeDisplay };
