"use client";
import HomeNavbar from "@/app/(HomeLayout)/HomeNavbar";

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F6F8FB] dark:bg-[#232323]">
      {/* Navbar */}
      <HomeNavbar />
      
      {/* Content */}
      <main className="md:p-8">{children}</main>
    </div>
  );
}