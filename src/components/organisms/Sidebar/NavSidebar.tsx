"use client";

import { IconChevronRight } from "@tabler/icons-react";
import { useState, useEffect, MouseEvent, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useToast } from "@/components/atoms/ToastProvider";
import Link from "next/link";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/organisms/Sidebar/Sidebar";

import { Lock } from "lucide-react";

type NavSidebarItem = {
  title: string;
  url?: string;
  icon?: React.ElementType;
  children?: NavSidebarItem[];
  active?: boolean;
};

export function NavSidebar({
  items,
  label,
}: {
  label?: string;
  items: NavSidebarItem[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isKeyFeature, setIsKeyFeature] = useState<boolean>(false);
  const pathname = usePathname();
  const { showToast } = useToast();

  const handleLockedClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      showToast(
        "Feature is locked. Please setup your business first.",
        "warning"
      );
    },
    [showToast]
  );

  useEffect(() => {
    const initialValue = sessionStorage.getItem("keyFeature");
    setIsKeyFeature(initialValue === "true");

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "keyFeature") {
        setIsKeyFeature(event.newValue === "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const originalSetItem = sessionStorage.setItem;
    sessionStorage.setItem = function (key, value) {
      originalSetItem.apply(this, [key, value]);
      if (key === "keyFeature") {
        setIsKeyFeature(value === "true");
      }
    };

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      sessionStorage.setItem = originalSetItem;
    };
  }, []);

  useEffect(() => {
    const activeParentIndex = items.findIndex((item) =>
      item.children?.some((child) => child.url === pathname)
    );
    if (activeParentIndex !== -1 && openIndex === null) {
      setOpenIndex(activeParentIndex);
    }
  }, [pathname, items, openIndex]);

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-3">
        {label && (
          <SidebarGroupLabel className="font-light dark:text-white/80">
            {label}
          </SidebarGroupLabel>
        )}
        <SidebarMenu>
          {items.map((item, idx) => {
            const isCurrentItemActive = item.url === pathname;
            const hasActiveChild = item.children?.some(
              (child) => child.url === pathname
            );

            return (
              <SidebarMenuItem key={item.title} className="relative">
                {(isCurrentItemActive ||
                  (hasActiveChild && openIndex !== idx)) && (
                  <div className="absolute h-full dark:bg-white" />
                )}

                <SidebarMenuButton
                  tooltip={item.title}
                  onClick={() =>
                    item.children && !item.url
                      ? setOpenIndex(openIndex === idx ? null : idx)
                      : undefined
                  }
                  className="flex justify-between items-center w-full py-5"
                  isActive={isCurrentItemActive}
                  asChild
                >
                  <Link
                    href={item.url || "#"}
                    className="flex justify-between items-center w-full dark:text-white/70"
                    onClick={isKeyFeature ? handleLockedClick : undefined}
                  >
                    <span className="flex items-center gap-2 text-sm">
                      {item.icon && <item.icon size={20} />}
                      <span>{item.title}</span>
                    </span>

                    <span className="flex items-center gap-2">
                      {item.children && (
                        <IconChevronRight
                          className={`transition-transform ${
                            openIndex === idx ? "rotate-90" : ""
                          }`}
                        />
                      )}
                      {isKeyFeature && (
                        <Lock className="h-4 w-4 text-[#EE9301]" />
                      )}
                    </span>
                  </Link>
                </SidebarMenuButton>

                {item.children && (
                  <div
                    className={`
                      ml-6 mt-1 flex flex-col gap-1
                      overflow-hidden transition-all duration-300
                      ${
                        openIndex === idx
                          ? "max-h-40 opacity-100"
                          : "max-h-0 opacity-0"
                      }
                    `}
                    style={{ transitionProperty: "max-height, opacity" }}
                  >
                    {item.children.map((child) => {
                      const isCurrentChildActive = child.url === pathname;

                      return (
                        <SidebarMenuItem key={child.title} className="relative">
                          {isCurrentChildActive && (
                            <div className="absolute right-0 top-0 h-full bottom-2 w-1 rounded-l bg-[#001363] dark:bg-[#2F49B3]" />
                          )}

                          <SidebarMenuButton
                            tooltip={child.title}
                            className="justify-start"
                            isActive={isCurrentChildActive}
                            asChild
                          >
                            <Link
                              href={child.url || "#"}
                              className="flex items-center justify-between gap-2 w-full"
                            >
                              <span className="flex items-center gap-2">
                                {child.icon && <child.icon />}
                                <span>{child.title}</span>
                              </span>

                              {isKeyFeature && (
                                <Lock className="h-4 w-4 text-[#EE9301]" />
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </div>
                )}
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
