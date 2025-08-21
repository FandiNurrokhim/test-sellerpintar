import { z } from "zod";

export const planSelectionSchema = z.object({
  selectedPlanId: z.string().min(1, "Pilih salah satu plan terlebih dahulu."),
});

export const planSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Plan name is required."),
  code: z.string().min(1, "Plan code is required."),
  price: z.number().min(0, "Price must be a positive number."),
  maxBranch: z
    .number()
    .min(-1, "Max branch must be -1 (unlimited) or positive number."),
  maxMessage: z
    .number()
    .min(-1, "Max message must be -1 (unlimited) or positive number."),
  isActive: z.boolean(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
});

export const subscriptionSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  planId: z.string().min(1, "Plan ID is required."),
  amount: z.number().min(0, "Amount must be a positive number."),
  currency: z.string().min(1, "Currency is required."),
  paymentMethod: z.string().min(1, "Payment method is required."),
  description: z.string().min(1, "Description is required."),
});

export type Plan = z.infer<typeof planSchema>;
export type PlanSelectionFormData = z.infer<typeof planSelectionSchema>;
export type SubscriptionData = z.infer<typeof subscriptionSchema>;

export type PlansResponse = {
  message: string;
  data: {
    plans: Plan[];
  };
};

export type SubscriptionResponse = {
  message: string;
  data: {
    id: string;
    userId: string;
    planId: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    description: string;
    createdAt: string;
    updatedAt: string;
  };
};

export type UserProfile = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
};
