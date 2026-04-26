"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toast";
import { toast } from "@/hooks/use-toast";
import { Building2, Lock } from "lucide-react";

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
    addLog("info", `API_BASE: "${process.env.NEXT_PUBLIC_API_URL ?? "(kosong = relative URL)"}"`);
    addLog("info", `Target URL: ${process.env.NEXT_PUBLIC_API_URL ?? ""}/api/auth/login`);

    try {
      addLog("info", "Mengirim request POST /api/auth/login ...");
      const result = await login(form.username, form.password);
      addLog("success", `Login berhasil. User: ${JSON.stringify(result)}`);

      addLog("info", "Memanggil fetchUser() untuk verifikasi cookie ...");
      await fetchUser();
      addLog("success", "fetchUser() selesai. Redirect ke /admin ...");

      router.push("/admin");
    } catch (err: unknown) {
      const e = err as { message?: string; status?: number; body?: unknown };
      const msg = e?.message || "Login gagal";
      addLog("error", `ERROR: ${msg} | status: ${e?.status ?? "N/A"} | body: ${JSON.stringify(e?.body ?? null)}`);
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
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="username"
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

          {/* DEBUG PANEL — tampil setelah klik Masuk */}
          {debugLogs.length > 0 && (
            <div className="mt-4 rounded-lg border border-gray-300 bg-gray-900 text-xs text-gray-100 p-3 font-mono">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-yellow-400">🔍 Debug Log</span>
                <button
                  onClick={() => setDebugLogs([])}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  [clear]
                </button>
              </div>
              {debugLogs.map((log, i) => (
                <div
                  key={i}
                  className={
                    log.type === "error"
                      ? "text-red-400"
                      : log.type === "success"
                      ? "text-green-400"
                      : "text-gray-300"
                  }
                >
                  <span className="text-gray-500">[{log.time}]</span>{" "}
                  {log.msg}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
