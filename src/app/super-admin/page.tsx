"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from "recharts";
import {
  DollarSign, CreditCard, TrendingDown, CalendarClock,
  TicketCheck, Building2, TrendingUp, Gauge,
  Server, Database, AlertTriangle,
  UserCheck, Ban, Star,
  Clock, Activity, Users, Shield,
  RefreshCw, Heart,
} from "lucide-react";

interface Analytics {
  financial: {
    total_revenue: number;
    active_paid_subscriptions: number;
    free_tier: number;
    suspended: number;
    churned: number;
    churn_rate: number;
    upcoming_renewals: { id: number; nama: string; alias: string; paket: string; harga: number; berakhir: string }[];
  };
  usage: {
    total_tickets: number;
    today_tickets: number;
    top_tenants: { id: number; nama: string; alias: string; total_antrian: number }[];
    user_growth: { tanggal: string; total: number }[];
    avg_response_time_seconds: number;
  };
  health: {
    cpu_usage: number;
    memory_usage: number;
    total_memory: string;
    free_memory: string;
    database_size: string;
    error_logs_24h: { total: number; errors: number; warnings: number };
    uptime: number;
  };
  insights: {
    peak_hours: { jam: number; total: number }[];
    popular_services: { nama: string; total: number }[];
    avg_rating: number;
    total_ratings: number;
  };
  summary: {
    total_kantor: number;
    total_admin: number;
    total_petugas: number;
    antrian_hari_ini: number;
    antrian_menunggu: number;
    pending_verification: number;
  };
}

function StatCard({ icon: Icon, label, value, sub, color, isDark }: {
  icon: any; label: string; value: string | number; sub?: string; color: string; isDark: boolean;
}) {
  const cardBg = isDark ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200";
  const textClass = isDark ? "text-white" : "text-gray-900";
  const subClass = isDark ? "text-gray-400" : "text-gray-600";
  return (
    <div className={cn("border rounded-xl p-4", cardBg)}>
      <div className={cn("p-2 rounded-lg w-fit mb-2", color)}><Icon className="h-4 w-4 text-white" /></div>
      <p className={cn("text-xl font-bold", textClass)}>{value}</p>
      <p className={cn("text-[11px]", subClass)}>{label}</p>
      {sub && <p className="text-[10px] mt-0.5 text-gray-500">{sub}</p>}
    </div>
  );
}

function Section({ title, icon: Icon, color, children, isDark }: {
  title: string; icon: any; color: string; children: React.ReactNode; isDark: boolean;
}) {
  const bg = isDark ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200";
  const textClass = isDark ? "text-white" : "text-gray-900";
  return (
    <div className={cn("border rounded-xl p-5", bg)}>
      <h2 className={cn("text-sm font-semibold mb-4 flex items-center gap-2", textClass)}>
        <div className={cn("p-1.5 rounded-lg", color)}><Icon className="h-3.5 w-3.5 text-white" /></div>
        {title}
      </h2>
      {children}
    </div>
  );
}

function MiniTable({ headers, rows, isDark }: {
  headers: string[]; rows: (string | number | React.ReactNode)[][]; isDark: boolean;
}) {
  const hdrBg = isDark ? "bg-gray-800" : "bg-gray-100";
  const hdrText = isDark ? "text-gray-300" : "text-gray-600";
  const border = isDark ? "border-gray-800" : "border-gray-200";
  const rowHover = isDark ? "hover:bg-gray-800" : "hover:bg-gray-100";
  const cellText = isDark ? "text-gray-300" : "text-gray-700";
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead><tr className={cn("border-b text-left", hdrBg, border)}>
          {headers.map((h, i) => (<th key={i} className={cn("px-2.5 py-2 font-medium whitespace-nowrap", hdrText)}>{h}</th>))}
        </tr></thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={cn("border-b transition-colors", border, rowHover)}>
              {row.map((cell, ci) => (<td key={ci} className={cn("px-2.5 py-2 whitespace-nowrap", cellText)}>{cell}</td>))}
            </tr>
          ))}
          {rows.length === 0 && (<tr><td colSpan={headers.length} className={cn("px-3 py-6 text-center text-xs", cellText)}>Tidak ada data</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { isDark } = useTheme();

  const fetchData = () => {
    setLoading(true);
    api.get<Analytics>("/api/super-admin/analytics")
      .then(setData)
      .catch(console.error)
      .finally(() => { setLoading(false); setLastRefresh(new Date()); });
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { const iv = setInterval(fetchData, 60000); return () => clearInterval(iv); }, []);

  const textClass = isDark ? "text-white" : "text-gray-900";
  const subClass = isDark ? "text-gray-400" : "text-gray-600";
  const chartText = isDark ? "#9ca3af" : "#6b7280";

  if (loading && !data) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className={cn("animate-pulse text-sm", subClass)}>Memuat data dashboard...</div>
    </div>
  );

  const d = data!;
  const uptimeStr = d.health.uptime > 86400
    ? `${Math.floor(d.health.uptime / 86400)}h ${Math.floor((d.health.uptime % 86400) / 3600)}j`
    : d.health.uptime > 3600
    ? `${Math.floor(d.health.uptime / 3600)}j ${Math.floor((d.health.uptime % 3600) / 60)}m`
    : `${Math.floor(d.health.uptime / 60)}m`;

  const peakMap: Record<number, number> = {};
  d.insights.peak_hours.forEach(p => { peakMap[p.jam] = p.total; });
  const peakData = Array.from({ length: 24 }, (_, i) => ({ jam: `${i.toString().padStart(2, '0')}:00`, total: peakMap[i] || 0 }));

  const pieData = [
    { name: 'Gratis', value: d.financial.free_tier, color: '#10b981' },
    { name: 'Berbayar', value: d.financial.active_paid_subscriptions, color: '#8b5cf6' },
    { name: 'Dibekukan', value: d.financial.suspended, color: '#f59e0b' },
    { name: 'Berhenti', value: d.financial.churned, color: '#ef4444' },
  ].filter(p => p.value > 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-purple-600 rounded-xl flex items-center justify-center">
            <Activity className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className={cn("text-lg font-bold", textClass)}>Dashboard Super Admin</h1>
            <p className={cn("text-[11px]", subClass)}>Terakhir: {lastRefresh.toLocaleTimeString("id-ID")} · {d.summary.total_kantor} kantor</p>
          </div>
        </div>
        <button onClick={fetchData} disabled={loading}
          className="flex items-center gap-1 text-[11px] bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50">
          <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} /> Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
        <StatCard icon={Building2} label="Kantor" value={d.summary.total_kantor} color="bg-purple-500" isDark={isDark} />
        <StatCard icon={Users} label="Admin" value={d.summary.total_admin} color="bg-blue-500" isDark={isDark} />
        <StatCard icon={Users} label="Petugas" value={d.summary.total_petugas} color="bg-green-500" isDark={isDark} />
        <StatCard icon={TicketCheck} label="Antrian Hari Ini" value={d.summary.antrian_hari_ini} color="bg-yellow-500" isDark={isDark} />
        <StatCard icon={Activity} label="Menunggu" value={d.summary.antrian_menunggu} color="bg-orange-500" isDark={isDark} />
        <StatCard icon={UserCheck} label="Verifikasi Baru" value={d.summary.pending_verification} color="bg-cyan-500" isDark={isDark} />
      </div>

      {/* 1. Financial & Subscriptions */}
      <Section title="1. Monitoring Finansial & Langganan" icon={DollarSign} color="bg-emerald-600" isDark={isDark}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          <StatCard icon={DollarSign} label="Total Revenue" value={`Rp${(d.financial.total_revenue ?? 0).toLocaleString()}`} color="bg-emerald-500" isDark={isDark} sub={`${d.financial.active_paid_subscriptions} berbayar`} />
          <StatCard icon={CreditCard} label="Paket Berbayar" value={d.financial.active_paid_subscriptions} color="bg-purple-500" isDark={isDark} sub={`${d.financial.free_tier} gratis`} />
          <StatCard icon={TrendingDown} label="Churn Rate" value={`${d.financial.churn_rate}%`} color="bg-red-500" isDark={isDark} sub={`${d.financial.churned} berhenti`} />
          <StatCard icon={CalendarClock} label="Akan Perpanjang" value={d.financial.upcoming_renewals.length} color="bg-amber-500" isDark={isDark} sub="30 hari ke depan" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pieData.length > 0 && (
            <div>
              <p className={cn("text-[11px] font-medium mb-1.5", subClass)}>Distribusi Paket</p>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((e, i) => (<Cell key={i} fill={e.color} />))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div>
            <p className={cn("text-[11px] font-medium mb-1.5", subClass)}>Akan Habis Masa Langganan</p>
            {d.financial.upcoming_renewals.length > 0 ? (
              <MiniTable headers={["Instansi", "Paket", "Harga", "Berakhir"]}
                rows={d.financial.upcoming_renewals.map(r => [
                  <span className="font-medium text-xs">{r.nama}</span>,
                  <span className={cn("capitalize text-xs", r.paket === 'premium' ? 'text-yellow-400' : 'text-blue-400')}>{r.paket}</span>,
                  `Rp${(r.harga || 0).toLocaleString()}`,
                  new Date(r.berakhir).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' }),
                ])} isDark={isDark} />
            ) : <p className={cn("text-xs py-4 text-center", subClass)}>Tidak ada langganan akan berakhir</p>}
          </div>
        </div>
      </Section>

      {/* 2. Global Usage */}
      <Section title="2. Statistik Penggunaan Global" icon={TicketCheck} color="bg-blue-600" isDark={isDark}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          <StatCard icon={TicketCheck} label="Total Tiket Terbit" value={d.usage.total_tickets.toLocaleString()} color="bg-blue-500" isDark={isDark} sub={`+${d.usage.today_tickets} hari ini`} />
          <StatCard icon={Building2} label="Top Tenant" value={d.usage.top_tenants[0]?.nama || "-"} color="bg-indigo-500" isDark={isDark} sub={d.usage.top_tenants[0] ? `${d.usage.top_tenants[0].total_antrian} antrian` : ''} />
          <StatCard icon={TrendingUp} label="Pertumbuhan (7hr)" value={`+${d.usage.user_growth.slice(-7).reduce((s, g) => s + g.total, 0)}`} color="bg-emerald-500" isDark={isDark} />
          <StatCard icon={Gauge} label="Rata-rata Respon" value={`${d.usage.avg_response_time_seconds}s`} color="bg-cyan-500" isDark={isDark} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className={cn("text-[11px] font-medium mb-1.5", subClass)}>Pertumbuhan Instansi (30 hari)</p>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={d.usage.user_growth}>
                <defs><linearGradient id="colorG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
                <XAxis dataKey="tanggal" tick={{ fontSize: 9, fill: chartText }} tickFormatter={(v) => new Date(v).getDate().toString()} />
                <YAxis allowDecimals={false} tick={{ fontSize: 9, fill: chartText }} />
                <Tooltip contentStyle={{ background: isDark ? '#1f2937' : '#fff', border: 'none', borderRadius: 8, fontSize: 11 }} labelFormatter={(v) => new Date(v).toLocaleDateString("id-ID")} />
                <Area type="monotone" dataKey="total" stroke="#8b5cf6" fill="url(#colorG)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className={cn("text-[11px] font-medium mb-1.5", subClass)}>Top 5 High-Volume Tenants</p>
            <MiniTable headers={["#", "Instansi", "Total Antrian"]}
              rows={d.usage.top_tenants.map((t, i) => [
                <span className={cn("font-bold", i === 0 ? "text-yellow-400" : "")}>{i + 1}</span>,
                <span className="font-medium text-xs">{t.nama}</span>,
                <span className="font-mono">{t.total_antrian.toLocaleString()}</span>,
              ])} isDark={isDark} />
          </div>
        </div>
      </Section>

      {/* 3. Technical Health */}
      <Section title="3. Kontrol Infrastruktur & Resource" icon={Server} color="bg-rose-600" isDark={isDark}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
          <StatCard icon={Server} label="CPU" value={`${d.health.cpu_usage}%`} color={d.health.cpu_usage > 80 ? "bg-red-500" : d.health.cpu_usage > 50 ? "bg-yellow-500" : "bg-green-500"} isDark={isDark} />
          <StatCard icon={Database} label="Memory" value={`${d.health.memory_usage}%`} color={d.health.memory_usage > 80 ? "bg-red-500" : d.health.memory_usage > 50 ? "bg-yellow-500" : "bg-green-500"} isDark={isDark} sub={d.health.free_memory} />
          <StatCard icon={Database} label="Database" value={d.health.database_size} color="bg-blue-500" isDark={isDark} />
          <StatCard icon={AlertTriangle} label="Error 24h" value={d.health.error_logs_24h.total} color={d.health.error_logs_24h.errors > 0 ? "bg-red-500" : "bg-green-500"} isDark={isDark} sub={`${d.health.error_logs_24h.errors} error`} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className={cn("text-[11px] font-medium mb-2", subClass)}>Utilisasi Resource</p>
            <div className="space-y-2.5">
              {[
                { label: 'CPU', value: d.health.cpu_usage },
                { label: 'Memory', value: d.health.memory_usage },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span className={subClass}>{item.label}</span>
                    <span className={cn("font-mono", item.value > 80 ? "text-red-400" : item.value > 50 ? "text-yellow-400" : "text-green-400")}>{item.value}%</span>
                  </div>
                  <div className={cn("h-1.5 rounded-full", isDark ? "bg-gray-800" : "bg-gray-200")}>
                    <div className={cn("h-1.5 rounded-full transition-all", item.value > 80 ? "bg-red-500" : item.value > 50 ? "bg-yellow-500" : "bg-green-500")} style={{ width: `${Math.min(item.value, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className={cn("text-[11px] font-medium mb-2", subClass)}>Informasi Sistem</p>
            <div className={cn("space-y-1.5 text-xs", subClass)}>
              {[
                ['Uptime Server', uptimeStr],
                ['Total Memory', d.health.total_memory],
                ['Database Size', d.health.database_size],
                ['CPU Cores', `${d.health.cpu_usage ? navigator?.hardwareConcurrency || 'N/A' : 'N/A'}`],
              ].map(([label, val]) => (
                <div key={label as string} className="flex justify-between py-0.5">
                  <span>{label as string}</span>
                  <span className={textClass}>{val as string}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* 4. National Insights */}
      <Section title="4. Analisis Efisiensi Nasional" icon={Clock} color="bg-indigo-600" isDark={isDark}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className={cn("text-[11px] font-medium mb-1.5", subClass)}>Tren Waktu Tersibuk (30 hari)</p>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={peakData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
                <XAxis dataKey="jam" tick={{ fontSize: 8, fill: chartText }} interval={3} />
                <YAxis tick={{ fontSize: 9, fill: chartText }} />
                <Tooltip contentStyle={{ background: isDark ? '#1f2937' : '#fff', border: 'none', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="total" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className={cn("text-[11px] font-medium mb-1.5", subClass)}>Layanan Terpopuler</p>
            <MiniTable headers={["#", "Layanan", "Total"]}
              rows={d.insights.popular_services.slice(0, 5).map((s, i) => [
                i + 1, <span className="font-medium text-xs">{s.nama}</span>, <span className="font-mono">{s.total.toLocaleString()}</span>,
              ])} isDark={isDark} />
          </div>
          <div>
            <p className={cn("text-[11px] font-medium mb-1.5", subClass)}>Kepuasan Pelanggan</p>
            <div className={cn("border rounded-xl p-4 text-center", isDark ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200")}>
              <div className="flex items-center justify-center gap-0.5 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={cn("h-5 w-5", star <= Math.round(d.insights.avg_rating) ? "text-yellow-400 fill-yellow-400" : isDark ? "text-gray-600" : "text-gray-300")} />
                ))}
              </div>
              <p className={cn("text-2xl font-bold", textClass)}>{d.insights.avg_rating.toFixed(1)}</p>
              <p className={cn("text-[11px]", subClass)}>dari {d.insights.total_ratings} rating</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <p className={cn("text-[10px] text-center", subClass)}>
        Auto-refresh setiap 60 detik · {d.summary.total_kantor} kantor · {d.usage.total_tickets.toLocaleString()} total tiket
      </p>
    </div>
  );
}
