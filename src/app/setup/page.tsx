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
import { Building2 } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nama_kantor: "",
    alamat: "",
    nama_admin: "",
    username: "",
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
    setLoading(true);
    try {
      await api.post("/api/setup/init", {
        nama_kantor: form.nama_kantor,
        alamat: form.alamat,
        nama_admin: form.nama_admin,
        username: form.username,
        password: form.password,
      });
      toast({ title: "Inisialisasi berhasil!", variant: "success" });
      setTimeout(() => router.push("/admin/login"), 1500);
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast({ title: error?.message || "Inisialisasi gagal", variant: "destructive" });
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
                <Button type="submit" className="w-full" disabled={loading}>
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
    </>
  );
}
