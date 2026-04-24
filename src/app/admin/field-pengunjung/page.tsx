"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Edit2, Trash2, GripVertical, Save, ChevronLeft } from "lucide-react";

interface Field { id: number; nama_field: string; kunci_field: string; wajib_isi: boolean; status_aktif: boolean; urutan: number; }
interface KantorFieldSettings {
  field_nama_aktif: boolean; field_nama_wajib: boolean;
  field_nik_aktif: boolean; field_nik_wajib: boolean;
  field_no_hp_aktif: boolean; field_no_hp_wajib: boolean;
}

export default function FieldPengunjungPage() {
  const [list, setList] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Field | null>(null);
  const [form, setForm] = useState({ nama_field: "", kunci_field: "", wajib_isi: false, status_aktif: true });
  const [saving, setSaving] = useState(false);

  const [kantorSettings, setKantorSettings] = useState<KantorFieldSettings>({
    field_nama_aktif: false, field_nama_wajib: false,
    field_nik_aktif: false, field_nik_wajib: false,
    field_no_hp_aktif: false, field_no_hp_wajib: false,
  });
  const [savingKantor, setSavingKantor] = useState(false);

  async function load() { setList(await api.get<Field[]>("/api/admin/field-pengunjung")); }
  useEffect(() => {
    Promise.all([
      load(),
      api.get<KantorFieldSettings>("/api/admin/kantor"),
    ]).then(([, k]: [void, KantorFieldSettings]) => {
      setKantorSettings({
        field_nama_aktif: k.field_nama_aktif, field_nama_wajib: k.field_nama_wajib,
        field_nik_aktif: k.field_nik_aktif, field_nik_wajib: k.field_nik_wajib,
        field_no_hp_aktif: k.field_no_hp_aktif, field_no_hp_wajib: k.field_no_hp_wajib,
      });
    }).finally(() => setLoading(false));
  }, []);

  async function handleSaveKantor() {
    setSavingKantor(true);
    try {
      await api.put("/api/admin/kantor", kantorSettings);
      toast({ title: "Pengaturan field data pengunjung disimpan", variant: "success" });
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast({ title: error?.message || "Gagal menyimpan", variant: "destructive" });
    } finally { setSavingKantor(false); }
  }

  function openCreate() { setEditing(null); setForm({ nama_field: "", kunci_field: "", wajib_isi: false, status_aktif: true }); setOpen(true); }
  function openEdit(f: Field) { setEditing(f); setForm({ nama_field: f.nama_field, kunci_field: f.kunci_field, wajib_isi: f.wajib_isi, status_aktif: f.status_aktif }); setOpen(true); }

  async function handleSave() {
    setSaving(true);
    try {
      if (editing) await api.put(`/api/admin/field-pengunjung/${editing.id}`, form);
      else await api.post("/api/admin/field-pengunjung", form);
      toast({ title: "Berhasil disimpan", variant: "success" });
      setOpen(false);
      await load();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast({ title: error?.message || "Gagal", variant: "destructive" });
    } finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus field ini?")) return;
    await api.delete(`/api/admin/field-pengunjung/${id}`);
    toast({ title: "Field dihapus", variant: "success" });
    await load();
  }

  async function moveUp(index: number) {
    if (index === 0) return;
    const newList = [...list];
    [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    await saveOrder(newList);
  }

  async function moveDown(index: number) {
    if (index === list.length - 1) return;
    const newList = [...list];
    [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    await saveOrder(newList);
  }

  async function saveOrder(ordered: Field[]) {
    const order = ordered.map((f, i) => ({ id: f.id, urutan: i + 1 }));
    await api.put("/api/admin/field-pengunjung/reorder", { order });
    await load();
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const FieldToggle = ({ label, field, wajibField }: { label: string; field: keyof KantorFieldSettings; wajibField?: keyof KantorFieldSettings }) => (
    <div className="flex items-center justify-between py-3 border-b last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {wajibField && kantorSettings[field] && (
          <label className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <input
              type="checkbox"
              checked={!!kantorSettings[wajibField]}
              onChange={(e) => setKantorSettings((s) => ({ ...s, [wajibField]: e.target.checked }))}
              className="rounded"
            />
            Wajib diisi
          </label>
        )}
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          checked={!!kantorSettings[field]}
          onChange={(e) => setKantorSettings((s) => ({ ...s, [field]: e.target.checked }))}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Field Pengunjung</h1>
          <p className="text-gray-500 mt-1">Kelola data yang diminta saat pengambilan antrian</p>
        </div>
        <Link href="/admin/pengunjung">
          <Button variant="outline" className="gap-2">
            <ChevronLeft className="h-4 w-4" /> Kembali
          </Button>
        </Link>
      </div>

      {/* Field Data Pengunjung (kantor settings) */}
      <Card>
        <CardHeader><CardTitle>Field Data Pengunjung</CardTitle></CardHeader>
        <CardContent>
          <FieldToggle label="Nama Pengunjung" field="field_nama_aktif" wajibField="field_nama_wajib" />
          <FieldToggle label="NIK Pengunjung" field="field_nik_aktif" wajibField="field_nik_wajib" />
          <FieldToggle label="No. HP Pengunjung" field="field_no_hp_aktif" wajibField="field_no_hp_wajib" />
          <div className="pt-4 flex justify-end">
            <Button onClick={handleSaveKantor} disabled={savingKantor} className="gap-2">
              <Save className="h-4 w-4" />
              {savingKantor ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Daftar Field Tambahan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar Field Tambahan</CardTitle>
            <Button onClick={openCreate} size="sm" className="gap-2" aria-label="Tambah Field">
              <Plus className="h-4 w-4" />
              <span className="hidden md:inline">Tambah Field</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">Belum ada field tambahan</p>
          ) : (
            <div className="space-y-2">
              {list.map((f, i) => (
                <div key={f.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveUp(i)} disabled={i === 0} className="h-3 text-gray-400 hover:text-gray-700 disabled:opacity-30">▲</button>
                    <GripVertical className="h-4 w-4 text-gray-300" />
                    <button onClick={() => moveDown(i)} disabled={i === list.length - 1} className="h-3 text-gray-400 hover:text-gray-700 disabled:opacity-30">▼</button>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{f.nama_field}</p>
                    <p className="text-xs text-gray-500 font-mono">{f.kunci_field}</p>
                  </div>
                  <div className="flex gap-1">
                    {f.wajib_isi && <Badge variant="warning">Wajib</Badge>}
                    <Badge variant={f.status_aktif ? "success" : "secondary"}>{f.status_aktif ? "Aktif" : "Nonaktif"}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(f)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(f.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Field" : "Tambah Field"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama Field (label form)</Label>
              <Input value={form.nama_field} onChange={(e) => setForm((f) => ({ ...f, nama_field: e.target.value }))} placeholder="Nomor Berkas" />
            </div>
            <div className="space-y-2">
              <Label>Kunci Field (key data)</Label>
              <Input value={form.kunci_field} onChange={(e) => setForm((f) => ({ ...f, kunci_field: e.target.value }))} placeholder="nomor_berkas" disabled={!!editing} />
              {editing && <p className="text-xs text-gray-400">Kunci field tidak dapat diubah setelah dibuat</p>}
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.wajib_isi} onChange={(e) => setForm((f) => ({ ...f, wajib_isi: e.target.checked }))} />
                Wajib diisi
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.status_aktif} onChange={(e) => setForm((f) => ({ ...f, status_aktif: e.target.checked }))} />
                Aktif
              </label>
            </div>
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
