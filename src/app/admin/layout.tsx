"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";
import { Toaster } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { fetchUser } = useAuthStore();
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

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
        <Sidebar />
        <main className="flex-1 ml-64 overflow-y-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </>
  );
}
