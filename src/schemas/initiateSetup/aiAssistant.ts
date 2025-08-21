import { z } from "zod";

export const aiConfigSchema = z.object({
  name: z.string().min(1, "AI Name is required"),
  description: z.string().min(1, "AI Description is required"),
  instruction: z.string().min(1, "AI Instruction is required"),
  temperature: z.number().min(0).max(100),
  top_p: z.number().min(0).max(100),
});

export type AssistantDocumentStore = {
  id: string;
  name: string;
  description: string;
  returnSourceDocuments: boolean;
};

export type AiConfigDetails = {
  name: string;
  description: string;
  model: string;
  instructions: string;
  temperature: number;
  top_p: number;
  tools: string[];
  tool_resources: Record<string, unknown>;
};

export type AiConfigResponse = {
  id: string;
  flowiseId: string;
  name: string;
  description: string;
  details: AiConfigDetails;
  isActive: boolean;
  assistantDocumentStores: AssistantDocumentStore[];
  createdAt: string;
  updatedAt: string;
};

export type AiConfigApiResponse = {
  data: AiConfigResponse;
};

export type AiConfigFormData = z.infer<typeof aiConfigSchema>;