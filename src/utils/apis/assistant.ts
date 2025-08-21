import { apiCall, ApiOptions } from "@/utils/api";
import {
  Assistant,
  GetAssistantResponse,
  PlaygroundMessage,
  GetConversationsResponse,
} from "@/schemas/assistant/assistant";
import {
  AssistantDocumentStore,
  GetAssistantDocumentFilesResponse,
  GetAssistantDocumentStoresResponse,
} from "@/schemas/assistant/documentStore";

interface ApiResponse<T> {
  data: T;
}

export const assistantApi = {
  getAssistants: (requireAuth = true, options: ApiOptions = {}) =>
    apiCall<GetAssistantResponse>(`/assistant`, {
      requireAuth,
      ...options,
    }),

  getById: (id: string, requireAuth = true, options: ApiOptions = {}) =>
    apiCall(`/assistant/${id}`, {
      requireAuth,
      ...options,
    }),

  getAssistantById: (
    assistantId: string,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<ApiResponse<Assistant>>(`/assistant/${assistantId}`, {
      requireAuth,
      ...options,
    }),

  createAssistant: (
    assistantData: Record<string, unknown>,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<ApiResponse<Assistant>>(`/assistant`, {
      method: "POST",
      body: assistantData,
      requireAuth,
      ...options,
    }),

  updateAssistant: (
    assistantId: string,
    assistantData: Record<string, unknown>,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<ApiResponse<Assistant>>(`/assistant/${assistantId}`, {
      method: "PUT",
      body: assistantData,
      requireAuth,
      ...options,
    }),

  deleteAssistant: (
    assistantId: string,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<ApiResponse<{ message: string }>>(`/assistant/${assistantId}`, {
      method: "DELETE",
      requireAuth,
      ...options,
    }),

  getConversations: (requireAuth = true, options: ApiOptions = {}) =>
    apiCall<GetConversationsResponse>(`/assistant/conversations`, {
      requireAuth,
      ...options,
    }),

  getConversationByAssistant: (
    assistantId: string,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<GetConversationsResponse>(
      `/assistant/assistants/${assistantId}/conversations`,
      {
        requireAuth,
        ...options,
      }
    ),

  getConversationHistory: (
    conversationId: string,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<ApiResponse<{ messages: PlaygroundMessage[] }>>(
      `/assistant/conversations/${conversationId}/history`,
      {
        requireAuth,
        ...options,
      }
    ),

  replyAsAssistant: (
    conversationId: string,
    message: string,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<
      ApiResponse<{
        conversationId: string;
        message: string;
        metadata: { source: string; platform: string };
        createdAt: string;
      }>
    >(`/assistant/conversations/${conversationId}/reply-as-assistant`, {
      method: "POST",
      body: { message },
      requireAuth,
      ...options,
    }),

  sendMessage: (
    messageData: {
      assistantId: string;
      conversationId?: string;
      message: string;
    },
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<
      ApiResponse<{
        conversationId: string;
        message: string;
        isNewConversation: boolean;
        metadata: { source: string; platform: string };
        createdAt: string;
      }>
    >(`/assistant/messages`, {
      method: "POST",
      body: messageData,
      requireAuth,
      ...options,
    }),

  // ====================================
  // Documents
  // ====================================
  getAssistantsDocuments: (requireAuth = true, options: ApiOptions = {}) =>
    apiCall<GetAssistantDocumentStoresResponse>(`/assistant/document-stores`, {
      requireAuth,
      ...options,
    }),

  getAssistantDocumentStoreById: (
    documentStoreId: string,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<ApiResponse<AssistantDocumentStore>>(
      `/assistant/document-stores/${documentStoreId}`,
      {
        requireAuth,
        ...options,
      }
    ),

  createAssistantDocument: (
    storeData: Record<string, unknown>,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<ApiResponse<AssistantDocumentStore>>(`/assistant/document-stores`, {
      method: "POST",
      body: storeData,
      requireAuth,
      ...options,
    }),

  updateAssistantDocument: (
    id: string,
    storeData: Record<string, unknown>,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<ApiResponse<AssistantDocumentStore>>(
      `/assistant/document-stores/${id}`,
      {
        method: "PUT",
        body: storeData,
        requireAuth,
        ...options,
      }
    ),

  deleteAssistantDocument: (
    id: string,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<ApiResponse<AssistantDocumentStore>>(
      `/assistant/document-stores/${id}`,
      {
        method: "DELETE",
        requireAuth,
        ...options,
      }
    ),

  // ====================================
  // Files
  // ====================================
  getAssistantDocumentFiles: (
    documentStoreId: string,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<GetAssistantDocumentFilesResponse>(
      `/assistant/document-stores/${documentStoreId}/files`,
      {
        method: "GET",
        requireAuth,
        ...options,
      }
    ),

  createAssistantDocumentFiles: (
    documentStoreId: string,
    storeData: FormData,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<ApiResponse<AssistantDocumentStore>>(
      `/assistant/document-stores/${documentStoreId}/files`,
      {
        method: "POST",
        body: storeData,
        requireAuth,
        ...options,
      }
    ),

  updateAssistantDocumentFiles: (
    documentStoreId: string,
    storeData: FormData,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<ApiResponse<AssistantDocumentStore>>(
      `/assistant/document-files/${documentStoreId}`,
      {
        method: "PUT",
        body: storeData,
        requireAuth,
        ...options,
      }
    ),

  deleteAssistantDocumentFiles: (
    documentFileId: string,
    storeData: FormData,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<ApiResponse<AssistantDocumentStore>>(
      `/assistant/document-files/${documentFileId}`,
      {
        method: "DELETE",
        body: storeData,
        requireAuth,
        ...options,
      }
    ),
};
