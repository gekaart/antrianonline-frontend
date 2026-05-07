"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { Toaster } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { fetchUser } = useAuthStore();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const { isDark } = useTheme();

    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
      if (!isLoginPage) fetchUser();
    }, [fetchUser, isLoginPage]);

    if (isLoginPage) {
      return <>{children}</>;
    }

    const bgClass = isDark ? "bg-gray-50" : "bg-white";
    const textClass = isDark ? "text-gray-900" : "text-gray-900";

    return (
      <>
        <Toaster />
        <div className={cn("flex h-screen", bgClass)}>
          <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

          {/* Mobile hamburger: sticky inside the scrollable main so it scrolls with content then sticks at top */}

          <main className={cn("flex-1 md:ml-64 overflow-y-auto", bgClass, textClass)}>
            <div className="p-4 md:p-6">
              <div className="md:hidden sticky top-4 z-50">
                <button
                  onClick={() => setMobileOpen(true)}
                  className={cn("p-2 rounded shadow", isDark ? "bg-gray-100" : "bg-white")}
                  aria-label="Open menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
