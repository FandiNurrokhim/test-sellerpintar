"use client";
import HomeNavbar from "@/app/(HomeLayout)/HomeNavbar";
import HomeFooter from "@/app/(HomeLayout)/HomeFooter";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#232323]">
      {/* Navbar */}
      <HomeNavbar />
      
      {/* Content */}
      <main className="bg-white dark:bg-[#161618]">{children}</main>
      <HomeFooter/>
    </div>
  );
}