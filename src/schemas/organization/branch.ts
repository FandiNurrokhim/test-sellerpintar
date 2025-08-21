import { z } from "zod";

export const branchSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Branch name is required."),
  organizationId: z.string().min(1, "Organization ID is required."),
  branchCode: z.string().optional(),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }).optional(),
  createdBy: z.string().min(1, "Created By is required."),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Branch = {
  id: string;
  name: string;
  organizationId: string;
  createdBy: string;
  branchCode?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type BranchFormValues = z.infer<typeof branchSchema>;