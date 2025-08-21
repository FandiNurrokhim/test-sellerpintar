"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import FeatureLocked from "@/components/ui/feature-locked";
import StepperLayout from "@/components/organisms/Stepper/StepperLayout";
import { checkSetupHelper, type SetupStatus } from "@/utils/checkSetupHelper";
import { useBranch } from "@/context/BranchContext";
import { BusinessDetail, BusinessDetailRef } from "./forms/business-detail";
import { ProductPage, ProductRef } from "./forms/product";
import { AssistantPage, AssistantPageRef } from "./forms/ai-configuration";
import { WhatsAppPage, WhatsAppRef } from "./forms/wa-configuration";
import { useRouter } from "next/navigation";

interface StepperFormRef {
  submit: () => Promise<boolean>;
  fetchPrevItem?: () => Promise<void>;
  isShowingQR?: boolean;
}

const TITLE_MAP: Record<string, string> = {
  "Branch Information": "Branch",
  Products: "Product",
  "AI Configuration": "AI Configuration",
  "Whatsapp Configuration": "WhatsApp Configuration",
  "Whatsapp QR Code": "WhatsApp QR",
};

const BASE_STEPS = [
  { title: "Branch Information", description: "Provide your branch details to get started.", component: <BusinessDetail /> },
  { title: "Products", description: "Add your first products to the store.", component: <ProductPage />, skip: true },
  { title: "AI Configuration", description: "Configure AI settings for your store.", component: <AssistantPage />, skip: true },
  { title: "Whatsapp Configuration", description: "Set up WhatsApp integration and scan QR code to connect.", component: <WhatsAppPage />, skip: true },
  { title: "Finish", description: "Complete the setup process.", component: <FeatureLocked />, isLast: true },
];

export default function InitiateSetup() {
  const formRefs = useRef<(null | StepperFormRef)[]>([]);
  const router = useRouter();
  const [setupStatuses, setSetupStatuses] = useState<SetupStatus[] | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const { branchId } = useBranch();
  const [storageBranchId, setStorageBranchId] = useState<string | null>(null);

  useEffect(() => {
    setStorageBranchId(typeof window !== "undefined" ? sessionStorage.getItem("branchId") : null);

    const originalSetItem = sessionStorage.setItem.bind(sessionStorage);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (sessionStorage as any).setItem = (key: string, value: string) => {
      const oldValue = sessionStorage.getItem(key);
      originalSetItem(key, value);
      if (key === "branchId" && oldValue !== value) {
        window.dispatchEvent(new CustomEvent("branchId:change", { detail: { oldValue, newValue: value } }));
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onCustom = (e: any) => setStorageBranchId(e.detail?.newValue ?? sessionStorage.getItem("branchId"));
    window.addEventListener("branchId:change", onCustom);

    return () => {
      window.removeEventListener("branchId:change", onCustom);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sessionStorage as any).setItem = originalSetItem;
    };
  }, []);

  useEffect(() => {
    const effectiveBranchId = branchId ?? storageBranchId;
    if (!effectiveBranchId) return;

    (async () => {
      setIsChecking(true);
      const result = await checkSetupHelper(effectiveBranchId);
      setSetupStatuses(result);

      const getStatus = (title: string) => result.find((i) => i.title === title)?.already ?? false;

      const branchStatus = getStatus("Branch");
      const productStatus = getStatus("Product");
      const aiStatus = getStatus("AI Configuration");
      const waStatus = getStatus("WhatsApp Configuration");
      const waQRStatus = getStatus("WhatsApp QR");

      const nextIsLocked = !(branchStatus && productStatus && aiStatus && waStatus && waQRStatus);

      sessionStorage.setItem("alreadySetupBranch", String(branchStatus));
      sessionStorage.setItem("alreadySetupProduct", String(productStatus));
      sessionStorage.setItem("alreadySetupAI", String(aiStatus));
      sessionStorage.setItem("alreadySetupWhatsApp", String(waStatus));
      sessionStorage.setItem("alreadySetupWhatsAppQR", String(waQRStatus));
      sessionStorage.setItem("keyFeature", nextIsLocked ? "true" : "false");

      setIsChecking(false);
      if (!nextIsLocked) router.push("/dashboard");
    })();
  }, [branchId, storageBranchId, router]);

  const visibleSteps = useMemo(() => {
    if (!setupStatuses) return BASE_STEPS;
    const needSteps = BASE_STEPS.filter(
      (step) =>
        !step.isLast &&
        setupStatuses.find((s) => s.title === TITLE_MAP[step.title])?.already === false
    );
    const finishStep = BASE_STEPS.find((s) => s.isLast);
    return finishStep ? [...needSteps, finishStep] : needSteps;
  }, [setupStatuses]);

  const stepsWithRef = useMemo(
    () =>
      visibleSteps.map((step, idx) => {
        let component = step.component;
        switch (step.title) {
          case "Branch Information":
            component = <BusinessDetail ref={(el: BusinessDetailRef | null) => { formRefs.current[idx] = el ? { submit: el.submitForm } : null; }} />;
            break;
          case "Products":
            component = <ProductPage ref={(el: ProductRef | null) => { formRefs.current[idx] = el ? { submit: el.submitForm } : null; }} />;
            break;
          case "AI Configuration":
            component = <AssistantPage ref={(el: AssistantPageRef | null) => { formRefs.current[idx] = el ? { submit: el.submitAll, fetchPrevItem: el.fetchAllPrev } : null; }} />;
            break;
          case "Whatsapp Configuration":
            component = <WhatsAppPage ref={(el: WhatsAppRef | null) => { formRefs.current[idx] = el ? { submit: el.submitForm, fetchPrevItem: el.fetchPrevItem, isShowingQR: el.isShowingQR } : null; }} />;
            break;
        }
        return { ...step, component };
      }),
    [visibleSteps]
  );

  if (isChecking) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Checking setup status...</p>
        </div>
      </div>
    );
  }

  return <StepperLayout formRefs={formRefs} steps={stepsWithRef} />;
}
