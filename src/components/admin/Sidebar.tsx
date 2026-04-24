"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  Settings,
  DoorOpen,
  Users,
  ListChecks,
  FileText,
  LogOut,
  Building2,
  UserCircle,
  UserCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/auth";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/settings", label: "Pengaturan Kantor", icon: Settings },
  { href: "/admin/jenis-layanan", label: "Jenis Layanan", icon: ListChecks },
  { href: "/admin/ruangan", label: "Ruangan", icon: DoorOpen },
  { href: "/admin/petugas", label: "Petugas", icon: Users },
  { href: "/admin/pengunjung", label: "Pengunjung", icon: UserCheck },
  { href: "/admin/log-reset", label: "Log Reset", icon: FileText },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, clear } = useAuthStore();

  async function handleLogout() {
    await logout();
    clear();
    window.location.href = "/admin/login";
  }

  const logoUrl = user?.kantor_logo;
  const [showMenu, setShowMenu] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [kantorName, setKantorName] = useState<string | null>(null);


  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setShowMenu(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  useEffect(() => {
    if (!user?.k_alias) return;
    let mounted = true;
    api.get(`/api/public/kantor/${user.k_alias}`)
      .then((k: any) => { if (mounted) setKantorName(k.nama); })
      .catch(() => {});
    return () => { mounted = false; };
  }, [user]);



  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex h-screen w-64 flex-col bg-gray-900 text-white fixed left-0 top-0 z-30">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700">
          <div className="font-bold text-lg">Antrian Online</div>
          <div className="mt-2 flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-7 w-7 object-contain rounded" />
            ) : (
              <Building2 className="h-6 w-6 text-blue-400" />
            )}
            <span className="text-sm text-gray-300">{kantorName ?? user?.k_alias ?? "-"}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = (item as any).exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info + dropup */}
        <div ref={wrapperRef} className="px-4 py-4 border-t border-gray-700 relative">
          <button
            onClick={() => setShowMenu((s) => !s)}
            className="flex items-center gap-3 w-full text-left focus:outline-none"
          >
            <UserCircle className="h-7 w-7 text-gray-300" />
            <div className="flex-1">
              <p className="text-xs text-gray-400">Login sebagai</p>
              <p className="text-sm font-medium truncate">{user?.nama || "-"}</p>
            </div>
          </button>

          {showMenu && (
            <div className="absolute left-3 bottom-20 w-56 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-40">
              <Link
                href="/admin/profil"
                className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                onClick={() => setShowMenu(false)}
              >
                Profil Admin
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
              >
                Keluar
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={onClose} />
          <aside className="relative w-64 flex flex-col bg-gray-900 text-white">
            <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <div className="font-bold text-lg">Antrian Online</div>
              <button onClick={onClose} className="text-gray-300 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = (item as any).exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => onClose && onClose()}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div ref={wrapperRef} className="px-4 py-4 border-t border-gray-700 relative">
              <button
                onClick={() => setShowMenu((s) => !s)}
                className="flex items-center gap-3 w-full text-left focus:outline-none"
              >
                <UserCircle className="h-7 w-7 text-gray-300" />
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Login sebagai</p>
                  <p className="text-sm font-medium truncate">{user?.nama || "-"}</p>
                </div>
              </button>

              {showMenu && (
                <div className="absolute left-3 bottom-20 w-56 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-40">
                  <Link
                    href="/admin/profil"
                    className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                    onClick={() => { setShowMenu(false); onClose && onClose(); }}
                  >
                    Profil Admin
                  </Link>
                  <button
                    onClick={() => { handleLogout(); onClose && onClose(); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                  >
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
