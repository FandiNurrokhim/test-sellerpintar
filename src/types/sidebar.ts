import { LucideIcon } from "lucide-react";
import { StaticImageData } from "next/image";

// Types
export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  active?: boolean;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

export interface LogoConfig {
  icon: StaticImageData | string;
  title: string;
  href?: string;
  iconSize?: number;
}

export interface UserData {
  name: string;
  email: string;
  avatar: string;
}

export interface SidebarData {
  user?: UserData;
  logo: LogoConfig;
  mainNavigation: NavSection[];
  secondaryNavigation: NavItem[];
  showPremiumCard?: boolean;
}
