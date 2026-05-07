"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Save, ImagePlus } from "lucide-react";

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Jakarta',   label: 'WIB — Jakarta, Sumatera, Kalimantan Barat/Tengah (UTC+7)' },
  { value: 'Asia/Makassar',  label: 'WITA — Makassar, Bali, Kalimantan Selatan/Timur (UTC+8)' },
  { value: 'Asia/Jayapura',  label: 'WIT — Jayapura, Maluku, Papua (UTC+9)' },
  { value: 'Asia/Bangkok',   label: 'Bangkok, Hanoi, Ho Chi Minh (UTC+7)' },
  { value: 'Asia/Singapore', label: 'Singapura, Kuala Lumpur (UTC+8)' },
  { value: 'Asia/Manila',    label: 'Manila, Filipina (UTC+8)' },
  { value: 'Asia/Tokyo',     label: 'Tokyo, Jepang (UTC+9)' },
  { value: 'Asia/Seoul',     label: 'Seoul, Korea (UTC+9)' },
  { value: 'Asia/Kolkata',   label: 'Mumbai, Kolkata, India (UTC+5:30)' },
  { value: 'Asia/Dubai',     label: 'Dubai, UAE (UTC+4)' },
  { value: 'Asia/Karachi',   label: 'Karachi, Pakistan (UTC+5)' },
  { value: 'Asia/Dhaka',     label: 'Dhaka, Bangladesh (UTC+6)' },
  { value: 'Asia/Yangon',    label: 'Yangon, Myanmar (UTC+6:30)' },
  { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh City (UTC+7)' },
  { value: 'Asia/Shanghai',  label: 'Shanghai, Beijing, China (UTC+8)' },
  { value: 'Australia/Perth',  label: 'Perth, Australia Barat (UTC+8)' },
  { value: 'Australia/Darwin', label: 'Darwin, Australia Tengah (UTC+9:30)' },
  { value: 'Australia/Sydney', label: 'Sydney, Melbourne, Australia Timur (UTC+10)' },
  { value: 'Pacific/Auckland', label: 'Auckland, Selandia Baru (UTC+12)' },
  { value: 'UTC',            label: 'UTC — Waktu Universal (UTC+0)' },
];

interface Kantor {
  id: number; nama: string; alias: string; alamat: string; logo?: string;
  running_text: string; media_informasi: string;
  field_nama_aktif: boolean; field_nama_wajib: boolean;
  field_nik_aktif: boolean; field_nik_wajib: boolean;
  field_no_hp_aktif: boolean; field_no_hp_wajib: boolean;
  aktif_rating: boolean;
  qr_dinamis: boolean;
  antrian_manual_aktif: boolean;
  antrian_manual_timeout: number;
  waktu_reset?: string;
  timezone?: string;
}

export default function SettingsPage() {
  const [kantor, setKantor] = useState<Kantor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Kantor>>({});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    api.get<Kantor>("/api/admin/kantor")
      .then((k) => { setKantor(k); setForm(k); setLogoPreview(k.logo || null); })
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      let payload: Partial<Kantor> = { ...form };
      // Upload logo first if a new file was chosen
      if (logoFile) {
        const fd = new FormData();
        fd.append("logo", logoFile);
        const result = await api.postForm<{ url: string }>("/api/admin/kantor/logo", fd);
        payload = { ...payload, logo: result.url };
      }
      const updated = await api.put<Kantor>("/api/admin/kantor", payload);
      setKantor(updated);
      setForm(updated);
      setLogoFile(null);
      setLogoPreview(updated.logo || null);
      toast({ title: "Pengaturan berhasil disimpan", variant: "success" });
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast({ title: error?.message || "Gagal menyimpan", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const Toggle = ({ label, field, wajibField }: { label: string; field: keyof Kantor; wajibField?: keyof Kantor }) => (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {wajibField && form[field] && (
          <label className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <input type="checkbox" name={wajibField as string} checked={!!form[wajibField]} onChange={handleChange} className="rounded" />
            Wajib diisi
          </label>
        )}
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input type="checkbox" name={field as string} checked={!!form[field]} onChange={handleChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Kantor</h1>
        <p className="text-gray-500 mt-1">Konfigurasi profil dan pengaturan operasional kantor</p>
      </div>

      {/* ─── Kantor Settings ───────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Profil Kantor</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Kantor</Label>
                <Input id="nama" name="nama" value={form.nama || ""} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alias">Alias (URL slug)</Label>
                <Input id="alias" name="alias" value={form.alias || ""} onChange={handleChange} placeholder="contoh-kantor" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Textarea id="alamat" name="alamat" value={form.alamat || ""} onChange={handleChange} rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Logo Kantor</Label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="h-16 w-16 object-contain rounded border bg-gray-50 p-1" />
                ) : (
                  <div className="h-16 w-16 rounded border bg-gray-100 flex items-center justify-center text-gray-400">
                    <ImagePlus className="h-6 w-6" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG, WebP. Maks 2 MB. Tampil di sidebar admin, header counter, dan halaman antrian pengunjung.</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="running_text">Running Text (Marquee)</Label>
              <Input id="running_text" name="running_text" value={form.running_text || ""} onChange={handleChange} placeholder="Selamat datang..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="media_informasi">URL Media Informasi (YouTube embed)</Label>
              <Input id="media_informasi" name="media_informasi" value={form.media_informasi || ""} onChange={handleChange} placeholder="https://www.youtube.com/embed/..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Reset Nomor Antrian Harian</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="waktu_reset">Jam Reset Otomatis</Label>
                <Input
                  id="waktu_reset"
                  name="waktu_reset"
                  type="time"
                  value={(form.waktu_reset || '00:00:00').substring(0, 5)}
                  onChange={handleChange}
                  className="w-40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Zona Waktu (Timezone)</Label>
                <select
                  id="timezone"
                  name="timezone"
                  value={form.timezone || 'Asia/Jakarta'}
                  onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Nomor antrian yang tersisa akan direset dan dinomori ulang mulai dari 001 setiap hari pada jam yang ditentukan, menggunakan zona waktu yang dipilih (bukan waktu server).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Fitur Tambahan</CardTitle></CardHeader>
          <CardContent>
            <Toggle label="Aktifkan Rating Layanan" field="aktif_rating" />
            <div className="flex items-start justify-between py-3 border-b last:border-0">
              <div>
                <p className="text-sm font-medium">QR Code Dinamis</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Kode QR akan berubah setiap hari sehingga scan dari luar lokasi tidak bisa digunakan esok harinya.
                  Jika aktif, modal QR di menu Ruangan menampilkan tombol <em>Buka Halaman QR</em>.
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center ml-4">
                <input
                  type="checkbox"
                  name="qr_dinamis"
                  checked={!!form.qr_dinamis}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-start justify-between py-3 border-b last:border-0">
              <div>
                <p className="text-sm font-medium">Antrian Manual</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Menampilkan tombol <em>Ambil Antrian Manual</em> di halaman QR display.
                  Berguna untuk pengunjung yang tidak memiliki smartphone.
                </p>
                {form.antrian_manual_aktif && (
                  <div className="flex items-center gap-2 mt-2">
                    <label className="text-xs text-gray-500">Auto-tutup (menit):</label>
                    <input
                      type="number"
                      name="antrian_manual_timeout"
                      value={form.antrian_manual_timeout ?? 3}
                      onChange={(e) => setForm((f) => ({ ...f, antrian_manual_timeout: parseInt(e.target.value) || 3 }))}
                      min={1}
                      max={30}
                      className="w-20 h-8 text-xs rounded-md border border-gray-300 px-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
              <label className="relative inline-flex cursor-pointer items-center ml-4 mt-1">
                <input
                  type="checkbox"
                  name="antrian_manual_aktif"
                  checked={!!form.antrian_manual_aktif}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "Menyimpan..." : "Simpan Pengaturan Kantor"}
          </Button>
        </div>
      </form>
    </div>
  );
}
