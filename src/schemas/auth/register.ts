import { z } from "zod";

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .min(1, "Full name is required.")
      .refine((v) => v.trim().split(" ").length >= 2, {
        message: "Full name must contain at least two words.",
      }),
    email: z.string().email("Invalid email format."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
    agreedToTerms: z.boolean(),
    agreedToPrivacy: z.boolean(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;
