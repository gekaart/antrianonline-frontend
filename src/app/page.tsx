"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Clock,
  BarChart3,
  QrCode,
  Monitor,
  Users,
  Star,
  CheckCircle2,
  ArrowRight,
  Building2,
  Smartphone,
  RefreshCw,
  Menu,
  X,
  Zap,
  Shield,
} from "lucide-react";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <div>
      <header className="fixed top-0 left-0 w-full z-30 bg-white/80 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">
                Antri<span className="text-primary-600">Online</span>
              </span>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#fitur" className="text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium">
                Fitur
              </a>
              <a href="#cara-kerja" className="text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium">
                Cara Kerja
              </a>
              <a href="#harga" className="text-gray-600 hover:text-primary-600 transition-colors text-sm font-medium">
                Harga
              </a>
            </nav>

            {/* CTA buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/admin/login"
                className="px-4 py-2 text-sm font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/setup"
                className="px-4 py-2 text-sm font-medium text-primary-50 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
              >
                Daftar Gratis
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-md text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
            <a href="#fitur" className="block text-gray-600 hover:text-primary-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Fitur
            </a>
            <a href="#cara-kerja" className="block text-gray-600 hover:text-primary-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Cara Kerja
            </a>
            <a href="#harga" className="block text-gray-600 hover:text-primary-600 font-medium" onClick={() => setMobileMenuOpen(false)}>
              Harga
            </a>
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/admin/login" className="block text-center py-2 text-primary-600 font-medium border border-primary-600 rounded-lg">
                Login
              </Link>
              <Link href="/setup" className="block text-center py-2 text-primary-50 bg-primary-600 rounded-lg font-medium">
                Daftar Gratis
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="pt-28 pb-20 bg-gradient-to-br from-primary-950 via-primary-800 to-primary-600 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-primary-100 text-sm px-4 py-1.5 rounded-full mb-8 backdrop-blur">
            <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
            Dipercaya 50+ instansi di seluruh Indonesia
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Antrian Digital{" "}
            <span className="text-primary-200">Tanpa Ribet</span>
          </h1>
          <p className="text-primary-100 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Kelola antrian pelayanan secara digital. Pengunjung ambil nomor via QR Code,
            petugas layani dari dashboard, dan monitor antrian tampil real-time di layar tunggu.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              href="/setup"
              className="flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 transition-colors shadow-lg text-lg"
            >
              Mulai Gratis Sekarang
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#cara-kerja"
              className="flex items-center gap-2 px-8 py-4 bg-white/10 text-primary-100 font-medium rounded-xl hover:bg-white/20 transition-colors text-lg backdrop-blur"
            >
              Lihat Cara Kerja
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { value: "50+", label: "Instansi" },
              { value: "10rb+", label: "Antrian/hari" },
              { value: "99.9%", label: "Uptime" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-2xl p-4 backdrop-blur">
                <div className="text-2xl font-bold text-primary-50">{s.value}</div>
                <div className="text-primary-200 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Semua yang Anda Butuhkan</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Fitur lengkap untuk pengelolaan antrian modern yang efisien dan profesional
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: QrCode,
                title: "QR Code Antrian",
                desc: "Pengunjung scan QR Code di lokasi untuk ambil nomor antrian langsung dari smartphone. Tanpa aplikasi, tanpa kertas.",
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: Monitor,
                title: "Monitor Real-Time",
                desc: "Layar monitor antrian yang dipasang di ruang tunggu. Update otomatis saat nomor dipanggil.",
                color: "bg-purple-50 text-purple-600",
              },
              {
                icon: BarChart3,
                title: "Dashboard Analytics",
                desc: "Pantau statistik antrian harian, rata-rata waktu tunggu, dan performa pelayanan dari satu dashboard.",
                color: "bg-green-50 text-green-600",
              },
              {
                icon: Users,
                title: "Multi Petugas & Meja",
                desc: "Kelola beberapa petugas dan meja layanan sekaligus. Setiap petugas punya akses counter masing-masing.",
                color: "bg-orange-50 text-orange-600",
              },
              {
                icon: Building2,
                title: "Multi Kantor",
                desc: "Satu platform untuk banyak cabang. Setiap kantor punya data dan konfigurasi tersendiri.",
                color: "bg-pink-50 text-pink-600",
              },
              {
                icon: Star,
                title: "Rating & Feedback",
                desc: "Kumpulkan penilaian kepuasan pengunjung setelah dilayani. Tingkatkan kualitas pelayanan secara berkelanjutan.",
                color: "bg-yellow-50 text-yellow-600",
              },
              {
                icon: RefreshCw,
                title: "Auto Reset Harian",
                desc: "Nomor antrian otomatis reset setiap hari atau bisa direset manual kapan saja sesuai kebutuhan.",
                color: "bg-teal-50 text-teal-600",
              },
              {
                icon: Smartphone,
                title: "Tanpa Install Aplikasi",
                desc: "Pengunjung cukup scan QR Code dengan kamera HP. Tidak perlu download aplikasi apapun.",
                color: "bg-indigo-50 text-indigo-600",
              },
              {
                icon: Clock,
                title: "Estimasi Waktu Tunggu",
                desc: "Sistem menampilkan estimasi waktu tunggu agar pengunjung bisa memperkirakan giliran mereka.",
                color: "bg-red-50 text-red-600",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className={`inline-flex p-3 rounded-xl ${f.color} mb-4`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="cara-kerja" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Cara Kerja</h2>
            <p className="text-gray-500 text-lg">Implementasi dalam hitungan menit</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Daftar & Setup",
                desc: "Buat akun, isi data kantor, buat ruangan dan jenis layanan sesuai kebutuhan Anda.",
              },
              {
                step: "02",
                title: "Pasang QR Code",
                desc: "Cetak QR Code dan pasang di meja resepsionis atau pintu masuk ruang layanan.",
              },
              {
                step: "03",
                title: "Pengunjung Antri",
                desc: "Pengunjung scan QR Code dan ambil nomor antrian langsung dari HP mereka.",
              },
              {
                step: "04",
                title: "Petugas Melayani",
                desc: "Petugas panggil antrian dari counter, monitor di ruang tunggu update otomatis.",
              },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-primary-100 z-0 -translate-x-4" />
                )}
                <div className="relative z-10">
                  <div className="h-16 w-16 rounded-2xl bg-primary-600 text-red text-xl font-bold flex items-center justify-center mb-4 shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits / Use cases */}
      <section className="py-20 bg-primary-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                Cocok untuk Berbagai{" "}
                <span className="text-primary-300">Jenis Layanan</span>
              </h2>
              <p className="text-primary-200 text-lg mb-8 leading-relaxed">
                AntriOnline dirancang fleksibel untuk berbagai sektor pelayanan publik maupun swasta.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Puskesmas & Klinik",
                  "Kantor Desa / Kelurahan",
                  "Bank & Koperasi",
                  "Kantor Pemerintahan",
                  "BPJS & Asuransi",
                  "Toko & Minimarket",
                  "Bengkel & Servis",
                  "Layanan Lainnya",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-primary-100">
                    <CheckCircle2 className="h-5 w-5 text-primary-400 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Hemat Kertas", value: "100%", sub: "Tanpa cetak tiket fisik" },
                { label: "Lebih Cepat", value: "3x", sub: "Proses pelayanan" },
                { label: "Kepuasan", value: "95%", sub: "Rating pengunjung" },
                { label: "Implementasi", value: "<1 Jam", sub: "Langsung bisa pakai" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/10 rounded-2xl p-6 text-center backdrop-blur">
                  <div className="text-3xl font-bold text-primary-50 mb-1">{stat.value}</div>
                  <div className="text-primary-200 font-medium text-sm">{stat.label}</div>
                  <div className="text-primary-400 text-xs mt-1">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="harga" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Harga Terjangkau</h2>
            <p className="text-gray-500 text-lg">Mulai gratis, upgrade sesuai kebutuhan</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            {[
              {
                name: "Starter",
                price: "Gratis",
                period: "",
                desc: "Untuk mencoba dan instansi kecil",
                features: ["1 Kantor", "3 Ruangan", "5 Petugas", "QR Code Antrian", "Monitor Display", "Support Email"],
                cta: "Mulai Gratis",
                highlight: false,
              },
              {
                name: "Pro",
                price: "Rp 299rb",
                period: "/bulan",
                desc: "Untuk instansi yang berkembang",
                features: [
                  "Unlimited Kantor",
                  "Unlimited Ruangan",
                  "Unlimited Petugas",
                  "Semua fitur Starter",
                  "Analytics Lanjutan",
                  "Priority Support",
                ],
                cta: "Coba 14 Hari Gratis",
                highlight: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "",
                desc: "Untuk organisasi besar",
                features: ["On-premise / SaaS", "Custom Domain", "Integrasi API", "White Label", "Dedicated Support", "SLA Guarantee"],
                cta: "Hubungi Kami",
                highlight: false,
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 flex flex-col ${
                  plan.highlight
                    ? "bg-primary-600 text-primary-50 shadow-2xl scale-105 ring-4 ring-primary-200"
                    : "bg-white border border-gray-200 shadow-sm"
                }`}
              >
                <div className={`text-sm font-semibold mb-2 ${plan.highlight ? "text-primary-200" : "text-gray-500"}`}>
                  {plan.name}
                </div>
                <div className="mb-1 flex items-end gap-1">
                  <span className={`text-4xl font-bold ${plan.highlight ? "text-primary-50" : "text-gray-900"}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-base pb-1 ${plan.highlight ? "text-primary-200" : "text-gray-500"}`}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className={`text-sm mb-6 ${plan.highlight ? "text-primary-100" : "text-gray-500"}`}>{plan.desc}</p>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle2
                        className={`h-4 w-4 flex-shrink-0 ${plan.highlight ? "text-primary-200" : "text-primary-600"}`}
                      />
                      <span className={plan.highlight ? "text-primary-50" : "text-gray-700"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/setup"
                  className={`block text-center py-3 rounded-xl font-semibold transition-colors ${
                      plan.highlight
                        ? "bg-white text-primary-700 hover:bg-primary-50"
                        : "bg-primary-600 text-primary-50 hover:bg-primary-700"
                    }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Siap Beralih ke Antrian Digital?
          </h2>
          <p className="text-gray-500 text-lg mb-8">Daftar sekarang gratis. Tidak perlu kartu kredit.</p>
          <Link
            href="/setup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-primary-50 font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-lg text-lg"
          >
            Mulai Gratis Sekarang
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
      {/* Footer */}
      <footer className="border-t border-gray-100 py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">AntriOnline</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 AntriOnline. Semua hak dilindungi.</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-primary-600 transition-colors">Privasi</a>
            <a href="#" className="hover:text-primary-600 transition-colors">Syarat</a>
            <a href="#" className="hover:text-primary-600 transition-colors">Kontak</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
