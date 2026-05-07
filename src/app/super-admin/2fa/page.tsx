"use client";

import { useEffect, useState } from "react";
import { Shield, ShieldCheck, ShieldOff, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { get2FAStatus, setup2FA, disable2FA } from "@/lib/auth";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/toast";
import { toast } from "@/hooks/use-toast";

export default function SuperAdmin2FAPage() {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [twofaEnabled, setTwofaEnabled] = useState(false);
  const [code, setCode] = useState("");
  const [codeConfirm, setCodeConfirm] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    get2FAStatus()
      .then((res) => setTwofaEnabled(res.twofa_enabled))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (code.length < 4) {
      setError("Kode 2FA minimal 4 karakter");
      return;
    }
    if (code !== codeConfirm) {
      setError("Kode 2FA tidak cocok");
      return;
    }

    setSaving(true);
    try {
      await setup2FA(code);
      setTwofaEnabled(true);
      setShowSetup(false);
      setCode("");
      setCodeConfirm("");
      toast({ title: "2FA berhasil diaktifkan", variant: "default" });
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message || "Gagal mengaktifkan 2FA");
    } finally {
      setSaving(false);
    }
  }

  async function handleDisable() {
    if (!confirm("Nonaktifkan 2FA? Super admin akan login tanpa kode autentikasi.")) return;

    setSaving(true);
    try {
      await disable2FA();
      setTwofaEnabled(false);
      setShowSetup(false);
      setCode("");
      setCodeConfirm("");
      toast({ title: "2FA berhasil dinonaktifkan", variant: "default" });
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast({ title: e?.message || "Gagal menonaktifkan 2FA", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const cardBgClass = isDark ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200";
  const cardTextClass = isDark ? "text-white" : "text-gray-900";
  const cardSubtextClass = isDark ? "text-gray-400" : "text-gray-600";
  const inputBg = isDark ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400";
  const labelClass = isDark ? "text-gray-300" : "text-gray-700";
  const sectionBg = isDark ? "bg-gray-800/50" : "bg-white";

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-purple-600 rounded-2xl flex items-center justify-center">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className={cn("text-2xl font-bold", cardTextClass)}>Pengaturan 2FA</h1>
            <p className={cn("text-sm", cardSubtextClass)}>
              Two Factor Authentication untuk Super Admin
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div className={cn("border rounded-xl p-6", cardBgClass)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center",
                twofaEnabled
                  ? "bg-green-500/20"
                  : isDark ? "bg-gray-800" : "bg-gray-200"
              )}>
                {twofaEnabled ? (
                  <ShieldCheck className="h-7 w-7 text-green-400" />
                ) : (
                  <ShieldOff className={cn("h-7 w-7", isDark ? "text-gray-500" : "text-gray-400")} />
                )}
              </div>
              <div>
                <h2 className={cn("text-lg font-semibold", cardTextClass)}>
                  {twofaEnabled ? "2FA Aktif" : "2FA Nonaktif"}
                </h2>
                <p className={cn("text-sm", cardSubtextClass)}>
                  {twofaEnabled
                    ? "Super admin memerlukan kode autentikasi saat login"
                    : "Login super admin tanpa kode autentikasi tambahan"
                  }
                </p>
              </div>
            </div>
            <div>
              {twofaEnabled ? (
                <Button
                  variant="outline"
                  onClick={handleDisable}
                  disabled={saving}
                  className={cn(
                    "border-red-500/50 text-red-400 hover:bg-red-500/10",
                    isDark ? "" : "border-red-300 text-red-600 hover:bg-red-50"
                  )}
                >
                  {saving ? "Memproses..." : "Nonaktifkan"}
                </Button>
              ) : (
                <Button
                  onClick={() => setShowSetup(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Aktifkan 2FA
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Setup Form */}
        {showSetup && !twofaEnabled && (
          <div className={cn("border rounded-xl p-6", cardBgClass)}>
            <h2 className={cn("text-lg font-semibold mb-4 flex items-center gap-2", cardTextClass)}>
              <KeyRound className="h-5 w-5 text-purple-400" />
              Buat Kode 2FA
            </h2>

            <form onSubmit={handleActivate} className="space-y-4 max-w-md">
              <div>
                <p className={cn("text-sm mb-4", cardSubtextClass)}>
                  Buat kode rahasia yang akan diminta setiap kali login sebagai super admin.
                  Gunakan kombinasi angka yang mudah diingat namun sulit ditebak.
                </p>
              </div>

              {error && (
                <div className={cn(
                  "flex items-center gap-2 text-sm p-3 rounded-lg",
                  isDark ? "bg-red-900/30 text-red-400" : "bg-red-50 text-red-600"
                )}>
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label className={labelClass}>Kode 2FA (min 4 digit)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className={cn("text-center text-2xl tracking-[0.3em] font-mono", inputBg)}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label className={labelClass}>Konfirmasi Kode 2FA</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  maxLength={6}
                  value={codeConfirm}
                  onChange={(e) => setCodeConfirm(e.target.value.replace(/\D/g, ""))}
                  className={cn("text-center text-2xl tracking-[0.3em] font-mono", inputBg)}
                />
                {code && codeConfirm && code !== codeConfirm && (
                  <p className="text-xs text-red-400 mt-1">Kode tidak cocok</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={saving || code.length < 4 || code !== codeConfirm}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {saving ? "Menyimpan..." : "Aktifkan 2FA"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowSetup(false); setError(""); setCode(""); setCodeConfirm(""); }}
                  className={isDark ? "border-gray-600 text-gray-300" : ""}
                >
                  Batal
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={cn("border rounded-xl p-5", cardBgClass)}>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className={cn("text-sm font-semibold", cardTextClass)}>Keamanan Ekstra</h3>
                <p className={cn("text-xs mt-1", cardSubtextClass)}>
                  Setelah 2FA aktif, setiap login super admin akan memerlukan username,
                  password, dan kode 2FA yang Anda buat.
                </p>
              </div>
            </div>
          </div>
          <div className={cn("border rounded-xl p-5", cardBgClass)}>
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className={cn("text-sm font-semibold", cardTextClass)}>Peringatan</h3>
                <p className={cn("text-xs mt-1", cardSubtextClass)}>
                  Simpan kode 2FA Anda dengan aman. Tidak ada cara untuk memulihkan
                  kode yang hilang selain melalui database.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className={cn("border rounded-xl p-6", cardBgClass)}>
          <h2 className={cn("text-lg font-semibold mb-3", cardTextClass)}>Bagaimana Cara Kerjanya?</h2>
          <ol className={cn("space-y-2 text-sm list-decimal list-inside", cardSubtextClass)}>
            <li>Aktifkan 2FA dengan membuat kode rahasia (min 4 digit)</li>
            <li>Saat login, masukkan username dan password seperti biasa</li>
            <li>Setelah berhasil, sistem akan meminta kode 2FA</li>
            <li>Masukkan kode 2FA yang sudah Anda buat sebelumnya</li>
            <li>Jika kode benar, Anda akan masuk ke dashboard super admin</li>
          </ol>
        </div>
      </div>
    </>
  );
}

// Simple Label component to avoid import
function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn("text-sm font-medium", className)} {...props}>
      {children}
    </label>
  );
}