import { z } from "zod";

export const roleSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Role name is required."),
  permissions: z
    .array(z.string().min(1))
    .min(1, "At least one permission is required."),
  organizationId: z.string().min(1, "Organization ID is required."),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Role = {
  id: string;
  name: string;
  permissions: string[];
  organizationId: string;
  createdAt: string;
  updatedAt: string;
};

export type BranchRole = {
  id: string;
  name: string;
  permissions: string[];
  branchId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
};

export type RoleFormValues = z.infer<typeof roleSchema>;
