"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { Toaster } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { fetchUser } = useAuthStore();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
      if (!isLoginPage) fetchUser();
    }, [fetchUser, isLoginPage]);

    if (isLoginPage) {
      return <>{children}</>;
    }

    return (
      <>
        <Toaster />
        <div className="flex h-screen bg-gray-50">
          <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

          {/* Mobile hamburger: sticky inside the scrollable main so it scrolls with content then sticks at top */}

          <main className="flex-1 md:ml-64 overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="md:hidden sticky top-4 z-50">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="p-2 rounded bg-white shadow"
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
