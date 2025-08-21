// src/utils/apis/whatsapp.ts
import { apiCall, ApiOptions } from "@/utils/api";
import type {
  WhatsAppSetting,
  WhatsAppSettingsResponse,
  WhatsAppSettingResponse,
  CreateWhatsAppSettingPayload,
  UpdateWhatsAppSettingPayload,
  WhatsAppConnectionResponse,
  WhatsAppStatusResponse,
  WhatsAppDeleteResponse,
  WhatsAppConnectionWaitOptions,
  GetHistoryParams,
  WhatsAppHistoryResponse,
} from "@/types/whatsapp";
import { GetConversationMessagesResponse } from "@/schemas/whatsapp/whatsapp";

export const whatsAppApi = {
  getSettings: async (
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ): Promise<WhatsAppSettingsResponse> => {
    try {
      return await apiCall("/whatsapp/settings", {
        requireAuth,
        ...options,
        headers: { ...(options.headers || {}), ...headers },
      });
    } catch (error) {
      throw new Error(
        `Failed to fetch WhatsApp settings: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
  getAssistants: async (
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ): Promise<WhatsAppSettingsResponse> => {
    try {
      return await apiCall("/whatsapp/assistants", {
        requireAuth,
        ...options,
        headers: { ...(options.headers || {}), ...headers },
      });
    } catch (error) {
      throw new Error(
        `Failed to fetch Assistants: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  getSettingById: async (
    settingsId: string,
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ): Promise<WhatsAppSettingResponse> => {
    if (!settingsId?.trim()) {
      throw new Error("Settings ID is required");
    }

    try {
      return await apiCall(`/whatsapp/settings/${settingsId}`, {
        requireAuth,
        ...options,
        headers: { ...(options.headers || {}), ...headers },
      });
    } catch (error) {
      throw new Error(
        `Failed to fetch WhatsApp setting: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  createSetting: async (
    settingData: CreateWhatsAppSettingPayload,
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ): Promise<WhatsAppSetting> => {
    if (!settingData.name?.trim()) {
      throw new Error("Setting name is required");
    }
    if (!settingData.assistantId?.trim()) {
      throw new Error("Assistant ID is required");
    }

    try {
      return await apiCall("/whatsapp/settings", {
        method: "POST",
        body: settingData,
        requireAuth,
        ...options,
        headers: { ...(options.headers || {}), ...headers },
      });
    } catch (error) {
      throw new Error(
        `Failed to create WhatsApp setting: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  updateSetting: async (
    settingsId: string,
    settingData: UpdateWhatsAppSettingPayload,
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ): Promise<WhatsAppSetting> => {
    if (!settingsId?.trim()) {
      throw new Error("Settings ID is required");
    }
    if (!settingData || Object.keys(settingData).length === 0) {
      throw new Error("At least one field must be provided for update");
    }

    try {
      return await apiCall(`/whatsapp/settings/${settingsId}`, {
        method: "PUT",
        body: settingData,
        requireAuth,
        ...options,
        headers: { ...(options.headers || {}), ...headers },
      });
    } catch (error) {
      throw new Error(
        `Failed to update WhatsApp setting: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  deleteSetting: async (
    settingsId: string,
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ): Promise<WhatsAppDeleteResponse> => {
    if (!settingsId?.trim()) {
      throw new Error("Settings ID is required");
    }

    try {
      return await apiCall(`/whatsapp/settings/${settingsId}`, {
        method: "DELETE",
        requireAuth,
        ...options,
        headers: { ...(options.headers || {}), ...headers },
      });
    } catch (error) {
      throw new Error(
        `Failed to delete WhatsApp setting: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  connect: async (
    settingsId: string,
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ): Promise<WhatsAppConnectionResponse> => {
    if (!settingsId?.trim()) {
      throw new Error("Settings ID is required");
    }

    try {
      return await apiCall(`/whatsapp/settings/${settingsId}/connect`, {
        method: "POST",
        requireAuth,
        ...options,
        headers: { ...(options.headers || {}), ...headers },
      });
    } catch (error) {
      throw new Error(
        `Failed to connect WhatsApp: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  disconnect: async (
    settingsId: string,
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ): Promise<WhatsAppConnectionResponse> => {
    if (!settingsId?.trim()) {
      throw new Error("Settings ID is required");
    }

    try {
      return await apiCall(`/whatsapp/settings/${settingsId}/disconnect`, {
        method: "POST",
        requireAuth,
        ...options,
        headers: { ...(options.headers || {}), ...headers },
      });
    } catch (error) {
      throw new Error(
        `Failed to disconnect WhatsApp: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  restart: async (
    settingsId: string,
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ): Promise<WhatsAppConnectionResponse> => {
    if (!settingsId?.trim()) {
      throw new Error("Settings ID is required");
    }

    try {
      return await apiCall(`/whatsapp/settings/${settingsId}/restart`, {
        method: "POST",
        requireAuth,
        ...options,
        headers: { ...(options.headers || {}), ...headers },
      });
    } catch (error) {
      throw new Error(
        `Failed to restart WhatsApp: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  getStatus: async (
    settingsId: string,
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ): Promise<WhatsAppStatusResponse> => {
    if (!settingsId?.trim()) {
      throw new Error("Settings ID is required");
    }

    try {
      return await apiCall(`/whatsapp/settings/${settingsId}/status`, {
        requireAuth,
        ...options,
        headers: { ...(options.headers || {}), ...headers },
      });
    } catch (error) {
      throw new Error(
        `Failed to get WhatsApp status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  isConnected: async (settingsId: string): Promise<boolean> => {
    try {
      const status = await whatsAppApi.getStatus(settingsId);
      return status.status === "CONNECTED";
    } catch {
      return false;
    }
  },

  waitForConnection: async (
    settingsId: string,
    options: WhatsAppConnectionWaitOptions = {}
  ): Promise<WhatsAppStatusResponse> => {
    const { maxAttempts = 30, intervalMs = 1000 } = options;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const status = await whatsAppApi.getStatus(settingsId);

        if (status.status === "CONNECTED") {
          return status;
        }

        if (status.status === "ERROR") {
          throw new Error("WhatsApp connection failed");
        }

        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, intervalMs));
        }
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }

    throw new Error(
      "Connection timeout: WhatsApp failed to connect within the specified time"
    );
  },

  getQRCode: async (settingsId: string): Promise<string | null> => {
    try {
      const status = await whatsAppApi.getStatus(settingsId);
      return status.qrCode || null;
    } catch {
      return null;
    }
  },

  refreshQRCode: async (settingsId: string): Promise<string | null> => {
    try {
      const connection = await whatsAppApi.connect(settingsId);
      return connection.qrCode || null;
    } catch {
      return null;
    }
  },

  getHistory: async (
    params: GetHistoryParams = {},
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ): Promise<WhatsAppHistoryResponse> => {
    try {
      const queryParams = new URLSearchParams();
      for (const key in params) {
        const value = params[key as keyof GetHistoryParams];
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      }

      const queryString = queryParams.toString();
      const url = `/whatsapp/chat/history${
        queryString ? `?${queryString}` : ""
      }`;

      return await apiCall(url, {
        requireAuth,
        ...options,
        headers: { ...(options.headers || {}), ...headers },
      });
    } catch (error) {
      throw new Error(
        `Failed to fetch WhatsApp history: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  getConversationMessages: async (
    chatRoomId: string,
    params: { limit?: number; offset?: number } = {},
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ): Promise<GetConversationMessagesResponse> => {
    if (!chatRoomId?.trim()) {
      throw new Error("Chat room ID is required");
    }

    try {
      const queryParams = new URLSearchParams();
      if (params.limit !== undefined) {
        queryParams.append("limit", String(params.limit));
      }
      if (params.offset !== undefined) {
        queryParams.append("offset", String(params.offset));
      }

      const queryString = queryParams.toString();
      const url = `/whatsapp/chat/${chatRoomId}/messages${
        queryString ? `?${queryString}` : ""
      }`;

      return await apiCall(url, {
        requireAuth,
        ...options,
        headers: { ...(options.headers || {}), ...headers },
      });
    } catch (error) {
      throw new Error(
        `Failed to fetch conversation messages: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  handleToggleAutoReply: async (
    chatRoomId: string,
    autoReply: boolean,
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ): Promise<{
    success: boolean;
    data?: {
      chatRoomId: string;
      autoReply: boolean;
      handlerId: string;
    };
    message: string;
  }> => {
    if (!chatRoomId?.trim()) {
      throw new Error("Chat room ID is required");
    }
    if (typeof autoReply !== "boolean") {
      throw new Error("Auto reply value must be a boolean");
    }

    try {
      return await apiCall(`/whatsapp/chat/${chatRoomId}/auto-reply`, {
        method: "PUT",
        body: {
          chatRoomId,
          autoReply,
        },
        requireAuth,
        ...options,
        headers: { ...(options.headers || {}), ...headers },
      });
    } catch (error) {
      throw new Error(
        `Failed to toggle auto-reply: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },

  handleReply: async (
    chatRoomId: string,
    message: string,
    metadata?: {
      agentName?: string;
      department?: string;
      [key: string]: unknown;
    },
    requireAuth = true,
    options: ApiOptions = {},
    headers: Record<string, string> = {}
  ): Promise<{
    success: boolean;
    data?: {
      messageId: string;
      timestamp: string;
      chatRoomId: string;
    };
    message: string;
  }> => {
    if (!chatRoomId?.trim()) {
      throw new Error("Chat room ID is required");
    }
    if (!message?.trim()) {
      throw new Error("Message content is required");
    }

    try {
      const requestBody: {
        chatRoomId: string;
        message: string;
        metadata?: typeof metadata;
      } = {
        chatRoomId,
        message,
      };

      if (metadata && Object.keys(metadata).length > 0) {
        requestBody.metadata = metadata;
      }

      return await apiCall(`/whatsapp/chat/${chatRoomId}/reply`, {
        method: "POST",
        body: requestBody,
        requireAuth,
        ...options,
        headers: { ...(options.headers || {}), ...headers },
      });
    } catch (error) {
      throw new Error(
        `Failed to send manual reply: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
};
