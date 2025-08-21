"use client";

import { AppSidebar } from "@/app/(DashboardLayout)/AppSidebar";
import { SiteHeader } from "@/components/organisms/SideHeader";
import { SidebarInset, SidebarProvider } from "@/components/organisms/Sidebar/Sidebar";
import { Card } from "@/components/ui/card";
import { checkSetupHelper } from "@/utils/checkSetupHelper";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBranch } from "@/context/BranchContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const { branchId } = useBranch();
  const [storageBranchId, setStorageBranchId] = useState<string | null>(null);

  useEffect(() => {
    setStorageBranchId(typeof window !== "undefined" ? sessionStorage.getItem("branchId") : null);

    const onStorage = (e: StorageEvent) => {
      if (e.storageArea === sessionStorage && e.key === "branchId") {
        setStorageBranchId(e.newValue);
      }
    };

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

    window.addEventListener("storage", onStorage);
    window.addEventListener("branchId:change", onCustom);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("branchId:change", onCustom);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (sessionStorage as any).setItem = originalSetItem;
    };
  }, []);

  useEffect(() => {
    const effectiveBranchId = branchId ?? storageBranchId;
    if (!effectiveBranchId) return;

    const checkAndRedirect = async () => {
      const existingKeyFeature = sessionStorage.getItem("keyFeature");
      if (existingKeyFeature !== null) {
        setIsChecking(false);
        if (existingKeyFeature === "true") router.push("/dashboard/initiate-setup");
        return;
      }

      setIsChecking(true);
      try {
        const setupStatus = await checkSetupHelper(effectiveBranchId);
        const hasIncomplete = setupStatus.some((item) => !item.already);

        const branchStatus = setupStatus.find((i) => i.title === "Branch")?.already ?? false;
        const productStatus = setupStatus.find((i) => i.title === "Product")?.already ?? false;
        const aiStatus = setupStatus.find((i) => i.title === "AI Configuration")?.already ?? false;
        const waStatus = setupStatus.find((i) => i.title === "WhatsApp Configuration")?.already ?? false;

        sessionStorage.setItem("alreadySetupBranch", String(branchStatus));
        sessionStorage.setItem("alreadySetupProduct", String(productStatus));
        sessionStorage.setItem("alreadySetupAI", String(aiStatus));
        sessionStorage.setItem("alreadySetupWhatsApp", String(waStatus));
        sessionStorage.setItem("keyFeature", String(hasIncomplete));

        if (hasIncomplete) router.push("/dashboard/initiate-setup");
      } catch (err) {
        console.error("[DashboardLayout] checkSetup error:", err);
      } finally {
        setIsChecking(false);
      }
    };

    checkAndRedirect();
  }, [branchId, storageBranchId, router]);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 14)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <Card className="sticky top-0 z-50 px-4 py-0 mb-4 mt-2 rounded-2xl dark:bg-[#161618] dark:text-white/80">
          <SiteHeader />
        </Card>
        {isChecking ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Checking setup...</p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-2">{children}</div>
            </div>
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
