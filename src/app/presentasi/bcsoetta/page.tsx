"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Users,
  Clock,
  BarChart3,
  Star,
  CheckCircle,
  AlertTriangle,
  Printer,
  Monitor,
  QrCode,
  Bell,
  ArrowRight,
  ChevronDown,
  Wifi,
  Settings,
  TrendingUp,
  UserCheck,
  ExternalLink,
  Zap,
  Shield,
  Layers,
  Eye,
} from "lucide-react";

// ─── Animation Hook ───────────────────────────────────────────────────────────
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function FadeUp({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const problems = [
  {
    icon: Users,
    title: "Penumpukan di Jam Sibuk",
    desc: "Antrian fisik menumpuk di jam sibuk (siang dan malam) tanpa distribusi merata, menciptakan bottleneck di area registrasi yang mengganggu kenyamanan penumpang.",
    color: "text-red-400",
    border: "border-red-500/20",
    glow: "bg-red-500/5",
    badge: "bg-red-500/10 text-red-400",
    badgeText: "Overcrowding",
  },
  {
    icon: UserCheck,
    title: "Penempatan Petugas Tidak Optimal",
    desc: "Tanpa data real-time jumlah Penumpang, sulit menentukan berapa petugas yang dibutuhkan per shift — menyebabkan over/under staffing.",
    color: "text-orange-400",
    border: "border-orange-500/20",
    glow: "bg-orange-500/5",
    badge: "bg-orange-500/10 text-orange-400",
    badgeText: "Staffing",
  },
  {
    icon: Printer,
    title: "Mesin Antrian Kertas",
    desc: "Mesin cetak kertas berbiaya operasional tinggi, rentan macet, dan tidak ramah lingkungan. Kertas mudah hilang sebelum nomor dipanggil.",
    color: "text-yellow-400",
    border: "border-yellow-500/20",
    glow: "bg-yellow-500/5",
    badge: "bg-yellow-500/10 text-yellow-400",
    badgeText: "Konvensional",
  },
  {
    icon: Clock,
    title: "Tidak Ada Estimasi Waktu",
    desc: "Penumpang tidak tahu perkiraan waktu tunggu sehingga harus terus berada di sekitar loket, tidak bisa melakukan aktivitas lain di bandara.",
    color: "text-rose-400",
    border: "border-rose-500/20",
    glow: "bg-rose-500/5",
    badge: "bg-rose-500/10 text-rose-400",
    badgeText: "Transparansi",
  },
  {
    icon: BarChart3,
    title: "Tidak Ada Data Analitik",
    desc: "Tidak tersedia data historis kunjungan, pola waktu ramai, dan kinerja petugas yang dibutuhkan untuk pengambilan keputusan oleh pejabat.",
    color: "text-pink-400",
    border: "border-pink-500/20",
    glow: "bg-pink-500/5",
    badge: "bg-pink-500/10 text-pink-400",
    badgeText: "Data",
  },
  {
    icon: Eye,
    title: "Pengalaman Penumpang Buruk",
    desc: "Tidak ada informasi status antrian yang transparan, Penumpang merasa tidak nyaman dan tidak pasti kapan mereka akan dilayani.",
    color: "text-purple-400",
    border: "border-purple-500/20",
    glow: "bg-purple-500/5",
    badge: "bg-purple-500/10 text-purple-400",
    badgeText: "UX",
  },
];

const features = [
  {
    icon: QrCode,
    title: "Antrian Digital via QR Code",
    desc: "Penumpang scan QR code lalu ambil nomor antrian dari smartphone. Tanpa menyentuh mesin, tanpa kertas, tanpa antre fisik.",
    color: "text-blue-400",
    border: "border-blue-500/20",
    bg: "bg-blue-500/5",
    badge: "No Paper",
    badgeColor: "bg-blue-500/10 text-blue-400",
  },
  {
    icon: Monitor,
    title: "Monitor Antrian Real-Time",
    desc: "Tampilan monitor di ruang tunggu menampilkan nomor yang sedang dipanggil secara live. Penumpang tahu persis ke counter mana harus datang.",
    color: "text-cyan-400",
    border: "border-cyan-500/20",
    bg: "bg-cyan-500/5",
    badge: "Live Display",
    badgeColor: "bg-cyan-500/10 text-cyan-400",
  },
  {
    icon: UserCheck,
    title: "Dashboard Petugas",
    desc: "Setiap petugas punya dashboard mandiri untuk memanggil, melayani, dan melewati antrian. Seluruh aktivitas terpantau oleh admin.",
    color: "text-green-400",
    border: "border-green-500/20",
    bg: "bg-green-500/5",
    badge: "Counter",
    badgeColor: "bg-green-500/10 text-green-400",
  },
  {
    icon: Bell,
    title: "Notifikasi Instan",
    desc: "HP Penumpang langsung bergetar saat nomor mereka dipanggil — bisa menunggu nyaman di cafe atau area lain tanpa takut ketinggalan.",
    color: "text-yellow-400",
    border: "border-yellow-500/20",
    bg: "bg-yellow-500/5",
    badge: "WebSocket",
    badgeColor: "bg-yellow-500/10 text-yellow-400",
  },
  {
    icon: BarChart3,
    title: "Dashboard Admin & Laporan",
    desc: "Admin memantau antrian aktif, waktu tunggu rata-rata, total Penumpang hari ini, dan kinerja tiap petugas — semua dalam satu layar.",
    color: "text-purple-400",
    border: "border-purple-500/20",
    bg: "bg-purple-500/5",
    badge: "Analytics",
    badgeColor: "bg-purple-500/10 text-purple-400",
  },
  {
    icon: Star,
    title: "Rating & Feedback",
    desc: "Setelah dilayani, Penumpang dapat memberikan bintang dan komentar langsung dari HP. Data ini mendukung evaluasi kualitas layanan berkala.",
    color: "text-orange-400",
    border: "border-orange-500/20",
    bg: "bg-orange-500/5",
    badge: "Feedback",
    badgeColor: "bg-orange-500/10 text-orange-400",
  },
  {
    icon: Layers,
    title: "Multi Ruangan & Layanan",
    desc: "Satu sistem untuk banyak jenis layanan dan ruangan. Setiap layanan dikonfigurasi secara independen sesuai kapasitas dan kebutuhan.",
    color: "text-indigo-400",
    border: "border-indigo-500/20",
    bg: "bg-indigo-500/5",
    badge: "Scalable",
    badgeColor: "bg-indigo-500/10 text-indigo-400",
  },
  {
    icon: Settings,
    title: "Konfigurasi Fleksibel",
    desc: "Admin atur jam operasional, jenis layanan, jumlah counter, dan data Penumpang secara mandiri — tanpa perlu teknisi atau programmer.",
    color: "text-teal-400",
    border: "border-teal-500/20",
    bg: "bg-teal-500/5",
    badge: "No-Code",
    badgeColor: "bg-teal-500/10 text-teal-400",
  },
];

const stats = [
  { value: "0", unit: "Kertas", label: "Antrian bebas cetak", icon: CheckCircle, color: "text-green-400" },
  { value: "< 1s", unit: "", label: "Update real-time via WebSocket", icon: Wifi, color: "text-blue-400" },
  { value: "∞", unit: "Counter", label: "Counter & ruangan tak terbatas", icon: Layers, color: "text-purple-400" },
  { value: "24/7", unit: "", label: "Monitoring otomatis aktif", icon: Shield, color: "text-orange-400" },
];

const steps = [
  {
    no: "01",
    title: "Scan QR Code",
    desc: "Penumpang scan QR code yang terpasang di area registrasi dengan kamera HP.",
    color: "border-blue-500/40 bg-blue-500/10 text-blue-400",
  },
  {
    no: "02",
    title: "Isi Data & Ambil Nomor",
    desc: "Isi nama atau data singkat lainnya, lalu nomor antrian digital diterima di HP.",
    color: "border-cyan-500/40 bg-cyan-500/10 text-cyan-400",
  },
  {
    no: "03",
    title: "Tunggu Dipanggil",
    desc: "Monitor di ruang tunggu dan notifikasi HP memberi tahu saat nomor dipanggil.",
    color: "border-indigo-500/40 bg-indigo-500/10 text-indigo-400",
  },
  {
    no: "04",
    title: "Datang ke Counter",
    desc: "Penumpang menuju counter yang ditentukan dan mendapatkan layanan IMEI.",
    color: "border-green-500/40 bg-green-500/10 text-green-400",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PresentasiBcsoettaPage() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 120);
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function heroStyle(delay: number) {
    return {
      opacity: heroVisible ? 1 : 0,
      transform: heroVisible ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
    };
  }

  return (
    <div className="bg-[#04070f] text-white min-h-screen overflow-x-hidden" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* ── Floating Nav ─────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{ background: scrollY > 60 ? "rgba(4,7,15,0.85)" : "transparent", backdropFilter: scrollY > 60 ? "blur(12px)" : "none", borderBottom: scrollY > 60 ? "1px solid rgba(255,255,255,0.06)" : "none" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm">Antrian Online</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#masalah" className="hover:text-white transition-colors">Masalah</a>
            <a href="#solusi" className="hover:text-white transition-colors">Solusi</a>
            <a href="#fitur" className="hover:text-white transition-colors">Fitur</a>
            <a href="#demo" className="hover:text-white transition-colors">Demo</a>
          </div>
          <Link
            href="/admin/login"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 transition-colors text-white text-sm font-semibold px-4 py-2 rounded-full"
          >
            <Monitor className="h-3.5 w-3.5" /> Demo Admin
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full bg-blue-700/15 blur-[130px] animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[500px] rounded-full bg-indigo-700/12 blur-[110px] animate-pulse" style={{ animationDelay: "1.5s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[300px] rounded-full bg-blue-900/8 blur-[80px]" />
        </div>
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
          <div style={heroStyle(0)}>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 rounded-full px-5 py-2 text-sm text-blue-300 mb-8">
              <Zap className="h-3.5 w-3.5" />
              Presentasi Solusi · Registrasi IMEI · Bandara Soekarno-Hatta
            </div>
          </div>

          <div style={heroStyle(200)}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-6">
              <span className="text-white">Antrian</span>{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #60a5fa 0%, #38bdf8 50%, #818cf8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Digital
              </span>
              <br />
              <span className="text-white text-3xl md:text-5xl lg:text-6xl font-bold opacity-80">
                untuk Pelayanan Lebih Baik
              </span>
            </h1>
          </div>

          <div style={heroStyle(400)}>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Transformasi sistem antrian konvensional menjadi solusi digital yang efisien,
              transparan, dan ramah Penumpang — tanpa kertas, tanpa antre fisik.
            </p>
          </div>

          <div style={heroStyle(600)} className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#masalah"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 transition-all hover:scale-105 px-8 py-4 rounded-full text-white font-bold shadow-lg shadow-blue-600/25"
            >
              Mulai Presentasi <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center gap-2 bg-white/8 hover:bg-white/14 border border-white/15 transition-all hover:scale-105 px-8 py-4 rounded-full text-white font-bold"
            >
              <Monitor className="h-4 w-4" /> Coba Demo Admin <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-30 animate-bounce">
          <ChevronDown className="h-6 w-6" />
        </div>
      </section>

      {/* ── Stats Strip ──────────────────────────────────────────────────── */}
      <section className="py-16 border-y border-white/5 bg-white/[0.015]">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <FadeUp key={i} delay={i * 80}>
                <div className="text-center">
                  <s.icon className={`h-6 w-6 ${s.color} mx-auto mb-3`} />
                  <div className="text-3xl font-black text-white leading-none">
                    {s.value}<span className="text-lg text-slate-500 ml-1">{s.unit}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-2 leading-snug max-w-[140px] mx-auto">{s.label}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Problems ─────────────────────────────────────────────────────── */}
      <section id="masalah" className="py-28 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-5 py-2 text-sm text-red-400 mb-5">
                <AlertTriangle className="h-3.5 w-3.5" /> Tantangan Saat Ini
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Masalah yang{" "}
                <span className="text-red-400">Perlu Diselesaikan</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                Layanan registrasi IMEI di Bandara Soekarno-Hatta menghadapi sejumlah
                tantangan operasional yang berdampak langsung pada kepuasan penumpang.
              </p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {problems.map((p, i) => (
              <FadeUp key={i} delay={i * 70}>
                <div className={`rounded-2xl border ${p.border} ${p.glow} p-6 h-full hover:scale-[1.02] transition-transform duration-300`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-11 w-11 rounded-xl bg-white/5 flex items-center justify-center">
                      <p.icon className={`h-5 w-5 ${p.color}`} />
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.badge}`}>{p.badgeText}</span>
                  </div>
                  <h3 className="font-bold text-white mb-2 text-base">{p.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Solution Bridge ──────────────────────────────────────────────── */}
      <section id="solusi" className="py-12 px-4">
        <FadeUp>
          <div
            className="max-w-4xl mx-auto rounded-3xl p-[1px]"
            style={{ background: "linear-gradient(135deg, rgba(59,130,246,0.4), rgba(99,102,241,0.4), rgba(6,182,212,0.2))" }}
          >
            <div className="rounded-3xl bg-[#070d1a] px-8 py-14 text-center">
              <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-500/25 rounded-full px-5 py-2 text-sm text-blue-300 mb-6">
                <CheckCircle className="h-3.5 w-3.5" /> Solusi Kami
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-5">
                Satu Platform{" "}
                <span style={{ background: "linear-gradient(135deg, #60a5fa, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Terintegrasi
                </span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                Menghubungkan Penumpang, petugas, dan pengampu dalam satu ekosistem digital —
                memberikan pengalaman antrian yang modern, efisien, dan terukur.
              </p>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Cara Kerja</h2>
              <p className="text-slate-500">Proses sederhana dalam 4 langkah</p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-4 gap-5 relative">
            {/* Connector line - desktop */}
            <div className="hidden md:block absolute top-[30px] left-[14%] right-[14%] h-px bg-gradient-to-r from-transparent via-blue-500/25 to-transparent" />

            {steps.map((s, i) => (
              <FadeUp key={i} delay={i * 100}>
                <div className="text-center px-2">
                  <div className={`w-[60px] h-[60px] rounded-2xl border ${s.color} flex items-center justify-center mx-auto mb-4 text-xl font-black`}>
                    {s.no}
                  </div>
                  <h3 className="font-bold text-white mb-2 text-sm">{s.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="fitur" className="py-28 px-4 bg-white/[0.012]">
        <div className="max-w-6xl mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-5 py-2 text-sm text-blue-400 mb-5">
                <Zap className="h-3.5 w-3.5" /> Fitur Lengkap
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                Semua yang{" "}
                <span className="text-blue-400">Anda Butuhkan</span>
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                Platform antrian digital yang dirancang untuk efisiensi operasional
                dan kenyamanan Penumpang dari ujung ke ujung.
              </p>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <FadeUp key={i} delay={i * 55}>
                <div className={`rounded-2xl border ${f.border} ${f.bg} p-5 h-full hover:scale-[1.025] transition-transform duration-300`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <f.icon className={`h-5 w-5 ${f.color}`} />
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${f.badgeColor}`}>{f.badge}</span>
                  </div>
                  <h3 className="font-bold text-white mb-1.5 text-sm">{f.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Before / After ───────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-black text-white text-center mb-12">
              Sebelum vs Sesudah
            </h2>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-6">
            <FadeUp delay={0}>
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-7">
                <div className="text-red-400 font-bold text-sm mb-5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-xs">✕</span>
                  Sebelum (Konvensional)
                </div>
                <ul className="space-y-3 text-slate-400 text-sm">
                  {[
                    "Antre fisik, Penumpang berdiri lama",
                    "Mesin cetak kertas, biaya operasional tinggi",
                    "Tidak ada estimasi waktu tunggu",
                    "Petugas sulit mengatur beban kerja",
                    "Tidak ada data kunjungan & kinerja",
                    "Kepuasan Penumpang sulit diukur",
                  ].map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-red-500 mt-0.5 text-xs">✕</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
            <FadeUp delay={120}>
              <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-7">
                <div className="text-green-400 font-bold text-sm mb-5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-xs">✓</span>
                  Sesudah (Digital)
                </div>
                <ul className="space-y-3 text-slate-300 text-sm">
                  {[
                    "Antrian dari HP, bebas bergerak di bandara",
                    "Tanpa kertas, ramah lingkungan & hemat biaya",
                    "Notifikasi real-time saat nomor dipanggil",
                    "Data real-time bantu optimasi penempatan petugas",
                    "Laporan lengkap untuk pengambilan keputusan",
                    "Rating & feedback langsung dari Penumpang",
                  ].map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Demo CTA ─────────────────────────────────────────────────────── */}
      <section id="demo" className="py-28 px-4">
        <FadeUp>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-5 py-2 text-sm text-green-400 mb-6">
              <TrendingUp className="h-3.5 w-3.5" /> Uji Coba Langsung
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-5">
              Siap untuk{" "}
              <span className="text-green-400">Mencoba?</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Login ke dashboard admin untuk melihat tampilan dan fitur sistem
              antrian online ini secara langsung.
            </p>

            <Link
              href="/admin/login"
              className="inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 transition-all hover:scale-105 px-10 py-5 rounded-full text-white font-bold text-lg shadow-2xl shadow-blue-600/30"
            >
              <Monitor className="h-5 w-5" />
              Masuk ke Dashboard Admin
              <ExternalLink className="h-4 w-4 opacity-70" />
            </Link>

            <p className="text-slate-600 text-sm mt-6">
              Gunakan akun demo yang telah disiapkan untuk sesi presentasi ini
            </p>
          </div>
        </FadeUp>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-slate-500 text-sm font-medium">Antrian Online</span>
          </div>
          <p className="text-slate-600 text-sm text-center">
            Sistem Antrian Digital · Bandara Soekarno-Hatta · Layanan Registrasi IMEI
          </p>
          <Link href="/admin/login" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1.5 transition-colors">
            Demo Admin <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </footer>
    </div>
  );
}
