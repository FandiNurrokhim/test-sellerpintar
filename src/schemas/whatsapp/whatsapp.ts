import { z } from "zod";

export const whatsappDetailsSchema = z.object({
  name: z.string(),
  description: z.string(),
  model: z.string(),
  instructions: z.string(),
  temperature: z.number(),
  hasSalesCapabilities: z.boolean().optional(),
});

export const createWhatsAppSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  instructions: z.string().min(1, "Instructions are required"),
  temperature: z.number(),
  hasSalesCapabilities: z.boolean().optional(),
  assistantDocumentStores: z.array(z.string()).optional(),
});

export type CreateAssistantInput = z.infer<typeof createWhatsAppSchema>;
export type CreateAssistantFormValues = CreateAssistantInput;

export const WhatsAppSchema = createWhatsAppSchema.extend({
  id: z.string(),
  flowiseId: z.string().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  details: whatsappDetailsSchema.optional(),
});

export type WhatsApp = z.infer<typeof WhatsAppSchema>;

export const MessageMetadataSchema = z
  .object({
    manualReply: z.boolean().optional(),
    agentName: z.string().optional(),
    department: z.string().optional(),
    contactName: z.string().optional(),
    contactNumber: z.string().optional(),
  })
  .passthrough();

export const MessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.string(),
  handlerId: z.string().optional(),
  metadata: MessageMetadataSchema.optional(),
});

export const ApiMessageSchema = z.object({
  role: z.string(),
  content: z.string(),
  timestamp: z.string(),
  handlerId: z.string(),
  metadata: z
    .object({
      contactName: z.string().optional(),
      contactNumber: z.string().optional(),
      manualReply: z.boolean().optional(),
    })
    .passthrough()
    .optional(),
  attachment: z.any().optional(),
});

export const ConversationSchema = z.object({
  id: z.string(),
  sessionId: z.string().optional(),
  contactNumber: z.string(),
  contactName: z.string().optional(),
  conversationId: z.string().optional(),
  assistantId: z.string().optional(),
  autoReply: z.boolean().optional(),
  isActive: z.boolean().optional(),
  messageCount: z.number().optional(),
  lastActive: z.string().optional(),
  lastMessageAt: z.string().optional(),
  handlerId: z.string().optional(),
  lastMessage: MessageSchema.optional(),
});

export const ApiChatRoomSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  contactNumber: z.string(),
  contactName: z.string(),
  conversationId: z.string(),
  assistantId: z.string(),
  autoReply: z.boolean(),
  isActive: z.boolean(),
  lastActive: z.string(),
  lastMessageAt: z.string(),
  handlerId: z.string(),
  messageCount: z.number(),
});

export const PaginationSchema = z.object({
  limit: z.number(),
  offset: z.number(),
  hasMore: z.boolean(),
});

export const GetHistoryResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    chatRooms: z.array(ConversationSchema),
    totalCount: z.number(),
    pagination: PaginationSchema,
  }),
});

export const GetConversationMessagesResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    chatRoom: ApiChatRoomSchema,
    messages: z.array(ApiMessageSchema),
    totalMessages: z.number(),
    pagination: PaginationSchema,
  }),
});

export const GetConversationMessagesLegacyResponseSchema = z.object({
  chatRoom: ConversationSchema,
  messages: z.array(MessageSchema),
  totalMessages: z.number(),
  pagination: PaginationSchema,
});

export const ToggleAutoReplyRequestSchema = z.object({
  chatRoomId: z.string(),
  autoReply: z.boolean(),
});

export const ToggleAutoReplyResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      chatRoomId: z.string(),
      autoReply: z.boolean(),
      handlerId: z.string(),
    })
    .optional(),
  message: z.string(),
});

export const ManualReplyRequestSchema = z.object({
  chatRoomId: z.string(),
  message: z.string().min(1, "Message content is required"),
  metadata: z
    .object({
      agentName: z.string().optional(),
      department: z.string().optional(),
    })
    .passthrough()
    .optional(),
});

export const ManualReplyResponseSchema = z.object({
  success: z.boolean(),
  data: z
    .object({
      messageId: z.string(),
      timestamp: z.string(),
      chatRoomId: z.string(),
    })
    .optional(),
  message: z.string(),
});

export const GetConversationMessagesParamsSchema = z.object({
  limit: z.number().positive().optional(),
  offset: z.number().min(0).optional(),
});

export const WhatsAppSettingSchema = z.object({
  id: z.string(),
  name: z.string(),
  assistantId: z.string(),
  isActive: z.boolean(),
  status: z.enum(["CONNECTED", "DISCONNECTED", "CONNECTING", "ERROR"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  qrCode: z.string().optional(),
});

export const CreateWhatsAppSettingPayloadSchema = z.object({
  name: z.string().min(1, "Name is required"),
  assistantId: z.string().min(1, "Assistant ID is required"),
});

export const UpdateWhatsAppSettingPayloadSchema = z
  .object({
    name: z.string().optional(),
    assistantId: z.string().optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided for update"
  );

export const WhatsAppSettingsResponseSchema = z.object({
  settings: z.array(WhatsAppSettingSchema),
  totalCount: z.number(),
});

export const WhatsAppSettingResponseSchema = z.object({
  setting: WhatsAppSettingSchema,
});

export const WhatsAppConnectionResponseSchema = z.object({
  success: z.boolean(),
  status: z.string(),
  qrCode: z.string().optional(),
  message: z.string().optional(),
});

export const WhatsAppStatusResponseSchema = z.object({
  status: z.enum(["CONNECTED", "DISCONNECTED", "CONNECTING", "ERROR"]),
  qrCode: z.string().optional(),
  lastConnected: z.string().optional(),
  error: z.string().optional(),
});

export const WhatsAppDeleteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const WhatsAppHistoryResponseSchema = z.object({
  conversations: z.array(ConversationSchema),
  totalCount: z.number(),
  pagination: PaginationSchema,
});

export const WhatsAppConnectionWaitOptionsSchema = z.object({
  maxAttempts: z.number().positive().optional(),
  intervalMs: z.number().positive().optional(),
});

export const GetHistoryParamsSchema = z.object({
  limit: z.number().positive().optional(),
  offset: z.number().min(0).optional(),
  settingsId: z.string().optional(),
  status: z.enum(["active", "archived"]).optional(),
  search: z.string().optional(),
});

export type Message = z.infer<typeof MessageSchema>;
export type ApiMessage = z.infer<typeof ApiMessageSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type ApiChatRoom = z.infer<typeof ApiChatRoomSchema>;
export type GetHistoryResponse = z.infer<typeof GetHistoryResponseSchema>;
export type GetConversationMessagesResponse = z.infer<
  typeof GetConversationMessagesResponseSchema
>;
export type GetConversationMessagesLegacyResponse = z.infer<
  typeof GetConversationMessagesLegacyResponseSchema
>;
export type ToggleAutoReplyRequest = z.infer<
  typeof ToggleAutoReplyRequestSchema
>;
export type ToggleAutoReplyResponse = z.infer<
  typeof ToggleAutoReplyResponseSchema
>;
export type ManualReplyRequest = z.infer<typeof ManualReplyRequestSchema>;
export type ManualReplyResponse = z.infer<typeof ManualReplyResponseSchema>;
export type GetConversationMessagesParams = z.infer<
  typeof GetConversationMessagesParamsSchema
>;
export type WhatsAppSetting = z.infer<typeof WhatsAppSettingSchema>;
export type CreateWhatsAppSettingPayload = z.infer<
  typeof CreateWhatsAppSettingPayloadSchema
>;
export type UpdateWhatsAppSettingPayload = z.infer<
  typeof UpdateWhatsAppSettingPayloadSchema
>;
export type WhatsAppSettingsResponse = z.infer<
  typeof WhatsAppSettingsResponseSchema
>;
export type WhatsAppSettingResponse = z.infer<
  typeof WhatsAppSettingResponseSchema
>;
export type WhatsAppConnectionResponse = z.infer<
  typeof WhatsAppConnectionResponseSchema
>;
export type WhatsAppStatusResponse = z.infer<
  typeof WhatsAppStatusResponseSchema
>;
export type WhatsAppDeleteResponse = z.infer<
  typeof WhatsAppDeleteResponseSchema
>;
export type WhatsAppHistoryResponse = z.infer<
  typeof WhatsAppHistoryResponseSchema
>;
export type WhatsAppConnectionWaitOptions = z.infer<
  typeof WhatsAppConnectionWaitOptionsSchema
>;
export type GetHistoryParams = z.infer<typeof GetHistoryParamsSchema>;

export interface ConversationInternal extends Conversation {
  userId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  assistantId: string;
  type: "whatsapp";
  unreadCount: number;
  summary: string;
  isArchived: boolean;
}

export interface PlaygroundMessage {
  id: string;
  conversationId: string;
  userId: string;
  content: string;
  type: "user" | "assistant";
  createdAt: string;
  organizationId: string;
  branchId: string;
  metadata: {
    source: string;
    platform: string;
    [key: string]: unknown;
  };
}

export interface MessageRequest {
  conversationId: string;
  message: string;
  isNewConversation: boolean;
  metadata: {
    source: string;
    platform: string;
  };
  createdAt?: string;
}

export interface GetAssistantResponse {
  status: string;
  code: number;
  message: string;
  data: {
    assistants: WhatsApp[];
  };
}

export interface GetConversationsResponse {
  status: string;
  code: number;
  message: string;
  data: {
    conversations: Conversation[];
  };
  meta: {
    pagination: {
      totalItems: number;
      currentPage: number;
      perPage: number;
      totalPages: number;
    };
  };
}

export const assistantsSchema = z.array(WhatsAppSchema);
export type WhatsApps = WhatsApp[];
