import React, { useRef, useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { LogOut } from "lucide-react";
import Link from "next/link";

interface AvatarDropdownProps {
  username?: string;
  mode?: "light" | "dark";
}

interface SwalResult {
  isConfirmed: boolean;
  isDenied?: boolean;
  isDismissed?: boolean;
}

export const AvatarDropdown: React.FC<AvatarDropdownProps> = ({
  username,
  mode,
}) => {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

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

  return (
    <div className="relative flex items-center gap-2">
      <div
        className="cursor-pointer flex items-center gap-2 z-40"
        onClick={toggleDropdown}
        ref={dropdownRef}
      >
        <div className="h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center font-bold text-gray-700 text-base">
          {username
            ? username
                .split(" ")
                .slice(0, 2)
                .map((name) => name.charAt(0).toUpperCase())
                .join("")
            : "JD"}
        </div>
        <span
          className={`font-medium underline hidden md:block underline-offset-2 text-[16px] !font-archive  ${
            mode === "dark" ? "text-white" : "text-gray-700"
          }`}
        >
          {username || "James Dean"}
        </span>
      </div>
      {isDropdownOpen && (
        <div className="absolute right-0 top-12 w-52 rounded-lg shadow-lg bg-white ring-1 z-10">
          <div className="py-2">
            <Link
              href="/dashboard/user-management"
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 hover:text-gray-900"
              role="menuitem"
            >
              My Account
            </Link>
            <hr className="my-1 border-gray-200" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full text-left px-4 py-2 font-semibold text-sm text-[#ce0303] cursor-pointer hover:bg-gray-100 hover:text-[#ce0303]"
              role="menuitem"
            >
              <LogOut size={16} className="text-[#ce0303]" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
