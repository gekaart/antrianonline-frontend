"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/toast";
import { toast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { ChevronRight } from "lucide-react";
import Cookies from "js-cookie";

interface JenisLayanan { id: number; nama: string; kode_huruf: string; estimasi_menit: number; }
interface Ruangan {
  id: number;
  nama: string;
  jenis_layanan: JenisLayanan[];
}
interface Kantor {
  nama: string;
  alamat?: string;
  logo?: string | null;
  field_nama_aktif: boolean;
  field_nik_aktif: boolean;
  field_no_hp_aktif: boolean;
}
interface QrData {
  ruangan: Ruangan;
  kantor: Kantor;
  waiting_count: number;
}

interface FieldPengunjung { id: number; nama_field: string; kunci_field: string; wajib_isi: boolean; status_aktif: boolean; urutan: number }

export default function QueueFormPage() {
  const params = useParams<{ alias: string; kodeQr: string }>();
  const router = useRouter();
  const { alias, kodeQr } = params;

  const [data, setData] = useState<QrData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [idJenisLayanan, setIdJenisLayanan] = useState<number>(0);
  const [form, setForm] = useState({ nama: "", nik: "", no_hp: "" });
  const [additional, setAdditional] = useState<Record<string, string>>({});

  const isDev = process.env.NODE_ENV !== 'production';

  useEffect(() => {
    // Check for existing ticket cookie (disabled in development mode)
    if (!isDev) {
      const existing = Cookies.get(`antrian_${kodeQr}`);
      if (existing) {
        router.replace(`/${alias}/antrian/${existing}`);
        return;
      }
    }

    api.get<QrData>(`/api/public/ruangan/kode-qr/${kodeQr}`)
      .then((d) => {
        setData(d);
        if (d.ruangan.jenis_layanan?.length === 1) {
          setIdJenisLayanan(d.ruangan.jenis_layanan[0].id);
        }
        // initialize additional fields state if present
        const fp = (d as any).field_pengunjung as FieldPengunjung[] | undefined;
        if (fp && fp.length > 0) {
          const init: Record<string,string> = {};
          for (const f of fp) init[f.kunci_field] = "";
          setAdditional(init);
        }
      })
      .catch(() => {
        toast({ title: "QR Code tidak valid", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [alias, kodeQr, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idJenisLayanan) {
      toast({ title: "Pilih jenis layanan", variant: "destructive" });
      return;
    }
    // validate required tambahan fields
    const fp = (data as any).field_pengunjung as FieldPengunjung[] | undefined;
    if (fp) {
      for (const f of fp) {
        if (f.wajib_isi && !(additional[f.kunci_field] && additional[f.kunci_field].trim())) {
          toast({ title: `Field ${f.nama_field} wajib diisi`, variant: "destructive" });
          return;
        }
      }
    }
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        id_ruangan: ruangan?.id,
        id_jenis_layanan: idJenisLayanan,
      };
      if (kantor?.field_nama_aktif) body.nama_pengunjung = form.nama;
      if (kantor?.field_nik_aktif) body.nik_pengunjung = form.nik;
      if (kantor?.field_no_hp_aktif) body.no_hp_pengunjung = form.no_hp;
      // include additional fields if any
      if (Object.keys(additional).length > 0) body.data_tambahan = additional;

      const res = await api.post<{ antrian: { id: number }; hash: string }>("/api/public/antrian/take", body);
      // Store ticket hash in cookie (24h) — disabled in development mode
      if (!isDev) {
        Cookies.set(`antrian_${kodeQr}`, res.hash, { expires: 1 });
      }
      router.push(`/${alias}/antrian/${res.hash}`);
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast({ title: error?.message || "Gagal mengambil antrian", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <Spinner size="lg" className="border-t-blue-600" />
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Kode QR tidak valid atau telah kadaluarsa.</p>
    </div>
  );

  // Support two possible response shapes from backend:
  // - { ruangan: { ..., kantor: { ... } }, waiting_count }
  // - { ruangan: {...}, kantor: {...}, waiting_count }
  const ruangan = (data as any).ruangan ?? (data as any);
  const kantor = (data as any).kantor ?? (ruangan as any).kantor ?? null;
  const waiting_count = (data as any).waiting_count ?? 0;
  const needsForm = !!(kantor && (kantor.field_nama_aktif || kantor.field_nik_aktif || kantor.field_no_hp_aktif));

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                {kantor?.logo ? (
                  <img src={kantor.logo} alt="" className="h-full w-full object-contain p-1" />
                ) : (
                  <span className="text-white text-xl font-bold">{(kantor?.nama ?? "?").charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900">{kantor?.nama ?? ""}</h1>
                  {isDev && (
                    <span className="text-xs font-medium bg-orange-100 text-orange-700 border border-orange-300 rounded px-1.5 py-0.5">DEV</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{ruangan?.nama ?? ""}</p>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg px-4 py-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{waiting_count}</div>
              <div className="text-sm text-blue-700">antrian menunggu</div>
            </div>
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">Ambil Antrian</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Jenis Layanan */}
              <div className="space-y-2">
                <Label>Jenis Layanan</Label>
                <div className="space-y-2">
                  {ruangan.jenis_layanan?.map((j) => (
                    <button
                      key={j.id}
                      type="button"
                      onClick={() => setIdJenisLayanan(j.id)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-colors ${
                        idJenisLayanan === j.id
                          ? "border-blue-500 bg-blue-50 text-blue-800"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>
                          <span className="font-bold text-blue-600 mr-2">{j.kode_huruf}</span>
                          {j.nama}
                        </span>
                        {j.estimasi_menit > 0 && (
                          <span className="text-xs text-gray-400">~{j.estimasi_menit} mnt</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Visitor fields */}
              {needsForm && (
                <div className="border-t pt-4 space-y-4">
                  <p className="text-sm text-gray-500">Isi data diri (opsional)</p>
                  {kantor?.field_nama_aktif && (
                    <div className="space-y-1">
                      <Label>Nama</Label>
                      <Input
                        placeholder="Nama lengkap"
                        value={form.nama}
                        onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))}
                      />
                    </div>
                  )}
                  {kantor?.field_nik_aktif && (
                    <div className="space-y-1">
                      <Label>NIK</Label>
                      <Input
                        placeholder="Nomor Induk Kependudukan"
                        maxLength={16}
                        value={form.nik}
                        onChange={(e) => setForm((f) => ({ ...f, nik: e.target.value }))}
                      />
                    </div>
                  )}
                  {kantor?.field_no_hp_aktif && (
                    <div className="space-y-1">
                      <Label>No. HP</Label>
                      <Input
                        type="tel"
                        placeholder="08xx-xxxx-xxxx"
                        value={form.no_hp}
                        onChange={(e) => setForm((f) => ({ ...f, no_hp: e.target.value }))}
                      />
                    </div>
                  )}

                  {/* Additional dynamic fields from backend */}
                  {((data as any).field_pengunjung as FieldPengunjung[] | undefined)?.length > 0 && (
                    <div className="space-y-3">
                      {((data as any).field_pengunjung as FieldPengunjung[]).map((f) => (
                        <div key={f.kunci_field} className="space-y-1">
                          <Label>{f.nama_field}{f.wajib_isi ? ' *' : ''}</Label>
                          <Input
                            placeholder={f.nama_field}
                            value={additional[f.kunci_field] ?? ''}
                            onChange={(e) => setAdditional((a) => ({ ...a, [f.kunci_field]: e.target.value }))}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full gap-2 py-6 text-base"
                disabled={!idJenisLayanan || submitting}
              >
                {submitting ? "Mengambil antrian..." : <>Ambil Nomor Antrian <ChevronRight className="h-5 w-5" /></>}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
