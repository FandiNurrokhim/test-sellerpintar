import { useState, useRef, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useBranch } from "@/context/BranchContext";
import Image from "next/image";

import { Moon, Sun } from "lucide-react";
import { SidebarTrigger } from "@/components/organisms/Sidebar/Sidebar";
import { ChevronDown, ChevronUp } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { businessApi } from "@/utils/apis/business";
import { Branch } from "@/schemas/organization/branch";

// Type untuk SweetAlert result
interface SwalResult {
  isConfirmed: boolean;
  isDenied?: boolean;
  isDismissed?: boolean;
}

type UserProfile = {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
};

export function SiteHeader() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: session } = useSession();
  const token = session?.user.accessToken;
  const organizationId = session?.organizationId;
  const { branchId, setBranchId } = useBranch();
  const [email, setEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);

  const headers = useMemo(() => {
    const headerObj: Record<string, string> = {};
    if (organizationId) headerObj["x-organization-id"] = organizationId;
    if (branchId) headerObj["x-branch-id"] = branchId;
    if (token) headerObj["Authorization"] = `Bearer ${token}`;
    return headerObj;
  }, [organizationId, branchId, token]);

  const handleToggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const fetchUserProfile = async (): Promise<UserProfile> => {
    const response = await businessApi.getUserProfile();
    setEmail(response.data.email);
    setFullName(response.data.fullName);
    return response.data;
  };

  useEffect(() => {
    async function fetchBranches() {
      if (!organizationId) return;
      try {
        const res = await businessApi.getBranches(organizationId, true, {
          headers,
        });
        if (res && res.data) {
          setBranches(res.data);
          const newBranchId =
            sessionStorage.getItem("branchId") || (res.data[0]?.id ?? null);
          setSelectedBranch(newBranchId);
          if (newBranchId) sessionStorage.setItem("branchId", newBranchId);
        }
      } catch (err) {
        console.error("❌ Failed to fetch branches:", err);
        Swal.fire({
          title: "Error",
          text: "Failed to load branches. Please try again later.",
          icon: "error",
        });
      }
    }
    fetchBranches();
    fetchUserProfile();
  }, [organizationId, headers]); // Include headers in dependency

  const handleBranchChange = (branchId: string) => {
    sessionStorage.removeItem("alreadySetupBranch");
    sessionStorage.removeItem("alreadySetupProduct");
    sessionStorage.removeItem("alreadySetupAI");
    sessionStorage.removeItem("alreadySetupWhatsApp");
    sessionStorage.removeItem("keyFeature");
    setSelectedBranch(branchId);
    setBranchId(branchId);
    setIsBranchDropdownOpen(false);
  };

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
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout!",
    }).then((result: SwalResult) => {
      if (result.isConfirmed) {
        signOut({ redirect: false }).then(() => {
          router.push(process.env.NEXT_PUBLIC_URL + "/auth/login");
          sessionStorage.clear();
        });
      }
    });
  };

  const handleRedirect = (url: string) => {
    setIsDropdownOpen(false);
    router.push(url);
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex relative w-full items-center gap-1 px-2 lg:gap-2">
        <SidebarTrigger className="absolute left-[-30] z-10 rounded-full bg-[#001363] dark:bg-[#2F49B3] text-white transition-all duration-300 hover:bg-[#FFF] cursor-pointer" />

        <div className="relative">
          <button
            className="bg-transparent border-none text-lg !font-sentient px-2 py-1 rounded transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-[#232323] cursor-pointer flex items-center gap-2"
            onClick={() => setIsBranchDropdownOpen((prev) => !prev)}
            type="button"
          >
            {branches.find((b) => b.id === selectedBranch)?.name ||
              "Select Branch"}
            {isBranchDropdownOpen ? (
              <ChevronUp className="size-4" />
            ) : (
              <ChevronDown className="size-4" />
            )}
          </button>
          {isBranchDropdownOpen && (
            <div className="absolute left-0 mt-1 w-40 rounded-md shadow-lg bg-white z-20 dark:bg-[#161618]">
              <ul className="py-1 text-sm text-gray-700 dark:text-white/60">
                {branches.map((branch) => (
                  <li key={branch.id}>
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#232336] hover:text-gray-900 dark:hover:text-white cursor-pointer"
                      onClick={() => handleBranchChange(branch.id)}
                    >
                      {branch.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Tidak ada perubahan di bawah ini */}
        <div className="ml-auto flex items-center gap-4 relative">
          <button
            type="button"
            className="bg-transparent border-none p-0 m-0 cursor-pointer"
            aria-label="Toggle dark mode"
            onClick={handleToggleTheme}
          >
            {theme === "dark" ? (
              <Moon size={20} className="text-blue-400" />
            ) : (
              <Sun size={20} className="text-[#001363] dark:text-blue-400" />
            )}
          </button>

          <div
            className="cursor-pointer relative"
            onClick={toggleDropdown}
            ref={dropdownRef}
          >
            {fullName ? (
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-200 text-xs">
                {fullName
                  .split(" ")
                  .slice(0, 2)
                  .map((name) => name.charAt(0).toUpperCase())
                  .join("")}
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-200 text-xs">
                JD
              </div>
            )}
            <div className="absolute right-[-2] bottom-[-2] border-2 border-white bg-green-400 rounded-full w-3 h-3">
              {""}
            </div>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-[#161618] ring-1 z-10">
                <div
                  className="py-1"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="options-menu"
                >
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#232336] hover:text-gray-900 dark:hover:text-white"
                    role="menuitem"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-700 dark:text-gray-200">
                        {fullName
                          ? fullName
                              .split(" ")
                              .map((name) => name.charAt(0).toUpperCase())
                              .join("")
                          : "JD"}
                      </div>
                      <div>
                        <p className="text-sm m-0 font-semibold dark:text-gray-100">
                          {fullName || "-"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {email || "-"}
                        </p>
                      </div>
                    </div>
                  </button>
                  <hr className="dark:border-gray-700" />
                  <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#232336] hover:text-gray-900 dark:hover:text-white"
                    role="menuitem"
                    onClick={() => handleRedirect("/dashboard/user-management")}
                  >
                    User Management
                  </button>
                  <hr className="dark:border-gray-700" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 font-semibold text-sm text-[#ce0303] dark:text-red-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#232336] hover:text-gray-900 dark:hover:text-white"
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
