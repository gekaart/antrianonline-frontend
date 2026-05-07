"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Users, Shield, ShieldOff, Building2, Calendar, UserCheck, Search, Filter } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface SuperAdminUser {
  id: number;
  nama: string;
  username: string;
  email: string | null;
  level: "super_admin" | "admin" | "petugas";
  id_kantor: number | null;
  kantor_nama: string | null;
  kantor_alias: string | null;
  twofa_enabled: boolean | number;
  created_at: string;
}

const levelConfig: Record<string, { icon: any; color: string; label: string }> = {
  super_admin: { icon: Shield, color: "text-purple-400 bg-purple-900/30", label: "Super Admin" },
  admin:       { icon: UserCheck, color: "text-blue-400 bg-blue-900/30", label: "Admin" },
  petugas:     { icon: Users, color: "text-green-400 bg-green-900/30", label: "Petugas" },
};

export default function SuperAdminUsersPage() {
  const [list, setList] = useState<SuperAdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("");
  const { isDark } = useTheme();

  useEffect(() => {
    api.get<SuperAdminUser[]>("/api/super-admin/users")
      .then(setList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = list.filter((u) => {
    const q = search.toLowerCase();
    if (q && !u.nama.toLowerCase().includes(q) && !u.username.toLowerCase().includes(q) && !(u.email || "").toLowerCase().includes(q)) return false;
    if (filterLevel && u.level !== filterLevel) return false;
    return true;
  });

  const cardBgClass = isDark ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200";
  const cardTextClass = isDark ? "text-white" : "text-gray-900";
  const cardSubtextClass = isDark ? "text-gray-400" : "text-gray-600";
  const tableHeaderBg = isDark ? "bg-gray-800" : "bg-gray-100";
  const tableHeaderText = isDark ? "text-gray-300" : "text-gray-600";
  const tableBorder = isDark ? "border-gray-800" : "border-gray-200";
  const tableRowHover = isDark ? "hover:bg-gray-800" : "hover:bg-gray-100";
  const inputBg = isDark ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400";
  const selectBg = isDark ? "bg-gray-800 border-gray-700 text-gray-200" : "bg-white border-gray-300 text-gray-900";

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const levelCounts = {
    total: list.length,
    super_admin: list.filter((u) => u.level === "super_admin").length,
    admin: list.filter((u) => u.level === "admin").length,
    petugas: list.filter((u) => u.level === "petugas").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 bg-purple-600 rounded-2xl flex items-center justify-center">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className={cn("text-2xl font-bold", cardTextClass)}>Kelola User</h1>
          <p className={cn("text-sm", cardSubtextClass)}>
            {list.length} user terdaftar
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className={cn("border rounded-xl p-4", cardBgClass)}>
          <p className={cn("text-2xl font-bold", cardTextClass)}>{levelCounts.total}</p>
          <p className={cn("text-xs mt-1", cardSubtextClass)}>Total User</p>
        </div>
        <div className={cn("border rounded-xl p-4", cardBgClass)}>
          <p className="text-2xl font-bold text-purple-400">{levelCounts.super_admin}</p>
          <p className={cn("text-xs mt-1", cardSubtextClass)}>Super Admin</p>
        </div>
        <div className={cn("border rounded-xl p-4", cardBgClass)}>
          <p className="text-2xl font-bold text-blue-400">{levelCounts.admin}</p>
          <p className={cn("text-xs mt-1", cardSubtextClass)}>Admin</p>
        </div>
        <div className={cn("border rounded-xl p-4", cardBgClass)}>
          <p className="text-2xl font-bold text-green-400">{levelCounts.petugas}</p>
          <p className={cn("text-xs mt-1", cardSubtextClass)}>Petugas</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", cardSubtextClass)} />
          <input
            type="text"
            placeholder="Cari nama, username, atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn("w-full pl-9 pr-4 py-2 rounded-lg border text-sm focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-colors", inputBg)}
          />
        </div>
        <div className="relative">
          <Filter className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", cardSubtextClass)} />
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className={cn("pl-9 pr-8 py-2 rounded-lg border text-sm appearance-none cursor-pointer focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-colors", selectBg)}
          >
            <option value="">Semua Level</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="petugas">Petugas</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className={cn("border rounded-xl overflow-hidden", cardBgClass)}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={cn("border-b text-left", tableHeaderBg, tableBorder)}>
                <th className={cn("px-4 py-3 font-medium whitespace-nowrap", tableHeaderText)}>Nama</th>
                <th className={cn("px-4 py-3 font-medium whitespace-nowrap", tableHeaderText)}>Username</th>
                <th className={cn("px-4 py-3 font-medium whitespace-nowrap", tableHeaderText)}>Email</th>
                <th className={cn("px-4 py-3 font-medium whitespace-nowrap", tableHeaderText)}>Level</th>
                <th className={cn("px-4 py-3 font-medium whitespace-nowrap", tableHeaderText)}>Kantor</th>
                <th className={cn("px-4 py-3 font-medium whitespace-nowrap text-center", tableHeaderText)}>2FA</th>
                <th className={cn("px-4 py-3 font-medium whitespace-nowrap", tableHeaderText)}>Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const levelCfg = levelConfig[user.level] || levelConfig.petugas;
                const LevelIcon = levelCfg.icon;
                return (
                  <tr
                    key={user.id}
                    className={cn("border-b transition-colors", tableBorder, tableRowHover)}
                  >
                    <td className="px-4 py-3">
                      <span className={cn("font-medium", cardTextClass)}>{user.nama}</span>
                    </td>
                    <td className={cn("px-4 py-3 font-mono text-xs", cardTextClass)}>
                      {user.username}
                    </td>
                    <td className={cn("px-4 py-3", cardSubtextClass)}>
                      {user.email || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
                        levelCfg.color
                      )}>
                        <LevelIcon className="h-3 w-3" />
                        {levelCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.kantor_nama ? (
                        <span className="flex items-center gap-1">
                          <Building2 className={cn("h-3 w-3", cardSubtextClass)} />
                          <span className={cardSubtextClass}>{user.kantor_nama}</span>
                        </span>
                      ) : (
                        <span className={cn("text-xs italic", cardSubtextClass)}>Sistem</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {Number(user.twofa_enabled) ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full">
                          <Shield className="h-3 w-3" /> Aktif
                        </span>
                      ) : (
                        <span className={cn("inline-flex items-center gap-1 text-xs", cardSubtextClass)}>
                          <ShieldOff className="h-3 w-3" /> Nonaktif
                        </span>
                      )}
                    </td>
                    <td className={cn("px-4 py-3 text-xs", cardSubtextClass)}>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.created_at).toLocaleDateString("id-ID", {
                          year: "numeric", month: "short", day: "numeric"
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Users className={cn("h-8 w-8 mx-auto mb-2", cardSubtextClass)} />
                    <p className={cn("text-sm", cardSubtextClass)}>
                      {search || filterLevel ? "Tidak ada user yang cocok dengan filter" : "Belum ada user terdaftar"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <p className={cn("text-xs text-center", cardSubtextClass)}>
        Menampilkan {filtered.length} dari {list.length} user
        {(search || filterLevel) && " (difilter)"}
      </p>
    </div>
  );
}
