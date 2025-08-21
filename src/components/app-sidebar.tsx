"use client";

import * as React from "react";
import {
  LayoutDashboard,
  PackageSearch,
  KeyboardMusic,
  Bot,
  MessageCircleMore,
  Cog,
  ShoppingBasket,
  User,
  BanknoteArrowUp,
  FolderKanban,
  MessagesSquare,
  Users,
  Bolt,
  MessageCircleQuestionMark,
} from "lucide-react";

import LogoIcon from "../../public/images/logos/logo.png";

import { NavSidebar } from "@/components/organisms/Sidebar/NavSidebar";
import { NavSecondary } from "@/components/organisms/Sidebar/NavSecondary";
import { PremiumPlanCard } from "@/components/molecules/PremiumPlanCard";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/organisms/Sidebar/Sidebar";
import Image from "next/image";

const data = {
  user: {
    name: "Openin",
    email: "me@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboards",
      url: "/dashboard",
      icon: LayoutDashboard,
      active: true,
    },
  ],
  knowledgeBase: [
    {
      title: "Products",
      url: "#",
      icon: PackageSearch,
    },
    {
      title: "Categories",
      url: "#",
      icon: KeyboardMusic,
    },
  ],
  whatsapp: [
    {
      title: "AI agent",
      url: "#",
      icon: Bot,
    },
    {
      title: "Chat",
      url: "#",
      icon: MessageCircleMore,
    },
    {
      title: "Configuration",
      url: "#",
      icon: Cog,
    },
  ],
  orders: [
    {
      title: "Order ",
      url: "#",
      icon: ShoppingBasket,
    },
    {
      title: "Customer Info",
      url: "#",
      icon: User,
    },
  ],
  analytics: [
    {
      title: "Sales",
      url: "#",
      icon: BanknoteArrowUp,
    },
    {
      title: "Conversation",
      url: "#",
      icon: MessagesSquare,
    },
    {
      title: "Product Performance",
      url: "#",
      icon: FolderKanban,
    },
    {
      title: "Customer Insights",
      url: "#",
      icon: Users,
    },
  ],
  navSecondary: [
    {
      title: "Setting",
      url: "#",
      icon: Bolt,
    },
    {
      title: "Get Help",
      url: "#",
      icon: MessageCircleQuestionMark,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-2"
            >
              <a href="#">
                <Image
                  src={LogoIcon}
                  alt="Logo"
                  height={32}
                  className="rounded"
                />
                <h1 className="text-[#384551] text-2xl font-semibold hidden md:inline-block ml-2">
                  Dora
                </h1>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavSidebar items={data.navMain} />
        <NavSidebar label="Knowledge Base" items={data.knowledgeBase} />
        <NavSidebar label="WhatsApp" items={data.whatsapp} />
        <NavSidebar label="Orders" items={data.orders} />
        <NavSidebar label="Analytics" items={data.analytics} />

        <NavSecondary items={data.navSecondary} className="mt-auto " />
      </SidebarContent>
      <SidebarFooter>
        <PremiumPlanCard />
      </SidebarFooter>
    </Sidebar>
  );
}
