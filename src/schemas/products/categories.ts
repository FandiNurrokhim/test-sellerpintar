import { z } from "zod";

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Category name is required"),
  sequence: z.coerce.number().int().nonnegative().optional(),
  active: z.boolean().default(true),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
