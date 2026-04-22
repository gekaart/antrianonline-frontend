"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { Save, User, Lock } from "lucide-react";

interface AdminProfile {
  id: number; nama: string; username: string; email: string; no_wa: string;
}

const emptyPassword = { password_lama: "", password_baru: "", konfirmasi: "" };

export default function ProfilAdminPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [profileForm, setProfileForm] = useState<Partial<AdminProfile>>({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwForm, setPwForm] = useState(emptyPassword);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    api.get<AdminProfile>("/api/auth/me")
      .then((me) => { setProfile(me); setProfileForm(me); })
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await api.put<AdminProfile>("/api/auth/profile", profileForm);
      setProfile(updated);
      setProfileForm(updated);
      toast({ title: "Profil berhasil diperbarui", variant: "success" });
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast({ title: error?.message || "Gagal menyimpan profil", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwForm.password_baru !== pwForm.konfirmasi) {
      toast({ title: "Konfirmasi password tidak cocok", variant: "destructive" });
      return;
    }
    setSavingPw(true);
    try {
      await api.put("/api/auth/change-password", {
        password_lama: pwForm.password_lama,
        password_baru: pwForm.password_baru,
      });
      toast({ title: "Password berhasil diubah", variant: "success" });
      setPwForm(emptyPassword);
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast({ title: error?.message || "Gagal mengubah password", variant: "destructive" });
    } finally {
      setSavingPw(false);
    }
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <Toaster />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil Admin</h1>
        <p className="text-gray-500 mt-1">Kelola informasi akun dan keamanan Anda</p>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSaveProfile}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Informasi Akun
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="p_nama">Nama Lengkap</Label>
                <Input
                  id="p_nama"
                  value={profileForm.nama || ""}
                  onChange={(e) => setProfileForm((f) => ({ ...f, nama: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p_username">Username</Label>
                <Input
                  id="p_username"
                  value={profileForm.username || ""}
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p_email">Email</Label>
                <Input
                  id="p_email"
                  type="email"
                  value={profileForm.email || ""}
                  onChange={(e) => setProfileForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="admin@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p_no_wa">No. WhatsApp</Label>
                <Input
                  id="p_no_wa"
                  type="tel"
                  value={profileForm.no_wa || ""}
                  onChange={(e) => setProfileForm((f) => ({ ...f, no_wa: e.target.value }))}
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={savingProfile} className="gap-2">
                <Save className="h-4 w-4" />
                {savingProfile ? "Menyimpan..." : "Simpan Profil"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Change password form */}
      <form onSubmit={handleChangePassword}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" /> Ubah Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pw_lama">Password Lama</Label>
                <Input
                  id="pw_lama"
                  type="password"
                  value={pwForm.password_lama}
                  onChange={(e) => setPwForm((f) => ({ ...f, password_lama: e.target.value }))}
                  required
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pw_baru">Password Baru</Label>
                <Input
                  id="pw_baru"
                  type="password"
                  value={pwForm.password_baru}
                  onChange={(e) => setPwForm((f) => ({ ...f, password_baru: e.target.value }))}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Min. 8 karakter"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pw_konfirmasi">Konfirmasi Password</Label>
                <Input
                  id="pw_konfirmasi"
                  type="password"
                  value={pwForm.konfirmasi}
                  onChange={(e) => setPwForm((f) => ({ ...f, konfirmasi: e.target.value }))}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={savingPw} variant="outline" className="gap-2">
                <Lock className="h-4 w-4" />
                {savingPw ? "Mengubah..." : "Ubah Password"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
