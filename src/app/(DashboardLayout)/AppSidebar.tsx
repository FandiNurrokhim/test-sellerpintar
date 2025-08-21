"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppSidebarTemplate } from "@/components/templates/AppSidebarTemplate";
import {
  defaultSidebarConfig,
  adminSidebarConfig,
  minimalSidebarConfig,
} from "@/components/config/sidebarConfig";
import { Sidebar } from "@/components/organisms/Sidebar/Sidebar";
import type { NavItem, SidebarData } from "@/types/sidebar";

export interface AppSidebarProps
  extends Omit<React.ComponentProps<typeof Sidebar>, "variant"> {
  variant?: "default" | "admin" | "minimal" | "inset";
  data?: SidebarData;
  onNavigate?: (url: string, item: NavItem) => void;
}

export function AppSidebar({
  variant = "default",
  data,
  onNavigate,
  ...props
}: AppSidebarProps) {
  const router = useRouter();

  const handleNavigation = React.useCallback(
    (url: string, item: NavItem) => {
      if (onNavigate) {
        onNavigate(url, item);
      } else {
        router.push(url);
      }
    },
    [router, onNavigate]
  );

  const getSidebarConfig = (): SidebarData => {
    if (data) {
      return data;
    }

    switch (variant) {
      case "admin":
        return adminSidebarConfig;
      case "minimal":
        return minimalSidebarConfig;
      case "inset":
      case "default":
      default:
        return defaultSidebarConfig;
    }
  };

  const getSidebarVariant = (): React.ComponentProps<
    typeof Sidebar
  >["variant"] => {
    switch (variant) {
      case "inset":
        return "inset";
      case "admin":
      case "minimal":
      case "default":
      default:
        return "sidebar";
    }
  };

  return (
    <AppSidebarTemplate
      data={getSidebarConfig()}
      onNavigate={handleNavigation}
      variant={getSidebarVariant()}
      {...props}
    />
  );
}

export type { NavItem, SidebarData } from "@/types/sidebar";
