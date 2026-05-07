"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  LogOut,
  UserCircle,
  Shield,
  FileText,
  Settings,
  Activity,
  Server,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth";
import { useTheme } from "@/context/ThemeContext";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { href: "/super-admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/super-admin/kantor", label: "Kelola Kantor", icon: Building2 },
  { href: "/super-admin/users", label: "Kelola User", icon: Users },
  { href: "/super-admin/2fa", label: "Pengaturan 2FA", icon: Shield },
  { href: "/super-admin/logs", label: "Log Aplikasi", icon: FileText },
  { href: "/super-admin/settings", label: "Pengaturan", icon: Settings },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function SuperAdminSidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, clear } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setShowMenu(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  async function handleLogout() {
    await logout();
    clear();
    window.location.href = "/admin/login";
  }

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  const bgClass = isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const navActiveBgClass = isDark ? "bg-purple-600/20 text-purple-400" : "bg-purple-100 text-purple-600";
  const navInactiveBgClass = isDark ? "text-gray-400 hover:text-white hover:bg-gray-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100";
  const borderClass = isDark ? "border-gray-800" : "border-gray-200";
  const overlayBgClass = isDark ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-300";
  const overlayTextClass = isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200";

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-200 md:translate-x-0",
          bgClass,
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo area */}
        <div className={cn("flex items-center gap-3 px-6 py-5 border-b", borderClass)}>
          <div className="h-10 w-10 bg-purple-600 rounded-xl flex items-center justify-center">
            <Server className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className={cn("font-bold text-sm", textClass)}>Super Admin</h1>
            <p className={isDark ? "text-gray-500 text-xs" : "text-gray-600 text-xs"}>Antrian Online</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive(item) ? navActiveBgClass : navInactiveBgClass
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <div className={cn("px-3 py-3 border-t", borderClass)}>
          <ThemeToggle />
        </div>

        {/* User area */}
        <div className={cn("px-3 py-4 border-t", borderClass)}>
          <div className="relative" ref={wrapperRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors",
                isDark
                  ? "text-gray-400 hover:text-white hover:bg-gray-800"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <UserCircle className="h-5 w-5" />
              <span className="truncate">{user?.nama || "Administrator"}</span>
            </button>
            {showMenu && (
              <div className={cn("absolute bottom-full left-0 right-0 mb-1 rounded-lg shadow-lg border py-1", overlayBgClass)}>
                <button
                  onClick={handleLogout}
                  className={cn(
                    "flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors",
                    isDark ? "text-red-400 hover:bg-gray-700" : "text-red-600 hover:bg-gray-200"
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}


