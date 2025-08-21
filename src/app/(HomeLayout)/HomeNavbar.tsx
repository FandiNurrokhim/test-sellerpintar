"use client";
import { useState } from "react";
import LogoTitleIcon from "../../../public/images/logos/logo-title.png";
import LogoMobile from "../../../public/images/logos/logo.png";
import Image from "next/image";
import { Search, X } from "lucide-react";

export default function HomeNavbar() {
  const [searchActive, setSearchActive] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  return (
    <nav className="max-w-7xl mx-auto md:px-8 lg:px-0 lg:py-4 flex items-center justify-between md:gap-4 flex-wrap">
      {/* Logo */}
      <div className="flex items-center bg-white dark:bg-[#161618] md:rounded-3xl gap-2 ps-6 pr-10 py-9 h-16">
        {/* Logo desktop */}
        <Image
          src={LogoTitleIcon}
          alt="Logo"
          width={155}
          height={140}
          className="hidden sm:block"
        />
        {/* Logo mobile */}
        <Image
          src={LogoMobile}
          alt="Logo Mobile"
          width={32}
          height={32}
          className="w-8 h-8 block sm:hidden"
        />
      </div>
      <div className="flex-1 bg-white dark:bg-[#161618] md:rounded-3xl gap-4 p-3 min-w-[48px] flex items-center md:justify-center justify-end h-18">
        {!searchActive ? (
          <>
            <div className="relative w-full h-full">
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-full pl-10 py-2 text-xs rounded-lg bg-[#F6F8FB] dark:bg-[#161618] border border-gray-200 dark:border-[#161618] focus:outline-none text-gray-900 dark:text-white"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <span className="absolute left-5 top-[48%] -translate-y-1/2 text-gray-400">
                <Search className="w-4 h-4" />
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center w-full px-4 py-2 rounded-lg border">
            <Search className="w-5 h-5 text-white mr-2" />
            <input
              type="text"
              placeholder="Search products..."
              className="bg-transparent outline-none text-gray-900 dark:text-white flex-1"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              autoFocus
            />
            <button
              className="ml-2"
              onClick={() => {
                setSearchActive(false);
                setSearchValue("");
              }}
            >
              <X className="w-5 h-5 text-gray-900 dark:text-white" />
            </button>
          </div>
        )}
      </div>
      {!searchActive && (
        <div className="flex items-center gap-3 bg-white dark:bg-[#161618] md:rounded-3xl p-3 h-18">
          <div className="text-xs font-bold !font-sentient bg-gradient-to-r from-[#2FAAB3] to-[#006353] text-white rounded-full w-10 h-10 flex items-center justify-center">
            MR
          </div>
          <span className="!font-sentient font-medium text-gray-700 dark:text-white hidden lg:block">
            Muhammad Rizal Wiyono
          </span>
        </div>
      )}
    </nav>
  );
}
