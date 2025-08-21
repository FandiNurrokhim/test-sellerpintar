"use client";

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useBranch } from "@/context/BranchContext";
import { z } from "zod";
import { CardPlan } from "@/components/organisms/CardPlan";
import { businessApi } from "@/utils/apis/business";
import { plansApi } from "@/utils/apis/plans";
import { useToast } from "@/components/atoms/ToastProvider";

import {
  Plan,
  UserProfile,
  planSelectionSchema,
  subscriptionSchema,
  PlanSelectionFormData,
  SubscriptionData,
  planSchema,
} from "@/schemas/initiateSetup/plan";

export interface PlanPageRef {
  submitForm: () => Promise<boolean>;
  isLoading: boolean;
  selectedPlan: Plan | null;
}

interface PlanPageProps {
  onSubmitSuccess?: () => void;
}

export const PlanPage = forwardRef<PlanPageRef, PlanPageProps>(
  ({ onSubmitSuccess }, ref) => {
    const { showToast } = useToast();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [selectedPlanId, setSelectedPlanId] = useState<string>("");
    const { branchId } = useBranch();
    const selectedPlan = plans.find((p) => p.id === selectedPlanId) || null;

    useEffect(() => {
      const fetchData = async () => {
        try {
          setIsLoading(true);

          const [plansResponse, profileResponse] = await Promise.all([
            plansApi.getPlans(),
            businessApi.getUserProfile(),
          ]);

          const activePlans = plansResponse.data.plans
            .filter((plan) => plan.isActive)
            .map((plan) => {
              try {
                return planSchema.parse(plan);
              } catch (error) {
                console.warn("Invalid plan data:", plan, error);
                return null;
              }
            })
            .filter((plan): plan is Plan => plan !== null);

          setPlans(activePlans);
          setUserProfile(profileResponse.data);
        } catch (error) {
          console.error("Error fetching data:", error);
          showToast(
            error instanceof Error ? error.message : "Failed to load plans",
            "error"
          );
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }, [branchId, showToast]);

    const validatePlanSelection = (data: PlanSelectionFormData): boolean => {
      try {
        planSelectionSchema.parse(data);
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors = error.errors.map((err) => err.message);
          errors.forEach((errorMessage) => {
            showToast(errorMessage, "error");
          });
        }
        return false;
      }
    };

    const validateSubscriptionData = (data: SubscriptionData): boolean => {
      try {
        subscriptionSchema.parse(data);
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors = error.errors.map((err) => err.message);
          errors.forEach((errorMessage) => {
            showToast(errorMessage, "error");
          });
        }
        return false;
      }
    };

    const formatPrice = (price: number): string => {
      if (price === 0) {
        return "Gratis";
      }
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(price);
    };

    const getFeatures = (plan: Plan): string[] => {
      const features = [
        `${plan.maxBranch === -1 ? "Unlimited" : plan.maxBranch} ${
          plan.maxBranch === 1 ? "Lokasi" : "Lokasi"
        }`,
        `${
          plan.maxMessage === -1
            ? "Unlimited"
            : plan.maxMessage.toLocaleString("id-ID")
        } Pesan`,
      ];

      if (plan.code === "BASIC") {
        features.push("Support Email", "Dashboard Dasar", "Analytics");
      } else if (plan.code === "PRO") {
        features.push(
          "Support WhatsApp",
          "Dashboard Lengkap",
          "Prioritas Support"
        );
      } else if (plan.code === "ENTERPRISE") {
        features.push("Support Prioritas", "Integrasi API", "Custom Features");
      }

      return features;
    };

    const handleSubmit = async (): Promise<boolean> => {
      const selectionData: PlanSelectionFormData = { selectedPlanId };
      if (!validatePlanSelection(selectionData)) {
        return false;
      }

      if (!userProfile) {
        showToast("User profile tidak ditemukan.", "error");
        return false;
      }

      const selectedPlan = plans.find((p) => p.id === selectedPlanId);
      if (!selectedPlan) {
        showToast("Plan yang dipilih tidak ditemukan.", "error");
        return false;
      }

      if (selectedPlan.price === 0) {
        showToast("Plan gratis berhasil dipilih!", "success");
        onSubmitSuccess?.();
        return true;
      }

      try {
        setIsSubmitting(true);

        const subscriptionPayload: SubscriptionData = {
          userId: userProfile.userId,
          planId: selectedPlan.id,
          amount: selectedPlan.price,
          currency: "IDR",
          paymentMethod: "bank_transfer",
          description: `Upgrade to ${selectedPlan.name} plan`,
        };

        if (!validateSubscriptionData(subscriptionPayload)) {
          return false;
        }

        const response = await plansApi.createSubscription(subscriptionPayload);

        showToast(
          "Subscription berhasil dibuat! Status: " + response.data.status,
          "success"
        );
        onSubmitSuccess?.();
        return true;
      } catch (error) {
        console.error("Error creating subscription:", error);
        showToast(
          error instanceof Error ? error.message : "Gagal membuat subscription",
          "error"
        );
        return false;
      } finally {
        setIsSubmitting(false);
      }
    };

    useImperativeHandle(ref, () => ({
      submitForm: handleSubmit,
      isLoading: isLoading || isSubmitting,
      selectedPlan,
    }));

    if (isLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading plans...</p>
          </div>
        </div>
      );
    }

    if (plans.length === 0) {
      return (
        <div className="text-center p-8">
          <p className="text-gray-500">
            Tidak ada plan yang tersedia saat ini.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-6">
          {plans.map((plan) => (
            <CardPlan
              key={plan.id}
              title={plan.name}
              price={formatPrice(plan.price)}
              duration={plan.price === 0 ? "" : "per bulan"}
              description={`Plan ${plan.name.toLowerCase()} untuk bisnis Anda`}
              isFeatured={plan.code === "BASIC"}
              details={getFeatures(plan)}
              checked={selectedPlanId === plan.id}
              onChange={() => {
                setSelectedPlanId(plan.id);
              }}
            />
          ))}
        </div>
      </div>
    );
  }
);

PlanPage.displayName = "PlanPage";
