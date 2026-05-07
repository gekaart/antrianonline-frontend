"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import SuperAdminSidebar from "./SuperAdminSidebar";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user, fetchUser, loading } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/admin/login");
      } else if (user.level !== "super_admin") {
        router.push("/admin");
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className={cn("min-h-screen flex items-center justify-center", isDark ? "bg-gray-950" : "bg-white")}>
        <div className={isDark ? "text-white" : "text-gray-900"}>Memuat...</div>
      </div>
    );
  }

  const bgClass = isDark ? "bg-gray-950" : "bg-white";
  const mobileButtonBgClass = isDark ? "bg-gray-800" : "bg-gray-100";
  const mobileButtonIconClass = isDark ? "text-white" : "text-gray-900";

  return (
    <>
      <Toaster />
      <div className={cn("flex h-screen", bgClass)}>
        <SuperAdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <main className="flex-1 md:ml-64 overflow-y-auto">
          <div className="p-4 md:p-6">
            <div className="md:hidden sticky top-4 z-50">
              <button onClick={() => setMobileOpen(true)} className={cn("p-2 rounded shadow", mobileButtonBgClass)} aria-label="Open menu">
                <svg xmlns="http://www.w3.org/2000/svg" className={cn("h-5 w-5", mobileButtonIconClass)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
