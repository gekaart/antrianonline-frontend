"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

interface LogReset {
  id: number;
  tipe_reset: string;
  created_at: string;
  user_nama?: string | null;
  data_antrian_terpengaruh: number[] | string;
}

interface PaginatedResponse {
  data: LogReset[];
  total: number;
  page: number;
  per_page: number;
}

export default function LogResetPage() {
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<PaginatedResponse>(`/api/admin/log-reset?page=${page}&per_page=20`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [page]);

  const tipeLabel: Record<string, { label: string; variant: "warning" | "destructive" | "secondary" }> = {
    dilewati: { label: "Dilewati", variant: "warning" },
    kemarin: { label: "Kemarin", variant: "secondary" },
    semua: { label: "Semua", variant: "destructive" },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Log Reset Antrian</h1>
        <p className="text-gray-500 mt-1">Riwayat aktivitas reset antrian oleh petugas</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Riwayat Reset</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {["Waktu", "Petugas", "Tipe Reset", "Antrian Terpengaruh"].map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-gray-500 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map((log) => (
                    <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 px-3 text-gray-600">
                        {new Date(log.created_at).toLocaleString("id-ID")}
                      </td>
                      <td className="py-2 px-3 font-medium">{log.user_nama || "-"}</td>
                      <td className="py-2 px-3">
                        <Badge variant={tipeLabel[log.tipe_reset]?.variant || "secondary"}>
                          {tipeLabel[log.tipe_reset]?.label || log.tipe_reset}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-gray-600">
                        {(() => {
                          const raw = log.data_antrian_terpengaruh;
                          const arr = Array.isArray(raw) ? raw
                            : typeof raw === "string" ? (() => { try { return JSON.parse(raw); } catch { return []; } })()
                            : [];
                          return arr.length > 0 ? `${arr.length} antrian` : "-";
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {data && data.total > data.per_page && (
                <div className="flex items-center justify-between mt-4 text-sm">
                  <p className="text-gray-500">
                    Halaman {data.page} dari {Math.ceil(data.total / data.per_page)}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= Math.ceil(data.total / data.per_page)}
                      className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
