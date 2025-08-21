"use client";

import { useState, useEffect } from "react";
import { useBranch } from "@/context/BranchContext";
import { CardPlan } from "@/components/organisms/CardPlan";
import { plansApi, Plan } from "@/utils/apis/plans";
import { useToast } from "@/components/atoms/ToastProvider";

interface PaymentPageProps {
  planId?: string;
}

export function PaymentPage({ planId }: PaymentPageProps) {
  const { showToast } = useToast();
  const { branchId } = useBranch();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");

  useEffect(() => {
    setIsLoading(true);
    const fetchPlanData = async () => {
      if (!planId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await plansApi.getPlanById(planId);
        setSelectedPlan(response.data.plan);
        setSelectedPlanId(response.data.plan.id);
      } catch (error) {
        console.error("Error fetching plan data:", error);
        showToast("Failed to load plan data", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlanData();
  }, [branchId, planId, showToast]);

  useEffect(() => {
    console.log("isLoading changed:", isLoading);
  }, [isLoading]);

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
      `${plan.maxBranch === -1 ? "Unlimited" : plan.maxBranch} Lokasi`,
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

  const PLANS = selectedPlan || {
    id: "basic",
    name: "Starter",
    price: 99000,
    maxBranch: 1,
    maxMessage: 1000,
    code: "BASIC",
    isActive: true,
    createdAt: "",
    updatedAt: "",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading Payment Information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <CardPlan
        key={PLANS.id}
        title={PLANS.name}
        price={formatPrice(PLANS.price)}
        duration={PLANS.price === 0 ? "" : "per bulan"}
        description={`Paket ${PLANS.name.toLowerCase()} untuk bisnis kecil.`}
        isFeatured={PLANS.code === "PRO"}
        details={
          selectedPlan
            ? getFeatures(PLANS)
            : ["1 Lokasi", "Support Email", "Dashboard Dasar", "Analytics"]
        }
        checked={selectedPlanId === PLANS.id}
        onChange={() => setSelectedPlanId(PLANS.id)}
        isPreview={true}
      />
      <hr />

      <div className="grid grid-cols-7 gap-6">
        <div className="col-span-5 text-[#262626] dark:text-white/80">
          <h2 className="text-xl !text-[#151515] !font-sentient font-semibold mb-6">
            Information
          </h2>
          <div className="mb-4 ">
            <h1 className="text-sm leading-none font-light !font-sentient mb-2">
              Business Name
            </h1>
            <p className="text-xs leading-none font-medium !font-sentient">
              Dora Commerce
            </p>
          </div>
          <div className="mb-4">
            <h1 className="text-sm leading-none font-light !font-sentient mb-2">
              Description
            </h1>
            <p className="text-xs leading-none font-medium !font-sentient">
              A platform to manage your e-commerce business efficiently.
            </p>
          </div>
          <div className="mb-4 text-[#262626] dark:text-white/80">
            <h1 className="text-sm leading-none font-light !font-sentient mb-2">
              Admin Name
            </h1>
            <p className="text-xs leading-none font-medium !font-sentient">
              John Doe
            </p>
          </div>
          <div className="mb-4">
            <h1 className="text-sm leading-none font-light !font-sentient mb-2">
              Admin Email
            </h1>
            <p className="text-xs leading-none font-medium !font-sentient">
              john@dora.ai
            </p>
          </div>
        </div>

              <div className="col-span-2 bg-[#FCFBFC] dark:bg-[#18181c] border border-[#F5F5F5] dark:border-[#232336] rounded-lg p-6">
          <div className="bg-white dark:bg-[#232336] shadow-md rounded-md p-1 text-center mb-6">
            <span className="text-xs text-[#151515] dark:text-white font-semibold !font-sentient">
              Order Summary - # DR019
            </span>
          </div>
        
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-[#26262699] dark:text-gray-400 leading-none font-light !font-sentient">
              Plan
            </p>
            <p className="text-sm text-[#262626] dark:text-white leading-none font-normal !font-sentient">
              {PLANS.name}
            </p>
          </div>
        
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-[#26262699] dark:text-gray-400 leading-none font-light !font-sentient">
              Price
            </p>
            <p className="text-sm text-[#262626] dark:text-white leading-none font-normal !font-sentient">
              {formatPrice(PLANS.price)}
            </p>
          </div>
        
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-[#26262699] dark:text-gray-400 leading-none font-light !font-sentient">
              Billing Cycle
            </p>
            <p className="text-sm text-[#262626] dark:text-white leading-none font-normal !font-sentient">
              {PLANS.price === 0 ? "One Time" : "Monthly"}
            </p>
          </div>
        
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-[#26262699] dark:text-gray-400 leading-none font-light !font-sentient">
              Next Billing Date
            </p>
            <p className="text-sm text-[#262626] dark:text-white leading-none font-normal !font-sentient">
              {PLANS.price === 0 ? "-" : "25 Agustus 2025"}
            </p>
          </div>
        
          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-[#26262699] dark:text-gray-400 leading-none font-light !font-sentient">
              Total Amount
            </p>
            <p className="text-sm text-[#262626] dark:text-white leading-none font-normal !font-sentient">
              {formatPrice(PLANS.price)}
            </p>
          </div>
        
          <hr className="my-6 dark:border-[#232336]" />
        
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#26262699] dark:text-gray-400 leading-none font-light !font-sentient">
              Grand Total
            </p>
            <p className="text-sm text-[#262626] dark:text-white leading-none font-normal !font-sentient">
              {formatPrice(PLANS.price)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
