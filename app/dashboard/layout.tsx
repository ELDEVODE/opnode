import type { ReactNode } from "react";
import Navbar from "@/components/nav";
import Sidebar from "@/components/sidebar";
import MobileHeader from "@/components/MobileHeader";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] text-white md:pb-0">
      <div className="hidden md:block sticky top-0 z-50 bg-[#050505]">
        <Navbar />
      </div>
      <div className="md:hidden sticky top-0 z-50 bg-[#050505]">
        <MobileHeader />
      </div>
      <div className="mx-none flex w-full md:pb-10 md:pt-4">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
