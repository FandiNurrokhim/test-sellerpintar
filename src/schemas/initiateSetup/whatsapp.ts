import { z } from "zod";

export const whatsAppConfigSchema = z.object({
  name: z.string().min(1, "Name is required"),
  ai: z.string().min(1, "AI selection is required"),
  description: z.string().optional(),
  instruction: z.string().optional(),
  temperature: z.number().optional(),
  top_p: z.number().optional(),
});

export type WhatsAppFormData = z.infer<typeof whatsAppConfigSchema>;
