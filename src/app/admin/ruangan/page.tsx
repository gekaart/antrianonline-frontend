"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Edit2, Trash2, QrCode, Monitor, ExternalLink, Printer, Download } from "lucide-react";

interface JenisLayanan { id: number; nama: string; kode_huruf: string; }
interface Ruangan {
  id: number; nama: string; slug: string; kode_qr: string; jumlah_meja: number;
  jenis_layanan: JenisLayanan[];
}

const emptyForm = { nama: "", jumlah_meja: 1, id_jenis_layanan: [] as number[] };

export default function RuanganPage() {
  const [list, setList] = useState<Ruangan[]>([]);
  const [allJL, setAllJL] = useState<JenisLayanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Ruangan | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [alias, setAlias] = useState("");
  const [qrDinamis, setQrDinamis] = useState(false);

  // QR dialog state
  const [qrOpen, setQrOpen] = useState(false);
  const [qrRuangan, setQrRuangan] = useState<Ruangan | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  async function load() {
    const [r, jl, k] = await Promise.all([
      api.get<Ruangan[]>("/api/admin/ruangan"),
      api.get<JenisLayanan[]>("/api/admin/jenis-layanan"),
      api.get<{ alias: string; qr_dinamis?: boolean }>("/api/admin/kantor"),
    ]);
    setList(r);
    setAllJL(jl);
    setAlias(k.alias);
    setQrDinamis(!!k.qr_dinamis);
  }

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(r: Ruangan) {
    setEditing(r);
    setForm({ nama: r.nama, jumlah_meja: r.jumlah_meja, id_jenis_layanan: r.jenis_layanan?.map((j) => j.id) ?? [] });
    setOpen(true);
  }

  function toggleJL(id: number) {
    setForm((f) => ({
      ...f,
      id_jenis_layanan: f.id_jenis_layanan.includes(id)
        ? f.id_jenis_layanan.filter((v) => v !== id)
        : [...f.id_jenis_layanan, id],
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/api/admin/ruangan/${editing.id}`, form);
      } else {
        await api.post("/api/admin/ruangan", form);
      }
      toast({ title: `Ruangan berhasil ${editing ? "diperbarui" : "ditambahkan"}`, variant: "success" });
      setOpen(false);
      await load();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast({ title: error?.message || "Gagal menyimpan", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus ruangan ini?")) return;
    await api.delete(`/api/admin/ruangan/${id}`);
    toast({ title: "Ruangan dihapus", variant: "success" });
    await load();
  }

  function openQr(r: Ruangan) {
    setQrRuangan(r);
    setQrOpen(true);
  }

  function qrUrl(r: Ruangan) {
    const base = `${window.location.origin}/${alias}/queue/${r.kode_qr}`;
    if (qrDinamis) {
      const d = new Date();
      const ds = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
      return `${base}-${ds}`;
    }
    return base;
  }

  function handlePrint() {
    if (!qrRuangan) return;
    const url = qrUrl(qrRuangan);
    const svg = qrRef.current?.querySelector("svg")?.outerHTML ?? "";
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>QR - ${qrRuangan.nama}</title>
    <style>
      body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
      h2 { font-size: 1.4rem; margin-bottom: 8px; }
      p { color: #555; font-size: 0.85rem; word-break: break-all; margin-bottom: 16px; text-align: center; }
      @media print { button { display: none; } }
    </style></head><body>
    <h2>${qrRuangan.nama}</h2>
    <p>${url}</p>
    ${svg}
    <p style="margin-top:12px">Scan untuk ambil nomor antrian</p>
    <button onclick="window.print()" style="margin-top:16px;padding:8px 16px;cursor:pointer">Cetak</button>
    </body></html>`);
    win.document.close();
  }

  function handleDownload() {
    if (!qrRuangan) return;
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${qrRuangan.slug || qrRuangan.id}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ruangan</h1>
          <p className="text-gray-500 mt-1">Kelola ruangan layanan dan meja</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Tambah Ruangan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((r) => (
          <Card key={r.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{r.nama}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(r)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1">
                {r.jenis_layanan?.map((j) => (
                  <Badge key={j.id} variant="secondary">{j.nama}</Badge>
                ))}
              </div>
              <p className="text-sm text-gray-500">{r.jumlah_meja} meja</p>
              <div className="flex gap-2 pt-1">
                <a
                  href={`/${alias}/monitor/${r.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  <Monitor className="h-3 w-3" /> Monitor
                  <ExternalLink className="h-3 w-3" />
                </a>
                <button
                  onClick={() => openQr(r)}
                  className="flex items-center gap-1 text-xs text-gray-600 hover:underline"
                >
                  <QrCode className="h-3 w-3" /> QR Code
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Ruangan" : "Tambah Ruangan"}</DialogTitle>
            <DialogDescription>
              {editing ? "Perbarui informasi ruangan layanan." : "Isi detail untuk menambah ruangan layanan baru."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama Ruangan</Label>
              <Input value={form.nama} onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} placeholder="Loket 1" />
            </div>
            <div className="space-y-2">
              <Label>Jumlah Meja</Label>
              <Input type="number" min={1} value={form.jumlah_meja} onChange={(e) => setForm((f) => ({ ...f, jumlah_meja: +e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Jenis Layanan</Label>
              <div className="space-y-1 max-h-40 overflow-y-auto border rounded-md p-2">
                {allJL.map((j) => (
                  <label key={j.id} className="flex items-center gap-2 text-sm py-1 cursor-pointer">
                    <input type="checkbox" checked={form.id_jenis_layanan.includes(j.id)} onChange={() => toggleJL(j.id)} />
                    {j.nama} ({j.kode_huruf})
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Code — {qrRuangan?.nama}
            </DialogTitle>
            <DialogDescription>
              {qrDinamis
                ? "QR Dinamis aktif — URL berubah setiap hari."
                : "Scan QR ini untuk mengambil nomor antrian."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div ref={qrRef} className="p-4 bg-white border rounded-xl shadow-inner">
              {qrRuangan && (
                <QRCodeSVG
                  value={qrUrl(qrRuangan)}
                  size={220}
                  includeMargin
                  level="M"
                />
              )}
            </div>
            <p className="text-xs text-gray-500 text-center break-all max-w-xs">
              {qrRuangan ? qrUrl(qrRuangan) : ""}
            </p>
            <p className="text-sm text-gray-600 text-center">
              Scan QR ini untuk mengambil nomor antrian
            </p>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <div className="flex gap-2 justify-center">
              <Button variant="outline" className="gap-2" onClick={handlePrint}>
                <Printer className="h-4 w-4" /> Cetak
              </Button>
              <Button className="gap-2" onClick={handleDownload}>
                <Download className="h-4 w-4" /> Unduh SVG
              </Button>
            </div>
            {qrRuangan && (
              <a
                href={`/${alias}/qr-display/${qrRuangan.kode_qr}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button variant="secondary" className="gap-2 w-full" type="button">
                  <Monitor className="h-4 w-4" /> Buka Halaman QR (Layar)
                </Button>
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
