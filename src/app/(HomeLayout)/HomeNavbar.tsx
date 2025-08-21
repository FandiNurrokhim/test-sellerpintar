"use client";
import LogoIpsum from "../../../public/images/logos/LogoIpsum.png";
import LogoIpsumWhite from "../../../public/images/logos/LogoIpsumWhite.png";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AvatarDropdown } from "@/components/molecules/AvatarDropdown";
import React, { useEffect, useState } from "react";

export default function HomeNavbar() {
  const pathname = usePathname();
  const isArticlesPage = pathname === "/articles";
  const [mode, setMode] = useState<"light" | "dark">(
    isArticlesPage ? "dark" : "light"
  );
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Check if mobile
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setMode("dark");
    } else if (isArticlesPage && !scrolled) {
      setMode("dark");
    } else {
      setMode("light");
    }
  }, [isArticlesPage, scrolled]);

  // Logo: always LogoIpsum on mobile
  const isMobile =
    typeof window !== "undefined" ? window.innerWidth < 768 : false;
  const logoSrc = isMobile
    ? LogoIpsum
    : isArticlesPage && !scrolled
    ? LogoIpsumWhite
    : LogoIpsum;

  return (
    <nav
      className={`w-full fixed mx-auto px-6 md:px-8 lg:px-16 lg:py-2 flex items-center justify-between md:gap-4 flex-wrap z-10 transition-all duration-300
        ${
          isArticlesPage && !scrolled
            ? "md:bg-transparent bg-white"
            : "bg-white shadow-sm"
        }`}
    >
      <div className="flex items-center dark:bg-[#161618] md:rounded-3xl gap-2 h-16 transition-all duration-300">
        <Image
          src={logoSrc}
          alt="Logo"
          width={155}
          height={140}
          className="transition-all duration-300"
        />
      </div>
      <AvatarDropdown username="James Dean" mode={mode} />
    </nav>
  );
}
