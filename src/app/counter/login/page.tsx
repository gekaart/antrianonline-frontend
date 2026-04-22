"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { counterLogin } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toast";
import { MonitorSpeaker, Lock } from "lucide-react";

export default function CounterLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await counterLogin(form.username, form.password, "default");
      router.push("/counter/select");
    } catch (err: unknown) {
      const error = err as { message?: string; status?: number };
      setAttempts((a) => a + 1);
      if (error?.status === 429) {
        setError("Terlalu banyak percobaan login. Silakan coba lagi dalam beberapa menit.");
      } else {
        setError(error?.message || "Username atau password salah");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <div className="h-14 w-14 bg-blue-500 rounded-2xl flex items-center justify-center">
                <MonitorSpeaker className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Antrian Online</h1>
            <p className="text-gray-400 mt-1">Login Counter Petugas</p>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Lock className="h-5 w-5" />
                Masuk sebagai Petugas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-900/50 border border-red-700 rounded-md p-3 text-sm text-red-300">
                    {error}
                    {attempts >= 3 && (
                      <p className="mt-1 text-xs text-red-400">
                        Akun akan dikunci sementara setelah 5 percobaan gagal.
                      </p>
                    )}
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-gray-300">Username</Label>
                  <Input
                    name="username"
                    placeholder="username"
                    autoComplete="username"
                    value={form.username}
                    onChange={handleChange}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Password</Label>
                  <Input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-500"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Masuk..." : "Masuk"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
