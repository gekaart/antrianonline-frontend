"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Plus, Edit2, Trash2, ExternalLink } from "lucide-react";
import { useAuthStore } from "@/stores/auth";

interface User { id: number; nama: string; username: string; email: string; no_wa: string; }

export default function PetugasPage() {
  const [list, setList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ nama: "", username: "", password: "", email: "", no_wa: "" });
  const [saving, setSaving] = useState(false);
  const { user } = useAuthStore();

  async function load() { setList(await api.get<User[]>("/api/admin/users")); }
  useEffect(() => { load().finally(() => setLoading(false)); }, []);

  function openCreate() { setEditing(null); setForm({ nama: "", username: "", password: "", email: "", no_wa: "" }); setOpen(true); }
  function openEdit(u: User) { setEditing(u); setForm({ nama: u.nama, username: u.username, password: "", email: u.email, no_wa: u.no_wa }); setOpen(true); }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function handleSave() {
    setSaving(true);
    const body = editing ? { nama: form.nama, username: form.username, email: form.email, no_wa: form.no_wa, ...(form.password && { password: form.password }) } : form;
    try {
      if (editing) await api.put(`/api/admin/users/${editing.id}`, body);
      else await api.post("/api/admin/users", body);
      toast({ title: "Berhasil disimpan", variant: "success" });
      setOpen(false);
      await load();
    } catch (err: unknown) {
      // Extract error info comprehensively
      const e = err as any;
      const errorInfo = {
        type:           e?.constructor?.name || typeof e,
        message:        e?.message || String(e),
        status:         e?.status,
        body:           e?.body,
        stack:          e?.stack?.split('\n').slice(0, 2).join(' | '),
        requestBody:    JSON.stringify(body).substring(0, 500),
      };
      console.error('[PETUGAS ERROR]', errorInfo);
      
      let detailMsg = "Gagal";
      if (e?.body?.debug) {
        detailMsg = `Error: ${e.body.debug.message || ''} (${e.body.debug.code || ''})`;
      } else if (e?.message) {
        detailMsg = e.message;
      }
      toast({ title: detailMsg, variant: "destructive" });
    } finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Hapus petugas ini?")) return;
    await api.delete(`/api/admin/users/${id}`);
    toast({ title: "Petugas dihapus", variant: "success" });
    await load();
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  // Debug: test API langsung
  async function testApi() {
    try {
      const res = await fetch("/api/admin/kantor", { credentials: "include" });
      const text = await res.text();
      console.log("[DEBUG] GET /api/admin/kantor:", res.status, text.substring(0, 300));
      toast({ title: `API test: ${res.status} - ${text.substring(0, 100)}`, variant: res.ok ? "success" : "destructive" });
    } catch (e: any) {
      console.error("[DEBUG] API test error:", e);
      toast({ title: `API error: ${e.message}`, variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Petugas</h1>
          <p className="text-gray-500 mt-1">Kelola akun petugas counter</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.open(user?.k_alias ? `/${user.k_alias}/counter/login` : "/counter/login", "_blank")}
            aria-label="Buka Halaman Counter"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="hidden md:inline">Buka Halaman Counter</span>
          </Button>
          <Button onClick={openCreate} className="gap-2" aria-label="Tambah Petugas">
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">Tambah Petugas</span>
          </Button>
          <Button variant="outline" size="sm" onClick={testApi} className="gap-1 text-xs text-gray-400" aria-label="Debug API">
            🐛 Debug
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Daftar Petugas</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {["Nama", "Username", "Email", "No. WA", ""].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-gray-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-2 px-3 font-medium">{u.nama}</td>
                  <td className="py-2 px-3 text-gray-600">{u.username}</td>
                  <td className="py-2 px-3 text-gray-600">{u.email || "-"}</td>
                  <td className="py-2 px-3 text-gray-600">{u.no_wa || "-"}</td>
                  <td className="py-2 px-3">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(u)}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(u.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
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
          <DialogHeader><DialogTitle>{editing ? "Edit Petugas" : "Tambah Petugas"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {[
              { label: "Nama Lengkap", name: "nama", placeholder: "Nama petugas", required: true },
              { label: "Username", name: "username", placeholder: "username_login", required: true },
              { label: `Password${editing ? " (kosongkan jika tidak diubah)" : ""}`, name: "password", type: "password", placeholder: "Min 8 karakter", required: !editing },
              { label: "Email (opsional)", name: "email", type: "email", placeholder: "email@contoh.com" },
              { label: "No. WA (opsional)", name: "no_wa", placeholder: "08xxxxxxxxxx" },
            ].map((field) => (
              <div key={field.name} className="space-y-2">
                <Label>{field.label}</Label>
                <Input name={field.name} type={field.type || "text"} placeholder={field.placeholder} value={form[field.name as keyof typeof form]} onChange={handleChange} required={field.required} />
              </div>
            ))}
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
