"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface JenisLayanan { id: number; nama: string; kode_huruf: string; status_aktif: boolean; }

export default function JenisLayananPage() {
  const [list, setList] = useState<JenisLayanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<JenisLayanan | null>(null);
  const [form, setForm] = useState({ nama: "", kode_huruf: "", status_aktif: true });
  const [saving, setSaving] = useState(false);

  async function load() {
    setList(await api.get<JenisLayanan[]>("/api/admin/jenis-layanan"));
  }

  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  function openCreate() { setEditing(null); setForm({ nama: "", kode_huruf: "", status_aktif: true }); setOpen(true); }
  function openEdit(j: JenisLayanan) { setEditing(j); setForm({ nama: j.nama, kode_huruf: j.kode_huruf, status_aktif: j.status_aktif }); setOpen(true); }

  async function handleSave() {
    if (!form.nama || !form.kode_huruf) { toast({ title: "Nama dan kode huruf wajib diisi", variant: "destructive" }); return; }
    setSaving(true);
    try {
      if (editing) await api.put(`/api/admin/jenis-layanan/${editing.id}`, form);
      else await api.post("/api/admin/jenis-layanan", form);
      toast({ title: `Jenis layanan ${editing ? "diperbarui" : "ditambahkan"}`, variant: "success" });
      setOpen(false);
      await load();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast({ title: error?.message || "Gagal", variant: "destructive" });
    } finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus jenis layanan ini?")) return;
    await api.delete(`/api/admin/jenis-layanan/${id}`);
    toast({ title: "Dihapus", variant: "success" });
    await load();
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jenis Layanan</h1>
          <p className="text-gray-500 mt-1">Kelola jenis layanan antrian</p>
        </div>
        <Button onClick={openCreate} className="gap-2" aria-label="Tambah Jenis Layanan">
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline">Tambah</span>
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Daftar Jenis Layanan</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Nama</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Kode</th>
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Status</th>
                <th className="py-2 px-3"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((j) => (
                <tr key={j.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium">{j.nama}</td>
                  <td className="py-2 px-3"><Badge variant="secondary">{j.kode_huruf}</Badge></td>
                  <td className="py-2 px-3">
                    <Badge variant={j.status_aktif ? "success" : "secondary"}>{j.status_aktif ? "Aktif" : "Nonaktif"}</Badge>
                  </td>
                  <td className="py-2 px-3">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(j)}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(j.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Jenis Layanan" : "Tambah Jenis Layanan"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama Layanan</Label>
              <Input value={form.nama} onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} placeholder="Pembuatan KTP" />
            </div>
            <div className="space-y-2">
              <Label>Kode Huruf (prefix nomor antrian)</Label>
              <Input value={form.kode_huruf} onChange={(e) => setForm((f) => ({ ...f, kode_huruf: e.target.value.toUpperCase() }))} placeholder="A" maxLength={5} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.status_aktif} onChange={(e) => setForm((f) => ({ ...f, status_aktif: e.target.checked }))} />
              Aktif
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
