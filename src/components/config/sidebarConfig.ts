import {
  LayoutDashboard,
  PackageSearch,
  KeyboardMusic,
  Bot,
  Cog,
  Users,
  ShoppingBasket,
  MessageSquare,
  MessageCircleMore
} from "lucide-react";

import LogoIcon from "../../../public/images/logos/logo.png";
import type { SidebarData } from "@/types/sidebar";

export const defaultSidebarConfig: SidebarData = {
  user: {
    name: "Openin",
    email: "me@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  logo: {
    icon: LogoIcon,
    title: "Dora",
    href: "/dashboard",
    iconSize: 32,
  },
  mainNavigation: [
    {
      items: [
        {
          title: "Dashboards",
          url: "/dashboard",
          icon: LayoutDashboard,
          active: true,
        },
      ],
    },
    {
      label: "Knowledge Base",
      items: [
        {
          title: "Products",
          url: "/dashboard/products",
          icon: PackageSearch,
        },
        {
          title: "Categories",
          url: "/dashboard/categories",
          icon: KeyboardMusic,
        },
      ],
    },
    {
      label: "WhatsApp",
      items: [
        {
          title: "AI agent",
          url: "/dashboard/ai-agent",
          icon: Bot,
        },
        {
          title: "AI Playground",
          url: "/dashboard/ai-agent/playground",
          icon: MessageSquare,
        },
        {
          title: "Configuration",
          url: "/dashboard/whatsapp-config",
          icon: Cog,
        },
        {
          title: "Chat",
          url: "/dashboard/whatsapp-chat",
          icon: MessageCircleMore,
        },
      ],
    },
    {
      label: "Orders",
      items: [
        {
          title: "Order",
          url: "/dashboard/orders",
          icon: ShoppingBasket,
        },
        // {
        //   title: "Customer Info",
        //   url: "/dashboard/customers",
        //   icon: User,
        // },
      ],
    },
    // {
    //   label: "Analytics",
    //   items: [
    //     {
    //       title: "Sales",
    //       url: "/dashboard/analytics/sales",
    //       icon: BanknoteArrowUp,
    //     },
    //     {
    //       title: "Conversation",
    //       url: "/dashboard/analytics/conversation",
    //       icon: MessagesSquare,
    //     },
    //     {
    //       title: "Product Performance",
    //       url: "/dashboard/analytics/products",
    //       icon: FolderKanban,
    //     },
    //     {
    //       title: "Customer Insights",
    //       url: "/dashboard/analytics/customers",
    //       icon: Users,
    //     },
    //   ],
    // },
  ],
  secondaryNavigation: [
    // {
    //   title: "Setting",
    //   url: "/dashboard/settings",
    //   icon: Bolt,
    // },
    // {
    //   title: "Get Help",
    //   url: "/dashboard/help",
    //   icon: MessageCircleQuestionMark,
    // },
  ],
  showPremiumCard: true,
};

export const adminSidebarConfig: SidebarData = {
  ...defaultSidebarConfig,
  mainNavigation: [
    ...defaultSidebarConfig.mainNavigation,
    {
      label: "Admin",
      items: [
        {
          title: "User Management",
          url: "/admin/users",
          icon: Users,
        },
        {
          title: "System Settings",
          url: "/admin/settings",
          icon: Cog,
        },
      ],
    },
  ],
  showPremiumCard: false,
};

export const minimalSidebarConfig: SidebarData = {
  logo: {
    icon: LogoIcon,
    title: "Dora",
    href: "/",
  },
  mainNavigation: [
    {
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Products",
          url: "/products",
          icon: PackageSearch,
        },
      ],
    },
  ],
  secondaryNavigation: [
    {
      title: "Settings",
      url: "/settings",
      icon: Cog,
    },
  ],
  showPremiumCard: false,
};
