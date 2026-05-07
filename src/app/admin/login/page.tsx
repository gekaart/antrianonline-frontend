"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, verify2FA } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toast";
import { toast } from "@/hooks/use-toast";
import { Building2, Lock, Shield } from "lucide-react";

interface DebugLog {
  time: string;
  type: "info" | "success" | "error";
  msg: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { fetchUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);

  // 2FA state
  const [show2FA, setShow2FA] = useState(false);
  const [tempToken, setTempToken] = useState("");
  const [twofaCode, setTwofaCode] = useState("");

  function addLog(type: DebugLog["type"], msg: string) {
    const time = new Date().toISOString().slice(11, 23);
    setDebugLogs((prev) => [...prev, { time, type, msg }]);
    console.log(`[DEBUG ${type.toUpperCase()}] ${msg}`);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDebugLogs([]);

    addLog("info", `Memulai login untuk user: ${form.username}`);

    try {
      addLog("info", "Mengirim request POST /api/auth/login ...");
      const result = await login(form.username, form.password);
      addLog("success", `Login berhasil. User: ${JSON.stringify(result)}`);
      addLog("info", "Memanggil fetchUser()...");
      await fetchUser();

      if (result.level === "super_admin") {
        router.push("/super-admin");
      } else {
        router.push("/admin");
      }
    } catch (err: unknown) {
      const e = err as { message?: string; status?: number; requires_2fa?: boolean; temp_token?: string };

      if (e.requires_2fa && e.temp_token) {
        addLog("info", "2FA diperlukan, menampilkan form 2FA...");
        setTempToken(e.temp_token);
        setShow2FA(true);
        setLoading(false);
        return;
      }

      const msg = e?.message || "Login gagal";
      addLog("error", `ERROR: ${msg} | status: ${e?.status ?? "N/A"}`);
      setError(msg);
      toast({ title: msg, variant: "destructive" });
    } finally {
      if (!show2FA) setLoading(false);
    }
  }

  async function handle2FASubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      addLog("info", "Verifikasi kode 2FA...");
      const user = await verify2FA(tempToken, twofaCode);
      addLog("success", "2FA berhasil!");
      await fetchUser();
      router.push("/super-admin");
    } catch (err: unknown) {
      const e = err as { message?: string };
      const msg = e?.message || "Kode 2FA salah";
      addLog("error", `2FA ERROR: ${msg}`);
      setError(msg);
      toast({ title: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">

          {!show2FA ? (
            <>
              <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Antrian Online</h1>
            <p className="text-gray-500 mt-1">Panel Administrator</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Login Admin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="username">Username atau Email</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="username atau email"
                    autoComplete="username"
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Masuk..." : "Masuk"}
                </Button>
                <div className="text-center mt-4">
                  <span className="text-sm text-gray-500">Belum punya akun? </span>
                  <a href="/setup" className="text-primary-600 hover:underline font-medium">Registrasi antrian online</a>
                </div>
              </form>
            </CardContent>
          </Card>

              {debugLogs.length > 0 && (
                <div className="mt-4 rounded-lg border border-gray-300 bg-gray-900 text-xs text-gray-100 p-3 font-mono">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-yellow-400">🔍 Debug Log</span>
                    <button onClick={() => setDebugLogs([])} className="text-gray-400 hover:text-white text-xs">[clear]</button>
                  </div>
                  {debugLogs.map((log, i) => (
                    <div key={i} className={log.type === "error" ? "text-red-400" : log.type === "success" ? "text-green-400" : "text-gray-300"}>
                      <span className="text-gray-500">[{log.time}]</span> {log.msg}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="flex justify-center mb-3">
                  <div className="h-14 w-14 bg-green-600 rounded-2xl flex items-center justify-center">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Verifikasi 2FA</h1>
                <p className="text-gray-500 mt-1">Masukkan kode autentikasi Anda</p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Autentikasi Dua Faktor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handle2FASubmit} className="space-y-4">
                    {error && <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">{error}</div>}
                    <div className="space-y-2">
                      <Label htmlFor="2fa-code">Kode 2FA (min 4 digit)</Label>
                      <Input id="2fa-code" placeholder="000000" inputMode="numeric" maxLength={6}
                        value={twofaCode}
                        onChange={(e) => setTwofaCode(e.target.value.replace(/\D/g, ""))}
                        required className="text-center text-2xl tracking-[0.3em] font-mono" />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading || twofaCode.length < 4}>
                      {loading ? "Verifikasi..." : "Verifikasi"}
                    </Button>
                    <button type="button" onClick={() => { setShow2FA(false); setTwofaCode(""); setError(""); }}
                      className="w-full text-sm text-gray-600 hover:text-gray-900 mt-2 underline">
                      Kembali ke Login
                    </button>
                  </form>
                </CardContent>
              </Card>

              {debugLogs.length > 0 && (
                <div className="mt-4 rounded-lg border border-gray-300 bg-gray-900 text-xs text-gray-100 p-3 font-mono">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-yellow-400">🔍 Debug Log</span>
                    <button onClick={() => setDebugLogs([])} className="text-gray-400 hover:text-white text-xs">[clear]</button>
                  </div>
                  {debugLogs.map((log, i) => (
                    <div key={i} className={log.type === "error" ? "text-red-400" : log.type === "success" ? "text-green-400" : "text-gray-300"}>
                      <span className="text-gray-500">[{log.time}]</span> {log.msg}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
