import { apiCall, ApiOptions } from "@/utils/api";

interface Plan {
  id: string;
  name: string;
  maxBranch: number;
  maxMessage: number;
  price: number;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SubscriptionPayload {
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  description: string;
}

interface Subscription {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T;
}

interface PlansData {
  plans: Plan[];
}

interface PlanData {
  plan: Plan;
}

export const plansApi = {
  getPlans: (requireAuth = true, options: ApiOptions = {}) =>
    apiCall<ApiResponse<PlansData>>("/organizations/plans", {
      requireAuth,
      ...options,
    }),

  getPlanById: (planId: string, requireAuth = true, options: ApiOptions = {}) =>
    apiCall<ApiResponse<PlanData>>(`/organizations/plans/${planId}`, {
      requireAuth,
      ...options,
    }),

  createSubscription: (
    subscriptionData: SubscriptionPayload,
    requireAuth = true,
    options: ApiOptions = {}
  ) =>
    apiCall<ApiResponse<Subscription>>("/organizations/payments/subscription", {
      method: "POST",
      body: subscriptionData,
      requireAuth,
      ...options,
    }),
};

export type {
  Plan,
  SubscriptionPayload,
  Subscription,
  PlansData,
  PlanData,
  ApiResponse,
};
