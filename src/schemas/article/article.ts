import { z } from "zod";

// Category schema
export const articleCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Article schema
export const articleSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  userId: z.string(),
  categoryId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  category: articleCategorySchema,
});

export type ArticleCategory = z.infer<typeof articleCategorySchema>;
export type Article = z.infer<typeof articleSchema>;