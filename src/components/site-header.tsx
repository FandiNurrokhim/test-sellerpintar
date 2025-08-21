import { useState, useRef, useEffect } from "react";
import { SidebarTrigger } from "@/components/organisms/Sidebar/Sidebar";
import { Bell, Moon } from "lucide-react";
import Image from "next/image";

export function SiteHeader() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex relative w-full items-center gap-1 px-2 lg:gap-2">
        <SidebarTrigger className="absolute left-[-30] z-10 rounded-full bg-[#001363] dark:bg-[#2F49B3] text-white transition-all duration-300 hover:bg-[#FFF] cursor-pointer" />

        <div className="ml-auto flex items-center gap-4 relative">
          <Moon size={20} />
          <div className="relative">
            <Bell size={20} />
            <div className="absolute right-[-2] top-[-2] border-2 border-white bg-red-500 rounded-full w-3 h-3">
              {""}
            </div>
          </div>

          <div
            className="cursor-pointer relative"
            onClick={toggleDropdown}
            ref={dropdownRef}
          >
            <Image
              src={"/images/avatar/profile-online.svg"}
              width={32}
              height={32}
              alt="Profile"
              className="h-8 w-8 rounded-full"
            />
            <div className="absolute right-[-2] bottom-[-2] border-2 border-white bg-green-400 rounded-full w-3 h-3">
              {""}
            </div>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1z-10">
                <div
                  className="py-1"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="options-menu"
                >
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 hover:text-gray-900"
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
