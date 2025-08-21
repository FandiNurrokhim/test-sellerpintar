"use client";

import * as React from "react";
import Image from "next/image";

import { NavSidebar } from "@/components/organisms/Sidebar/NavSidebar";
import { NavSecondary } from "@/components/organisms/Sidebar/NavSecondary";
// import { PremiumPlanCard } from "@/components/molecules/PremiumPlanCard";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/organisms/Sidebar/Sidebar";
import type { NavItem, SidebarData } from "@/types/sidebar";

export interface AppSidebarTemplateProps
  extends React.ComponentProps<typeof Sidebar> {
  data: SidebarData;
  className?: string;
  onNavigate?: (url: string, item: NavItem) => void;
}

export function AppSidebarTemplate({
  data,
  className,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onNavigate,
  ...props
}: AppSidebarTemplateProps) {
  const {
    logo,
    mainNavigation,
    secondaryNavigation,
  } = data;

  return (
    <Sidebar collapsible="offcanvas" className={className} {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-2"
            >
              <a href={logo.href || "#"}>
                <Image
                  src={logo.icon}
                  alt={`${logo.title} Logo`}
                  height={logo.iconSize || 32}
                  className="rounded"
                />
                <h1 className="text-[#384551] dark:text-white/80 text-2xl font-semibold hidden md:inline-block ml-2">
                  {logo.title}
                </h1>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {mainNavigation.map((section, index) => (
          <NavSidebar key={index} label={section.label} items={section.items} />
        ))}

        <NavSecondary items={secondaryNavigation} className="mt-auto" />
      </SidebarContent>

      {/* <SidebarFooter>{showPremiumCard && <PremiumPlanCard />}</SidebarFooter> */}
    </Sidebar>
  );
}
