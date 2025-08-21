import { z } from "zod";

export const signUpSchema = z
  .object({
    username: z.string().min(8, "Username must be at least 8 characters."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    role: z.enum(["user", "admin"], { errorMap: () => ({ message: "Role is required." }) }),
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;