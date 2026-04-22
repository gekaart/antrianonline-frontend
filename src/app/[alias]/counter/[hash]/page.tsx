"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  SkipForward, RotateCcw, CheckCircle, Undo2, Volume2, RefreshCw,
  LogOut, KeyRound, ListOrdered, X, Building2, MapPin, Layers, User
} from "lucide-react";

interface AntrianAktif {
  id: number;
  nomor_antrian: string;
  nama?: string;
}

interface AntrianDilewati {
  id: number;
  nomor_antrian: string;
  nama?: string;
}

interface CounterStatus {
  has_session: boolean;
  hash: string;
  id_ruangan: number;
  id_meja: number;
  nomor_meja: number;
  nama_ruangan: string;
  nama_jenis_layanan: string;
  nama_kantor: string;
  alias_kantor: string;
  alamat_kantor: string | null;
  logo_kantor: string | null;
  nama_petugas: string;
  antrian_aktif: AntrianAktif | null;
  menunggu: number;
  selesai: number;
  dilewati: AntrianDilewati[];
}

export default function CounterPage() {
  const params = useParams<{ alias: string; hash: string }>();
  const { alias } = params;
  const router = useRouter();
  const [status, setStatus] = useState<CounterStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Reset modal
  const [resetOpen, setResetOpen] = useState(false);
  const [resetTipe, setResetTipe] = useState<"dilewati" | "kemarin" | "semua">("dilewati");
  const [resetLoading, setResetLoading] = useState(false);

  // Change password modal
  const [passOpen, setPassOpen] = useState(false);
  const [passForm, setPassForm] = useState({ password_lama: "", password_baru: "", konfirmasi: "" });
  const [passLoading, setPassLoading] = useState(false);

  // Skipped panel
  const [skippedOpen, setSkippedOpen] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const d = await api.get<CounterStatus>("/api/petugas/counter/status");
      if (!d.has_session) {
        router.push(`/${alias}/counter/select`);
        return;
      }
      setStatus(d);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [router, alias]);

  useEffect(() => {
    fetchStatus();
    pollRef.current = setInterval(fetchStatus, 15000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchStatus]);

  const roomId = status?.id_ruangan ? String(status.id_ruangan) : null;

  useWebSocket(roomId, "displaced", (payload: unknown) => {
    const p = payload as { meja_id?: number };
    if (p) {
      toast({ title: "Counter Anda telah diambil alih", variant: "destructive" });
      router.push(`/${alias}/counter/select`);
    }
  });

  useWebSocket(roomId, "queue_updated", () => {
    fetchStatus();
  });

  async function doAction(name: string, fn: () => Promise<unknown>) {
    setActionLoading(name);
    try {
      await fn();
      await fetchStatus();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast({ title: error?.message || "Gagal melakukan aksi", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  }

  async function handleNext(action: "selesai" | "lewati") {
    await doAction("next", () => api.post("/api/petugas/counter/next", { action }));
  }

  async function handleRecall() {
    await doAction("recall", () => api.post("/api/petugas/counter/recall", {}));
  }

  async function handleSkip() {
    await doAction("skip", () => api.post("/api/petugas/counter/skip", {}));
  }

  async function handleDone() {
    await doAction("done", () => api.post("/api/petugas/counter/done", {}));
  }

  async function handleRevert() {
    await doAction("revert", () => api.post("/api/petugas/counter/revert", {}));
  }

  async function handlePickSkipped(id: number) {
    await doAction(`pick_${id}`, () => api.post(`/api/petugas/counter/pick-skipped/${id}`, {}));
    setSkippedOpen(false);
  }

  async function handleReset() {
    setResetLoading(true);
    try {
      await api.post("/api/petugas/counter/reset", { tipe: resetTipe });
      toast({ title: "Reset berhasil" });
      setResetOpen(false);
      await fetchStatus();
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast({ title: error?.message || "Reset gagal", variant: "destructive" });
    } finally {
      setResetLoading(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passForm.password_baru !== passForm.konfirmasi) {
      toast({ title: "Konfirmasi password tidak cocok", variant: "destructive" });
      return;
    }
    setPassLoading(true);
    try {
      await api.put("/api/auth/change-password", {
        password_lama: passForm.password_lama,
        password_baru: passForm.password_baru,
      });
      toast({ title: "Password berhasil diubah" });
      setPassOpen(false);
      setPassForm({ password_lama: "", password_baru: "", konfirmasi: "" });
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast({ title: error?.message || "Gagal ubah password", variant: "destructive" });
    } finally {
      setPassLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await api.post("/api/petugas/counter/logout", {});
    } finally {
      router.push(`/${alias}/counter/login`);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <Spinner size="lg" className="border-t-blue-400" />
    </div>
  );

  if (!status) return null;

  const { antrian_aktif, menunggu, selesai, dilewati } = status;

  return (
    <>
      <Toaster />

      <div className="min-h-screen bg-gray-950 text-white flex flex-col">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            {/* Left: counter info */}
            <div className="flex-1 min-w-0">
              {/* Meja badge */}
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-blue-600 text-white text-lg font-black px-3 py-0.5 rounded-lg">
                  Meja {status.nomor_meja}
                </span>
                <span className="text-gray-500 text-sm">{status.nama_ruangan}</span>
              </div>
              {/* Info grid */}
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400">
                {status.nama_kantor && (
                  <span className="flex items-center gap-1">
                    {status.logo_kantor ? (
                      <img src={status.logo_kantor} alt="" className="h-4 w-4 object-contain flex-shrink-0" />
                    ) : (
                      <Building2 className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    )}
                    <span>{status.nama_kantor}</span>
                  </span>
                )}
                {status.alamat_kantor && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    <span className="truncate max-w-xs">{status.alamat_kantor}</span>
                  </span>
                )}
                {status.nama_jenis_layanan && (
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    <span>{status.nama_jenis_layanan}</span>
                  </span>
                )}
                {status.nama_petugas && (
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    <span>{status.nama_petugas}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" size="icon" onClick={() => setSkippedOpen(true)} title="Antrian Dilewati" className="border-gray-700 text-gray-300">
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setResetOpen(true)} title="Reset" className="border-gray-700 text-gray-300">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setPassOpen(true)} title="Ganti Password" className="border-gray-700 text-gray-300">
                <KeyRound className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center gap-8 p-6">
          {/* Stats */}
          <div className="flex gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-400">{menunggu}</div>
              <div className="text-sm text-gray-400">Menunggu</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">{selesai}</div>
              <div className="text-sm text-gray-400">Selesai</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400">{dilewati.length}</div>
              <div className="text-sm text-gray-400">Dilewati</div>
            </div>
          </div>

          {/* Current queue number */}
          <div className="text-center">
            {antrian_aktif ? (
              <>
                <div className="text-8xl font-black tracking-widest text-white mb-2">
                  {antrian_aktif.nomor_antrian}
                </div>
                {antrian_aktif.nama && (
                  <div className="text-xl text-gray-300">{antrian_aktif.nama}</div>
                )}
                <Badge className="mt-3 bg-blue-600 text-white px-4 py-1">Sedang Dilayani</Badge>
              </>
            ) : (
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-600 mb-2">---</div>
                <div className="text-gray-500">Tidak ada antrian aktif</div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            {!antrian_aktif ? (
              <Button
                size="lg"
                className="gap-2 px-8 bg-blue-600 hover:bg-blue-700"
                disabled={!!actionLoading}
                onClick={() => handleNext("selesai")}
              >
                {actionLoading === "next" ? <Spinner size="sm" /> : null}
                Panggil Berikutnya
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  className="gap-2 bg-green-600 hover:bg-green-700"
                  disabled={!!actionLoading}
                  onClick={handleDone}
                >
                  {actionLoading === "done" ? <Spinner size="sm" /> : <CheckCircle className="h-5 w-5" />}
                  Selesai
                </Button>
                <Button
                  size="lg"
                  variant="warning"
                  className="gap-2"
                  disabled={!!actionLoading}
                  onClick={handleSkip}
                >
                  {actionLoading === "skip" ? <Spinner size="sm" /> : <SkipForward className="h-5 w-5" />}
                  Lewati
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-gray-600 text-gray-300"
                  disabled={!!actionLoading}
                  onClick={handleRecall}
                >
                  {actionLoading === "recall" ? <Spinner size="sm" /> : <Volume2 className="h-5 w-5" />}
                  Panggil Ulang
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-gray-600 text-gray-300"
                  disabled={!!actionLoading}
                  onClick={handleRevert}
                >
                  {actionLoading === "revert" ? <Spinner size="sm" /> : <Undo2 className="h-5 w-5" />}
                  Batalkan
                </Button>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Skipped panel dialog */}
      <Dialog open={skippedOpen} onOpenChange={setSkippedOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Antrian Dilewati ({dilewati.length})</DialogTitle>
            <DialogDescription className="text-gray-400">Pilih yang akan dilayani sekarang</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {dilewati.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Tidak ada antrian dilewati</p>
            ) : (
              dilewati.map((a) => (
                <div key={a.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                  <div>
                    <span className="font-bold">{a.nomor_antrian}</span>
                    {a.nama && <span className="text-gray-400 ml-2 text-sm">{a.nama}</span>}
                  </div>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={!!actionLoading}
                    onClick={() => handlePickSkipped(a.id)}
                  >
                    Layani
                  </Button>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-gray-600 text-gray-300" onClick={() => setSkippedOpen(false)}>
              <X className="h-4 w-4 mr-2" />Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset modal */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Reset Antrian</DialogTitle>
            <DialogDescription className="text-gray-400">Pilih antrian yang akan direset</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {(["dilewati", "kemarin", "semua"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setResetTipe(t)}
                className={`w-full text-left px-4 py-3 rounded-lg border text-sm capitalize transition-colors ${
                  resetTipe === t
                    ? "bg-red-700 border-red-600 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500"
                }`}
              >
                {t === "dilewati" && "Reset antrian yang dilewati hari ini"}
                {t === "kemarin" && "Reset antrian yang belum selesai dari kemarin"}
                {t === "semua" && "Reset semua antrian hari ini"}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" className="border-gray-600 text-gray-300" onClick={() => setResetOpen(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleReset} disabled={resetLoading}>
              {resetLoading ? "Mereset..." : "Konfirmasi Reset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change password modal */}
      <Dialog open={passOpen} onOpenChange={setPassOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Ganti Password</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Password Lama</Label>
              <Input
                type="password"
                required
                value={passForm.password_lama}
                onChange={(e) => setPassForm((f) => ({ ...f, password_lama: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Password Baru</Label>
              <Input
                type="password"
                required
                minLength={6}
                value={passForm.password_baru}
                onChange={(e) => setPassForm((f) => ({ ...f, password_baru: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Konfirmasi Password Baru</Label>
              <Input
                type="password"
                required
                value={passForm.konfirmasi}
                onChange={(e) => setPassForm((f) => ({ ...f, konfirmasi: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="border-gray-600 text-gray-300" onClick={() => setPassOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={passLoading}>
                {passLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
