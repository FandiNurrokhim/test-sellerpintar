import { z } from "zod";

export const assistantDetailsSchema = z.object({
  name: z.string(),
  description: z.string(),
  model: z.string(),
  instructions: z.string(),
  temperature: z.number(),
  hasSalesCapabilities: z.boolean().optional(),
});

export const createAssistantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  instructions: z.string().min(1, "Instructions are required"),
  temperature: z.number(),
  hasSalesCapabilities: z.boolean().optional(),
  assistantDocumentStores: z.array(z.string()).optional(),
});

export type CreateAssistantInput = z.infer<typeof createAssistantSchema>;
export type CreateAssistantFormValues = CreateAssistantInput;

export const assistantSchema = createAssistantSchema.extend({
  id: z.string(),
  flowiseId: z.string().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  details: assistantDetailsSchema.optional(),
});

export type Assistant = z.infer<typeof assistantSchema>;

export interface GetAssistantResponse {
  status: string;
  code: number;
  message: string;
  data: {
    assistants: Assistant[];
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

export const assistantsSchema = z.array(assistantSchema);
export type Assistants = Assistant[];

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

export interface Message {
  conversationId: string;
  message: string;
  isNewConversation: boolean;
  metadata: {
    source: string;
    platform: string;
  };
  createdAt?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  metadata: {
    source: string;
    [key: string]: unknown;
  };
  organizationId: string;
  branchId: string;
  isManualReply: boolean;
  chatflowId: string;
}
