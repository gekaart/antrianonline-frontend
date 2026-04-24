"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, Star, RotateCcw, FormInput, Eye } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TambahanField { id: number; nama_field: string; kunci_field: string; }

interface PengunjungConfig {
  kantor: {
    field_nama_aktif: boolean;
    field_nik_aktif: boolean;
    field_no_hp_aktif: boolean;
    aktif_rating: boolean;
  };
  tambahan: TambahanField[];
  has_fields: boolean;
}

interface Ruangan { id: number; nama: string; }
interface JenisLayanan { id: number; nama: string; }

interface PengunjungRow {
  id: number;
  nomor_antrian: string;
  nama_pengunjung: string | null;
  nik_pengunjung: string | null;
  no_hp_pengunjung: string | null;
  data_tambahan: Record<string, string>;
  status: string;
  waktu_dipanggil: string | null;
  waktu_dilayani: string | null;
  updated_at: string;
  created_at: string;
  ruangan_nama: string;
  jenis_layanan_nama: string;
  rating_bintang: number | null;
  rating_pesan: string | null;
}

interface PengunjungResponse {
  data: PengunjungRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds < 0) return "-";
  if (seconds < 60) return "< 1 mnt";
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m} mnt`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h} j ${rem} mnt` : `${h} j`;
}

function diffSeconds(a: string | null, b: string | null): number | null {
  if (!a || !b) return null;
  const s = (new Date(b).getTime() - new Date(a).getTime()) / 1000;
  return s >= 0 ? s : null;
}

function formatDatetime(dt: string | null): string {
  if (!dt) return "-";
  const d = new Date(dt);
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
    + " " + d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

function StarRating({ value }: { value: number | null }) {
  if (value === null) return <span className="text-gray-400 text-xs">-</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`h-3.5 w-3.5 ${s <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-2 border-b last:border-0">
      <span className="text-gray-500 text-sm w-36 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800 flex-1">{value ?? "-"}</span>
    </div>
  );
}

function DetailModal({
  row,
  config,
  onClose,
}: {
  row: PengunjungRow | null;
  config: PengunjungConfig | null;
  onClose: () => void;
}) {
  if (!row) return null;
  const kantor = config?.kantor;
  const tambahan = config?.tambahan ?? [];

  const statusLabel: Record<string, string> = {
    menunggu: "Menunggu",
    dipanggil: "Dipanggil",
    dilayani: "Dilayani",
    selesai: "Selesai",
    dilewati: "Dilewati",
    batal: "Batal",
  };

  const waktuLayanan = formatDuration(diffSeconds(row.waktu_dipanggil, row.waktu_dilayani));
  const waktuTunggu = formatDuration(diffSeconds(row.created_at, row.waktu_dipanggil));

  return (
    <Dialog open={!!row} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detail Antrian</DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-0">
          {/* Antrian info */}
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Info Antrian</p>
          <DetailRow label="No. Antrian" value={<Badge variant="outline">{row.nomor_antrian}</Badge>} />
          <DetailRow label="Ruangan" value={row.ruangan_nama} />
          <DetailRow label="Jenis Layanan" value={row.jenis_layanan_nama} />
          <DetailRow label="Status" value={statusLabel[row.status] ?? row.status} />
          <DetailRow label="Tanggal & Jam" value={formatDatetime(row.created_at)} />
          <DetailRow label="Waktu Tunggu" value={waktuTunggu} />
          <DetailRow label="Waktu Layanan" value={waktuLayanan} />
          {kantor?.aktif_rating && (
            <>
              <DetailRow label="Rating" value={<StarRating value={row.rating_bintang} />} />
              {row.rating_pesan && (
                <DetailRow label="Pesan Rating" value={<span className="whitespace-pre-wrap">{row.rating_pesan}</span>} />
              )}
            </>
          )}

          {/* Visitor fields */}
          {(kantor?.field_nama_aktif || kantor?.field_nik_aktif || kantor?.field_no_hp_aktif || tambahan.length > 0) && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-1">Data Pengunjung</p>
              {kantor?.field_nama_aktif && (
                <DetailRow label="Nama" value={row.nama_pengunjung || <span className="text-gray-400">-</span>} />
              )}
              {kantor?.field_nik_aktif && (
                <DetailRow label="NIK" value={row.nik_pengunjung || <span className="text-gray-400">-</span>} />
              )}
              {kantor?.field_no_hp_aktif && (
                <DetailRow label="No. HP" value={row.no_hp_pengunjung || <span className="text-gray-400">-</span>} />
              )}
              {tambahan.map((f) => (
                <DetailRow
                  key={f.kunci_field}
                  label={f.nama_field}
                  value={row.data_tambahan?.[f.kunci_field] || <span className="text-gray-400">-</span>}
                />
              ))}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const EMPTY_FILTER = { nama: "", no_hp: "", id_ruangan: "", id_jenis_layanan: "", dari: "", sampai: "" };

export default function PengunjungPage() {
  const [config, setConfig] = useState<PengunjungConfig | null>(null);
  const [ruanganList, setRuanganList] = useState<Ruangan[]>([]);
  const [jenisList, setJenisList] = useState<JenisLayanan[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [filter, setFilter] = useState(EMPTY_FILTER);
  const [applied, setApplied] = useState(EMPTY_FILTER);
  const [page, setPage] = useState(1);

  const [result, setResult] = useState<PengunjungResponse | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTick, setSearchTick] = useState(0);
  const [selectedRow, setSelectedRow] = useState<PengunjungRow | null>(null);

  // Load config + dropdowns once
  useEffect(() => {
    Promise.all([
      api.get<PengunjungConfig>("/api/admin/pengunjung/config"),
      api.get<Ruangan[]>("/api/admin/ruangan"),
      api.get<JenisLayanan[]>("/api/admin/jenis-layanan"),
    ])
      .then(([cfg, rList, jList]) => {
        setConfig(cfg);
        setRuanganList(rList);
        setJenisList(jList);
      })
      .finally(() => setLoadingConfig(false));
  }, []);

  const fetchData = useCallback(async (f: typeof EMPTY_FILTER, p: number) => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({ page: String(p) });
      if (f.nama)             params.set("nama", f.nama);
      if (f.no_hp)            params.set("no_hp", f.no_hp);
      if (f.id_ruangan)       params.set("id_ruangan", f.id_ruangan);
      if (f.id_jenis_layanan) params.set("id_jenis_layanan", f.id_jenis_layanan);
      if (f.dari)             params.set("dari", f.dari);
      if (f.sampai)           params.set("sampai", f.sampai);
      const data = await api.get<PengunjungResponse>(`/api/admin/pengunjung?${params}`);
      setResult(data);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (!loadingConfig) fetchData(applied, page);
  }, [applied, page, loadingConfig, fetchData, searchTick]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setApplied({ ...filter });
    setSearchTick((t) => t + 1);
  }

  function handleReset() {
    const empty = { ...EMPTY_FILTER };
    setFilter(empty);
    setPage(1);
    setApplied(empty);
    setSearchTick((t) => t + 1);
  }

  if (loadingConfig) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  const kantor = config?.kantor ?? {
    field_nama_aktif: false, field_nik_aktif: false, field_no_hp_aktif: false, aktif_rating: false,
  };

  return (
    <div className="space-y-6 w-full">
      {/* Detail Modal */}
      <DetailModal row={selectedRow} config={config} onClose={() => setSelectedRow(null)} />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Pengunjung</h1>
          <p className="text-gray-500 mt-1">Riwayat antrian dan data pengunjung</p>
        </div>
        <Link href="/admin/field-pengunjung">
          <Button variant="outline" className="gap-2" aria-label="Field Pengunjung">
            <FormInput className="h-4 w-4" />
            <span className="hidden md:inline">Field Pengunjung</span>
          </Button>
        </Link>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader><CardTitle className="text-base">Filter</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {kantor.field_nama_aktif && (
                <div className="space-y-1">
                  <Label htmlFor="f-nama">Nama</Label>
                  <Input
                    id="f-nama"
                    placeholder="Cari nama..."
                    value={filter.nama}
                    onChange={(e) => setFilter((f) => ({ ...f, nama: e.target.value }))}
                  />
                </div>
              )}
              {kantor.field_no_hp_aktif && (
                <div className="space-y-1">
                  <Label htmlFor="f-nohp">No. HP</Label>
                  <Input
                    id="f-nohp"
                    placeholder="Cari no. HP..."
                    value={filter.no_hp}
                    onChange={(e) => setFilter((f) => ({ ...f, no_hp: e.target.value }))}
                  />
                </div>
              )}
              <div className="space-y-1">
                <Label>Ruangan</Label>
                <Select
                  value={filter.id_ruangan || "all"}
                  onValueChange={(v) => setFilter((f) => ({ ...f, id_ruangan: v === "all" ? "" : v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Semua Ruangan" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Ruangan</SelectItem>
                    {ruanganList.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>{r.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Jenis Layanan</Label>
                <Select
                  value={filter.id_jenis_layanan || "all"}
                  onValueChange={(v) => setFilter((f) => ({ ...f, id_jenis_layanan: v === "all" ? "" : v }))}
                >
                  <SelectTrigger><SelectValue placeholder="Semua Jenis" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis Layanan</SelectItem>
                    {jenisList.map((j) => (
                      <SelectItem key={j.id} value={String(j.id)}>{j.nama}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="f-dari">Dari Tanggal</Label>
                <Input id="f-dari" type="date" value={filter.dari}
                  onChange={(e) => setFilter((f) => ({ ...f, dari: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="f-sampai">Sampai Tanggal</Label>
                <Input id="f-sampai" type="date" value={filter.sampai}
                  onChange={(e) => setFilter((f) => ({ ...f, sampai: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button type="submit" className="gap-2"><Search className="h-4 w-4" /> Cari</Button>
              <Button type="button" variant="outline" className="gap-2" onClick={handleReset}>
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Hasil{" "}
            {result && (
              <span className="font-normal text-gray-500 text-sm ml-1">({result.total} data)</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loadingData ? (
            <div className="flex justify-center py-12"><Spinner /></div>
          ) : !result || result.data.length === 0 ? (
            <p className="text-center text-gray-500 py-12 text-sm">Tidak ada data ditemukan</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">#</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">Ruangan / Jenis Layanan</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">No. Antrian</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">Waktu Layanan</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">Waktu Tunggu</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">Tanggal & Jam Antrian</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600 whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {result.data.map((row, i) => (
                    <tr key={row.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500">
                        {(result.page - 1) * result.limit + i + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div className="font-medium">{row.ruangan_nama}</div>
                          <div className="text-gray-500">{row.jenis_layanan_nama}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{row.nomor_antrian}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {formatDuration(diffSeconds(row.waktu_dipanggil, row.waktu_dilayani))}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {formatDuration(diffSeconds(row.created_at, row.waktu_dipanggil))}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {(() => {
                          const map: Record<string, string> = {
                            menunggu: "Menunggu",
                            dipanggil: "Dipanggil",
                            dilayani: "Dilayani",
                            selesai: "Selesai",
                            dilewati: "Dilewati",
                            batal: "Batal",
                          };
                          return <span className="capitalize">{map[row.status] ?? row.status}</span>;
                        })()}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {formatDatetime(row.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="default"
                          size="sm"
                          className="gap-1 bg-blue-600 hover:bg-blue-700 border-blue-600"
                          onClick={() => setSelectedRow(row)}
                        >
                          <Eye className="h-3.5 w-3.5" /> Detail
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {result && result.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-gray-500">
                Halaman {result.page} dari {result.totalPages}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))} className="gap-1">
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                {Array.from({ length: result.totalPages }, (_, idx) => idx + 1)
                  .filter((p) => p === 1 || p === result.totalPages || Math.abs(p - page) <= 2)
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
                    ) : (
                      <Button key={p} variant={page === p ? "default" : "outline"} size="sm"
                        onClick={() => setPage(p as number)}>
                        {p}
                      </Button>
                    )
                  )}
                <Button variant="outline" size="sm" disabled={page >= result.totalPages}
                  onClick={() => setPage((p) => Math.min(result.totalPages, p + 1))} className="gap-1">
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
