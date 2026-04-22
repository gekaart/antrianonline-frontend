"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from "recharts";
import { Users, Clock, Clock3, Star } from "lucide-react";

interface Stats {
  total: number;
  selesai: number;
  menunggu: number;
  dilewati: number;
  rata_rata_layanan: number;
  rata_rata_tunggu: number;
  avg_rating: number;
  aktif_rating: boolean;
}

interface MejaStatus {
  id: number;
  nomor_meja: number;
  status_tersedia: boolean | number;
  ruangan: { nama: string } | null;
  petugas_aktif?: { nama: string } | null;
  jenis_layanan_names?: string | null;
}

interface FilterOptions {
  ruangan: { id: number; nama: string }[];
  jenis_layanan: { id: number; nama: string }[];
}

interface MonthData { bulan: number; label: string; total: number; }
interface DayData   { hari: number; label: string; total: number; }
interface HourData  { jam: number; total: number; }

export default function DashboardPage() {
  const currentYear = new Date().getFullYear();
  const yearOptions = [currentYear, currentYear - 1, currentYear - 2];

  const [filterTahun, setFilterTahun]         = useState(String(currentYear));
  const [filterRuangan, setFilterRuangan]     = useState("");
  const [filterJenis, setFilterJenis]         = useState("");
  const [stats, setStats]                     = useState<Stats | null>(null);
  const [peakHours, setPeakHours]             = useState<HourData[]>([]);
  const [monthly, setMonthly]                 = useState<MonthData[]>([]);
  const [dailyDrill, setDailyDrill]           = useState<DayData[] | null>(null);
  const [drillMonth, setDrillMonth]           = useState<{ bulan: number; label: string } | null>(null);
  const [hourDrill, setHourDrill]             = useState<HourData[] | null>(null);
  const [drillDay, setDrillDay]               = useState<{ hari: number; label: string } | null>(null);
  const [meja, setMeja]                       = useState<MejaStatus[]>([]);
  const [filterOptions, setFilterOptions]     = useState<FilterOptions>({ ruangan: [], jenis_layanan: [] });
  const [loading, setLoading]                 = useState(true);
  const [drillLoading, setDrillLoading]       = useState(false);
  const [hourLoading, setHourLoading]         = useState(false);

  const buildQuery = useCallback(() => {
    const p = new URLSearchParams();
    p.set("tahun", filterTahun);
    if (filterRuangan) p.set("id_ruangan", filterRuangan);
    if (filterJenis)   p.set("id_jenis_layanan", filterJenis);
    return `?${p.toString()}`;
  }, [filterTahun, filterRuangan, filterJenis]);

  const loadData = useCallback(async () => {
    const q = buildQuery();
    // meja-status only needs ruangan/jenis filter (not year — it shows current state)
    const mejaP = new URLSearchParams();
    if (filterRuangan) mejaP.set("id_ruangan", filterRuangan);
    if (filterJenis)   mejaP.set("id_jenis_layanan", filterJenis);
    const mejaQ = mejaP.toString() ? `?${mejaP.toString()}` : "";
    try {
      const [s, p, m, mj] = await Promise.all([
        api.get<Stats>(`/api/admin/dashboard/stats${q}`),
        api.get<HourData[]>(`/api/admin/dashboard/peak-hours${q}`),
        api.get<MonthData[]>(`/api/admin/dashboard/monthly${q}`),
        api.get<MejaStatus[]>(`/api/admin/dashboard/meja-status${mejaQ}`),
      ]);
      setStats(s);
      setPeakHours(p);
      setMonthly(m);
      setMeja(mj);
      setDailyDrill(null); setDrillMonth(null);
      setHourDrill(null);  setDrillDay(null);
    } finally {
      setLoading(false);
    }
  }, [buildQuery, filterRuangan, filterJenis]);

  // Load filter options once
  useEffect(() => {
    api.get<FilterOptions>("/api/admin/dashboard/filter-options")
      .then(setFilterOptions)
      .catch(() => {});
  }, []);

  // Reload main data whenever filter changes
  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  async function handleMonthClick(entry: MonthData) {
    setDrillLoading(true);
    setHourDrill(null); setDrillDay(null);
    const q = buildQuery();
    try {
      const data = await api.get<DayData[]>(
        `/api/admin/dashboard/monthly-daily${q}&bulan=${entry.bulan}`
      );
      setDailyDrill(data);
      setDrillMonth({ bulan: entry.bulan, label: entry.label });
    } finally {
      setDrillLoading(false);
    }
  }

  async function handleDayClick(entry: DayData) {
    if (!drillMonth) return;
    setHourLoading(true);
    const q = buildQuery();
    try {
      const data = await api.get<HourData[]>(
        `/api/admin/dashboard/daily-hours${q}&bulan=${drillMonth.bulan}&hari=${entry.hari}`
      );
      setHourDrill(data);
      setDrillDay({ hari: entry.hari, label: entry.label });
    } finally {
      setHourLoading(false);
    }
  }

  const hasFilter = filterTahun !== String(currentYear) || !!filterRuangan || !!filterJenis;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Statistik antrian tahun {filterTahun}</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
        <span className="text-sm font-semibold text-gray-600">Filter:</span>
        {/* Tahun */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">Tahun</label>
          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value)}
          >
            {yearOptions.map((y) => (
              <option key={y} value={String(y)}>{y}</option>
            ))}
          </select>
        </div>
        {/* Ruangan */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">Ruangan</label>
          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterRuangan}
            onChange={(e) => setFilterRuangan(e.target.value)}
          >
            <option value="">Semua Ruangan</option>
            {filterOptions.ruangan.map((r) => (
              <option key={r.id} value={r.id}>{r.nama}</option>
            ))}
          </select>
        </div>
        {/* Jenis Layanan */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">Jenis Layanan</label>
          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
          >
            <option value="">Semua Jenis Layanan</option>
            {filterOptions.jenis_layanan.map((j) => (
              <option key={j.id} value={j.id}>{j.nama}</option>
            ))}
          </select>
        </div>
        {hasFilter && (
          <button
            onClick={() => { setFilterTahun(String(currentYear)); setFilterRuangan(""); setFilterJenis(""); }}
            className="text-xs text-red-600 hover:text-red-700 border border-red-200 rounded-lg px-3 py-1.5 transition-colors hover:bg-red-50"
          >
            Reset Filter
          </button>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Antrian */}
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Antrian</p>
              <p className="text-2xl font-bold">{stats?.total ?? 0}</p>
              <p className="text-xs text-gray-400">Tahun {filterTahun}</p>
            </div>
          </CardContent>
        </Card>

        {/* Avg Waktu Layanan */}
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rata-rata Waktu Layanan</p>
              <p className="text-2xl font-bold">
                {stats?.rata_rata_layanan ? `${Math.round(stats.rata_rata_layanan)} mnt` : "–"}
              </p>
              <p className="text-xs text-gray-400">Dipanggil → Selesai</p>
            </div>
          </CardContent>
        </Card>

        {/* Avg Waktu Tunggu */}
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
              <Clock3 className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rata-rata Waktu Tunggu</p>
              <p className="text-2xl font-bold">
                {stats?.rata_rata_tunggu ? `${Math.round(stats.rata_rata_tunggu)} mnt` : "–"}
              </p>
              <p className="text-xs text-gray-400">Ambil antrian → Dipanggil</p>
            </div>
          </CardContent>
        </Card>

        {/* Rating */}
        <Card className={!stats?.aktif_rating ? "opacity-50" : ""}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Star className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rating Layanan</p>
              {stats?.aktif_rating ? (
                <>
                  <p className="text-2xl font-bold">
                    {stats.avg_rating ? stats.avg_rating.toFixed(1) : "–"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {stats.avg_rating ? "★".repeat(Math.round(stats.avg_rating)) : "Belum ada data"}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-gray-400">–</p>
                  <p className="text-xs text-gray-400">Rating tidak aktif</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 1: Jam Sibuk — Line Chart (yearly) */}
      <Card>
        <CardHeader>
          <CardTitle>Jam Sibuk Sepanjang Tahun {filterTahun}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={peakHours}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="jam"
                tickFormatter={(v) => String(v).padStart(2, "0")}
                tick={{ fontSize: 11 }}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v) => [v, "Antrian"]}
                labelFormatter={(l) => `Jam ${String(l).padStart(2, "0")}`}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Row 2: Monthly Bar Chart */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <CardTitle>Antrian per Bulan — Tahun {filterTahun}</CardTitle>
            <p className="text-sm text-gray-400">Klik batang untuk melihat detail per hari</p>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={monthly}
              style={{ cursor: "pointer" }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v) => [v, "Antrian"]}
                labelFormatter={(l) => `${l} ${filterTahun}`}
              />
              <Bar
                dataKey="total"
                radius={[4, 4, 0, 0]}
                onClick={(entry: MonthData) => handleMonthClick(entry)}
              >
                {monthly.map((entry) => (
                  <Cell
                    key={entry.bulan}
                    fill={drillMonth?.bulan === entry.bulan ? "#1d4ed8" : "#3b82f6"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily drill-down */}
      {(drillLoading || dailyDrill) && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {drillMonth
                  ? `Detail Harian — ${drillMonth.label} ${filterTahun}`
                  : "Memuat..."}
              </CardTitle>
              <button
                onClick={() => { setDailyDrill(null); setDrillMonth(null); setHourDrill(null); setDrillDay(null); }}
                className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1 transition-colors hover:bg-gray-50"
              >
                Tutup ✕
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {drillLoading ? (
              <div className="flex justify-center h-40 items-center">
                <Spinner size="md" />
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-400 mb-2">Klik batang untuk melihat detail per jam</p>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={dailyDrill ?? []} style={{ cursor: "pointer" }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(v) => [v, "Antrian"]}
                      labelFormatter={(l) => `Tgl ${l} ${drillMonth?.label ?? ""} ${filterTahun}`}
                    />
                    <Bar
                      dataKey="total"
                      radius={[4, 4, 0, 0]}
                      onClick={(entry: DayData) => handleDayClick(entry)}
                    >
                      {(dailyDrill ?? []).map((entry) => (
                        <Cell
                          key={entry.hari}
                          fill={drillDay?.hari === entry.hari ? "#065f46" : "#10b981"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Hourly drill-down */}
      {(hourLoading || hourDrill) && drillMonth && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {drillDay
                  ? `Detail Per Jam — ${drillDay.label} ${drillMonth.label} ${filterTahun}`
                  : "Memuat..."}
              </CardTitle>
              <button
                onClick={() => { setHourDrill(null); setDrillDay(null); }}
                className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1 transition-colors hover:bg-gray-50"
              >
                Tutup ✕
              </button>
            </div>
          </CardHeader>
          <CardContent>
            {hourLoading ? (
              <div className="flex justify-center h-40 items-center">
                <Spinner size="md" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={hourDrill ?? []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="jam"
                    tickFormatter={(v) => String(v).padStart(2, "0")}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v) => [v, "Antrian"]}
                    labelFormatter={(l) => `Jam ${String(l).padStart(2, "0")}`}
                  />
                  <Bar dataKey="total" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Meja Status */}
      <Card>
        <CardHeader>
          <CardTitle>Status Meja</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 px-3 text-gray-500 font-medium">Ruangan</th>
                  <th className="py-2 px-3 text-gray-500 font-medium">Meja</th>
                  <th className="py-2 px-3 text-gray-500 font-medium">Status</th>
                  <th className="py-2 px-3 text-gray-500 font-medium">Petugas</th>
                  <th className="py-2 px-3 text-gray-500 font-medium">Jenis Layanan</th>
                </tr>
              </thead>
              <tbody>
                {meja.map((m) => {
                  const isOnline = !m.status_tersedia; // status_tersedia=false means occupied/online
                  return (
                    <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 px-3">{m.ruangan?.nama ?? "–"}</td>
                      <td className="py-2 px-3">Meja {m.nomor_meja}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isOnline
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"
                            }`}
                          />
                          {isOnline ? "Online" : "Offline"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-600">
                        {m.petugas_aktif?.nama ?? "–"}
                      </td>
                      <td className="py-2 px-3 text-gray-500 text-xs">
                        {m.jenis_layanan_names ?? "–"}
                      </td>
                    </tr>
                  );
                })}
                {meja.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-gray-400">
                      Belum ada data meja
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

