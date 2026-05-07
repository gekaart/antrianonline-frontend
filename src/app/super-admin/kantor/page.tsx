"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Building2, Users, Activity, MapPin, Hash, Calendar } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface Kantor {
  id: number;
  nama: string;
  alias: string;
  alamat: string | null;
  total_admin: number;
  total_petugas: number;
  antrian_hari_ini: number;
  created_at: string;
}

export default function SuperAdminKantorPage() {
  const [list, setList] = useState<Kantor[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    api.get<Kantor[]>("/api/super-admin/kantor")
      .then(setList)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cardBgClass = isDark ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200";
  const cardTextClass = isDark ? "text-white" : "text-gray-900";
  const cardSubtextClass = isDark ? "text-gray-400" : "text-gray-600";
  const tableHeaderBg = isDark ? "bg-gray-800" : "bg-gray-100";
  const tableHeaderText = isDark ? "text-gray-300" : "text-gray-600";
  const tableBorder = isDark ? "border-gray-800" : "border-gray-200";
  const tableRowHover = isDark ? "hover:bg-gray-800" : "hover:bg-gray-100";
  const badgeBg = isDark ? "bg-purple-900/50 text-purple-300" : "bg-purple-100 text-purple-700";

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 bg-purple-600 rounded-2xl flex items-center justify-center">
          <Building2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className={cn("text-2xl font-bold", cardTextClass)}>Kelola Kantor</h1>
          <p className={cn("text-sm", cardSubtextClass)}>
            {list.length} kantor terdaftar
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={cn("border rounded-xl p-5", cardBgClass)}>
          <p className={cn("text-3xl font-bold", cardTextClass)}>{list.length}</p>
          <p className={cn("text-sm mt-1", cardSubtextClass)}>Total Kantor</p>
        </div>
        <div className={cn("border rounded-xl p-5", cardBgClass)}>
          <p className={cn("text-3xl font-bold", cardTextClass)}>
            {list.reduce((sum, k) => sum + k.total_admin, 0)}
          </p>
          <p className={cn("text-sm mt-1", cardSubtextClass)}>Total Admin</p>
        </div>
        <div className={cn("border rounded-xl p-5", cardBgClass)}>
          <p className={cn("text-3xl font-bold", cardTextClass)}>
            {list.reduce((sum, k) => sum + k.total_petugas, 0)}
          </p>
          <p className={cn("text-sm mt-1", cardSubtextClass)}>Total Petugas</p>
        </div>
      </div>

      {/* Kantor Table */}
      <div className={cn("border rounded-xl overflow-hidden", cardBgClass)}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={cn("border-b text-left", tableHeaderBg, tableBorder)}>
                <th className={cn("px-4 py-3 font-medium whitespace-nowrap", tableHeaderText)}>Nama Kantor</th>
                <th className={cn("px-4 py-3 font-medium whitespace-nowrap", tableHeaderText)}>Alias</th>
                <th className={cn("px-4 py-3 font-medium whitespace-nowrap text-center", tableHeaderText)}>Admin</th>
                <th className={cn("px-4 py-3 font-medium whitespace-nowrap text-center", tableHeaderText)}>Petugas</th>
                <th className={cn("px-4 py-3 font-medium whitespace-nowrap text-center", tableHeaderText)}>Antrian Hari Ini</th>
                <th className={cn("px-4 py-3 font-medium whitespace-nowrap", tableHeaderText)}>Alamat</th>
                <th className={cn("px-4 py-3 font-medium whitespace-nowrap", tableHeaderText)}>Dibuat</th>
              </tr>
            </thead>
            <tbody>
              {list.map((kantor) => (
                <tr
                  key={kantor.id}
                  className={cn("border-b transition-colors", tableBorder, tableRowHover)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className={cn("h-4 w-4 flex-shrink-0", isDark ? "text-purple-400" : "text-purple-600")} />
                      <span className={cn("font-medium", cardTextClass)}>{kantor.nama}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono", badgeBg)}>
                      <Hash className="h-3 w-3" />
                      {kantor.alias}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("font-medium", cardTextClass)}>{kantor.total_admin}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("font-medium", cardTextClass)}>{kantor.total_petugas}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                      kantor.antrian_hari_ini > 0
                        ? "bg-green-900/30 text-green-400"
                        : isDark ? "bg-gray-800 text-gray-500" : "bg-gray-100 text-gray-500"
                    )}>
                      <Activity className="h-3 w-3" />
                      {kantor.antrian_hari_ini}
                    </span>
                  </td>
                  <td className={cn("px-4 py-3 max-w-[200px] truncate", cardSubtextClass)}>
                    {kantor.alamat || "-"}
                  </td>
                  <td className={cn("px-4 py-3 text-xs", cardSubtextClass)}>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(kantor.created_at).toLocaleDateString("id-ID", {
                        year: "numeric", month: "short", day: "numeric"
                      })}
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Building2 className={cn("h-8 w-8 mx-auto mb-2", cardSubtextClass)} />
                    <p className={cn("text-sm", cardSubtextClass)}>Belum ada kantor terdaftar</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
