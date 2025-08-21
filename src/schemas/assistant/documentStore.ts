import { z } from "zod";

// Document Store Schema
export const assistantDocumentStoreSchema = z.object({
  id: z.string(),
  flowiseId: z.string(),
  name: z.string(),
  description: z.string(),
  organizationId: z.string(),
  branchId: z.string(),
  userId: z.string(),
  status: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export interface AssistantDocumentStore {
  id: string;
  flowiseId: string;
  name: string;
  description: string;
  organizationId: string;
  branchId: string;
  userId: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export const assistantDocumentSchema = z.object({
  id: z.string(),
  flowiseId: z.string(),
  name: z.string(),
  description: z.string(),
  organizationId: z.string(),
  branchId: z.string(),
  userId: z.string(),
  status: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type AssistantDocument = {
  id: string;
  flowiseId: string;
  name: string;
  description: string;
  url: string;
  organizationId: string;
  branchId: string;
  userId: string;
  status: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};


export const documentStoreFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  files: z.any().optional(),
  url: z.string().url("Invalid URL format").optional(),
});
export type DocumentStoreFormValues = z.infer<typeof documentStoreFormSchema>;

// Document File Loader Config Schema
const loaderConfigSchema = z.object({
  pdfFile: z.string().optional(),
  textSplitter: z.string().optional(),
  usage: z.string().optional(),
  legacyBuild: z.string().optional(),
  metadata: z.string().optional(),
  omitMetadataKeys: z.string().optional(),
});

// Document File Splitter Config Schema
const splitterConfigSchema = z.object({
  chunkSize: z.number().optional(),
  chunkOverlap: z.number().optional(),
  separator: z.string().optional(),
});

// Document File Schema (single file detail)
export const assistantDocumentFileSchema = z.object({
  id: z.string(),
  documentStoreId: z.string(),
  flowiseDocumentStoreId: z.string(),
  source: z.string(),
  loaderId: z.string(),
  loaderName: z.string(),
  loaderConfig: loaderConfigSchema,
  splitterId: z.string(),
  splitterName: z.string(),
  splitterConfig: splitterConfigSchema,
  totalChunks: z.number(),
  totalChars: z.number(),
  status: z.string(),
  organizationId: z.string(),
  branchId: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  metadata: z.record(z.any()),
});
export type AssistantDocumentFile = z.infer<typeof assistantDocumentFileSchema>;

// Response schema for document files upload (multiple files)
export const assistantDocumentFilesUploadResponseSchema = z.object({
  id: z.string(),
  status: z.string(),
  message: z.string(),
  numAdded: z.number(),
  numSkipped: z.number(),
  numDeleted: z.number(),
  files: z.array(assistantDocumentFileSchema),
});
export type AssistantDocumentFilesUploadResponse = z.infer<
  typeof assistantDocumentFilesUploadResponseSchema
>;

// Response schema for single document file (detail)
export const assistantDocumentFileResponseSchema = assistantDocumentFileSchema;
export type AssistantDocumentFileResponse = z.infer<
  typeof assistantDocumentFileResponseSchema
>;

export interface GetAssistantDocumentStoresResponse {
  status: string;
  code: number;
  message: string;
  data: {
    documentStores: AssistantDocumentStore[];
  };
}

export interface GetAssistantDocumentFilesResponse {
  status: string;
  code: number;
  message: string;
  data: {
    files: AssistantDocumentFile[];
    total: number;
  };
}
