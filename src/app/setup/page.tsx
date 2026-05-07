"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toast";
import { Building2, X } from "lucide-react";

const TOS_CONTENT = {
  title: "Syarat dan Ketentuan & Kebijakan Privasi",
  sections: [
    {
      heading: "1. Penerimaan Ketentuan",
      text: "Dengan mendaftar dan menggunakan aplikasi Antrian Online, Anda dianggap telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan serta kebijakan privasi yang berlaku."
    },
    {
      heading: "2. Deskripsi Layanan",
      text: "Antrian Online adalah sistem manajemen antrian berbasis web yang memungkinkan institusi atau kantor untuk mengelola antrian pengunjung secara digital. Layanan mencakup pengambilan nomor antrian, pemanggilan nomor, pemantauan antrian secara real-time, serta fitur pendukung lainnya."
    },
    {
      heading: "3. Pendaftaran Akun",
      text: "Pengguna wajib memberikan informasi yang benar, lengkap, dan akurat saat mendaftar. Setiap pengguna hanya diperbolehkan memiliki satu akun administrator per kantor. Pengguna bertanggung jawab penuh atas keamanan kredensial akun (username dan password)."
    },
    {
      heading: "4. Tanggung Jawab Pengguna",
      text: "Pengguna setuju untuk tidak menyalahgunakan layanan untuk tujuan ilegal atau melanggar hukum. Pengguna bertanggung jawab atas semua aktivitas yang terjadi dalam akunnya. Pengguna wajib menjaga kerahasiaan data login dan segera melaporkan jika terjadi akses tidak sah."
    },
    {
      heading: "5. Data Pengunjung",
      text: "Data pengunjung yang dikumpulkan (nama, NIK, nomor telepon, dan data tambahan lainnya) hanya digunakan untuk keperluan manajemen antrian. Pengguna (institusi) bertanggung jawab untuk memastikan kepatuhan terhadap peraturan perlindungan data yang berlaku."
    },
    {
      heading: "6. Kebijakan Privasi",
      text: "Kami menghormati privasi pengguna dan pengunjung. Informasi pribadi tidak akan dijual, disewakan, atau dibagikan kepada pihak ketiga tanpa persetujuan, kecuali diwajibkan oleh hukum. Data disimpan dengan standar keamanan yang wajar untuk mencegah akses tidak sah."
    },
    {
      heading: "7. Penggunaan Cookie & Teknologi",
      text: "Aplikasi menggunakan cookie dan token berbasis JWT untuk otentikasi dan manajemen sesi. Cookie disimpan di peramban pengguna untuk mempertahankan status login dan preferensi. Pengguna dapat mengatur preferensi cookie melalui pengaturan peramban."
    },
    {
      heading: "8. Hak Kekayaan Intelektual",
      text: "Seluruh kode, desain, fitur, dan konten aplikasi adalah milik pengembang dan dilindungi oleh hak cipta. Pengguna tidak diperkenankan menyalin, memodifikasi, mendistribusikan, atau menjual kembali aplikasi tanpa izin tertulis."
    },
    {
      heading: "9. Pembatasan Tanggung Jawab",
      text: "Aplikasi disediakan 'sebagaimana adanya'. Pengembang tidak bertanggung jawab atas kerugian langsung maupun tidak langsung yang timbul dari penggunaan aplikasi, termasuk namun tidak terbatas pada kehilangan data atau gangguan layanan."
    },
    {
      heading: "10. Pemeliharaan & Ketersediaan",
      text: "Pengembang berhak melakukan pemeliharaan, pembaruan, atau perubahan pada aplikasi tanpa pemberitahuan sebelumnya. Pengembang akan berusaha semaksimal mungkin untuk menjaga ketersediaan layanan tetapi tidak menjamin ketersediaan tanpa gangguan."
    },
    {
      heading: "11. Penghentian Layanan",
      text: "Pengembang berhak menangguhkan atau menghentikan akses pengguna jika terjadi pelanggaran terhadap ketentuan ini. Pengguna dapat menghentikan penggunaan layanan kapan saja dengan menghubungi pengembang."
    },
    {
      heading: "12. Perubahan Ketentuan",
      text: "Syarat dan ketentuan dapat diperbarui sewaktu-waktu. Perubahan akan diumumkan melalui aplikasi. Pengguna disarankan untuk meninjau ketentuan secara berkala. Penggunaan lanjutan setelah perubahan berarti menyetujui ketentuan yang diperbarui."
    }
  ]
};

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [agreeTos, setAgreeTos] = useState(false);
  const [showTosModal, setShowTosModal] = useState(false);
  const [form, setForm] = useState({
    nama_kantor: "",
    alamat: "",
    nama_admin: "",
    username: "",
    email: "",
    password: "",
    password_confirm: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.password_confirm) {
      toast({ title: "Password tidak cocok", variant: "destructive" });
      return;
    }
    if (!agreeTos) {
      toast({ title: "Anda harus menyetujui Syarat & Ketentuan dan Kebijakan Privasi", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/api/setup/register", {
        nama_kantor: form.nama_kantor,
        alamat: form.alamat,
        nama_admin: form.nama_admin,
        username: form.username,
        email: form.email,
        password: form.password,
      });
      toast({ title: "Registrasi berhasil! Silahkan login.", variant: "success" });
      setTimeout(() => router.push("/admin/login"), 1500);
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast({ title: error?.message || "Registrasi gagal", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <Building2 className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Registrasi Antrian Online</h1>
            <p className="text-gray-500 mt-1">Daftarkan instansi dan admin untuk mulai menggunakan aplikasi</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Kantor & Admin</CardTitle>
              <CardDescription>Isi data berikut untuk registrasi akun antrian online</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nama_kantor">Nama Kantor *</Label>
                  <Input
                    id="nama_kantor"
                    name="nama_kantor"
                    placeholder="Dinas Kependudukan dan Pencatatan Sipil"
                    value={form.nama_kantor}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alamat">Alamat Kantor</Label>
                  <Input
                    id="alamat"
                    name="alamat"
                    placeholder="Jl. Contoh No. 1, Kota"
                    value={form.alamat}
                    onChange={handleChange}
                  />
                </div>

                <hr className="my-2" />
                <p className="text-sm font-semibold text-gray-700">Akun Administrator</p>

                <div className="space-y-2">
                  <Label htmlFor="nama_admin">Nama Admin *</Label>
                  <Input
                    id="nama_admin"
                    name="nama_admin"
                    placeholder="Nama lengkap admin"
                    value={form.nama_admin}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="admin"
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@kantor.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Minimal 8 karakter"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password_confirm">Konfirmasi Password *</Label>
                  <Input
                    id="password_confirm"
                    name="password_confirm"
                    type="password"
                    placeholder="Ulangi password"
                    value={form.password_confirm}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Checkbox TOS */}
                <div className="flex items-start gap-2 py-1">
                  <input
                    id="agree_tos"
                    type="checkbox"
                    checked={agreeTos}
                    onChange={(e) => setAgreeTos(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="agree_tos" className="text-xs text-gray-600 leading-relaxed cursor-pointer select-none">
                    Saya telah membaca dan menyetujui{" "}
                    <button
                      type="button"
                      onClick={() => setShowTosModal(true)}
                      className="text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
                    >
                      Syarat & Ketentuan dan Kebijakan Privasi
                    </button>
                  </label>
                </div>

                <Button type="submit" className="w-full" disabled={loading || !agreeTos}>
                  {loading ? "Menyimpan..." : "Registrasi"}
                </Button>
                <div className="text-center mt-4">
                  <span className="text-sm text-gray-500">Sudah punya akun? </span>
                  <a href="/admin/login" className="text-primary-600 hover:underline font-medium">Kembali ke login</a>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─── TOS Modal ───────────────────────────────────────── */}
      {showTosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
              <h2 className="text-lg font-bold text-gray-900">{TOS_CONTENT.title}</h2>
              <button
                onClick={() => setShowTosModal(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5 text-sm text-gray-700 leading-relaxed">
              <p className="text-gray-500 italic">
                Terakhir diperbarui: Mei 2026
              </p>
              {TOS_CONTENT.sections.map((section, i) => (
                <div key={i}>
                  <h3 className="font-semibold text-gray-900 mb-1">{section.heading}</h3>
                  <p>{section.text}</p>
                </div>
              ))}
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold text-gray-900 mb-1">Kontak</h3>
                <p>
                  Jika Anda memiliki pertanyaan mengenai syarat dan ketentuan ini,
                  silakan hubungi pengembang aplikasi melalui email yang terdaftar.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 shrink-0 flex justify-end gap-3">
              <button
                onClick={() => setShowTosModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => { setAgreeTos(true); setShowTosModal(false); }}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Setujui & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
