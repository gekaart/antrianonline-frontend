"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/toast";
import { toast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { MonitorSpeaker, ArrowRight, AlertTriangle } from "lucide-react";

interface JenisLayanan { id: number; nama: string; kode_huruf: string; }
interface Meja { id: number; nomor_meja: number; status_tersedia: boolean; id_petugas_aktif?: number | null; nama_petugas?: string | null; }
interface Ruangan { id: number; nama: string; jenis_layanan: JenisLayanan[]; meja: Meja[]; }

export default function CounterSelectPage() {
  const router = useRouter();
  const [ruangan, setRuangan] = useState<Ruangan[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sel, setSel] = useState({ id_ruangan: 0, id_jenis_layanan: 0, id_meja: 0 });

  // Conflict confirmation dialog
  const [conflictMeja, setConflictMeja] = useState<Meja | null>(null);

  useEffect(() => {
    api.get<{ ruangan: Ruangan[] }>("/api/petugas/counter/options")
      .then((d) => setRuangan(d.ruangan))
      .finally(() => setLoading(false));
  }, []);

  const selectedRuangan = ruangan.find((r) => r.id === sel.id_ruangan);
  // Show ALL meja — no filter
  const allMeja = selectedRuangan?.meja ?? [];

  function handleMejaClick(m: Meja) {
    const isOccupied = !!m.id_petugas_aktif;
    if (isOccupied) {
      // Show conflict dialog before selecting
      setConflictMeja(m);
    } else {
      setSel((s) => ({ ...s, id_meja: m.id }));
    }
  }

  function confirmTakeOver() {
    if (!conflictMeja) return;
    setSel((s) => ({ ...s, id_meja: conflictMeja.id }));
    setConflictMeja(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sel.id_ruangan || !sel.id_jenis_layanan || !sel.id_meja) {
      toast({ title: "Lengkapi semua pilihan", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post<{ hash: string }>("/api/petugas/counter/select", sel);
      router.push(`/counter/${res.hash}`);
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast({ title: error?.message || "Gagal memilih meja", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <Spinner size="lg" className="border-t-blue-400" />
    </div>
  );

  return (
    <>
      <Toaster />

      {/* Conflict / Take-over confirmation dialog */}
      <Dialog open={!!conflictMeja} onOpenChange={(open) => { if (!open) setConflictMeja(null); }}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-yellow-400">
              <AlertTriangle className="h-5 w-5" />
              Meja Sedang Digunakan
            </DialogTitle>
            <DialogDescription className="text-gray-300 pt-2">
              Meja <strong>{conflictMeja?.nomor_meja}</strong> sedang digunakan oleh{" "}
              <strong>{conflictMeja?.nama_petugas ?? "petugas lain"}</strong>.
              <br /><br />
              Jika Anda melanjutkan, petugas tersebut akan otomatis dikeluarkan dari meja ini.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="border-gray-600 text-gray-300" onClick={() => setConflictMeja(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmTakeOver}>
              Ya, Ambil Alih Meja
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-3">
              <div className="h-14 w-14 bg-blue-500 rounded-2xl flex items-center justify-center">
                <MonitorSpeaker className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">Pilih Counter</h1>
            <p className="text-gray-400 mt-1">Pilih ruangan, layanan, dan meja Anda</p>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader><CardTitle className="text-white">Pilihan Counter</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Ruangan */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Ruangan</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {ruangan.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSel({ id_ruangan: r.id, id_jenis_layanan: 0, id_meja: 0 })}
                        className={`text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                          sel.id_ruangan === r.id
                            ? "bg-blue-600 border-blue-500 text-white"
                            : "bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500"
                        }`}
                      >
                        {r.nama}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Jenis Layanan */}
                {selectedRuangan && (
                  <div className="space-y-2">
                    <Label className="text-gray-300">Jenis Layanan</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedRuangan.jenis_layanan?.map((j) => (
                        <button
                          key={j.id}
                          type="button"
                          onClick={() => setSel((s) => ({ ...s, id_jenis_layanan: j.id, id_meja: 0 }))}
                          className={`text-left px-4 py-3 rounded-lg border text-sm transition-colors ${
                            sel.id_jenis_layanan === j.id
                              ? "bg-blue-600 border-blue-500 text-white"
                              : "bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500"
                          }`}
                        >
                          <span className="font-bold mr-2">[{j.kode_huruf}]</span>
                          {j.nama}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Meja — all shown, occupied meja in amber */}
                {sel.id_jenis_layanan > 0 && (
                  <div className="space-y-2">
                    <Label className="text-gray-300">
                      Meja
                      <span className="ml-2 text-xs text-gray-500">(🔴 = sedang digunakan)</span>
                    </Label>
                    {allMeja.length === 0 && (
                      <p className="text-sm text-gray-500">Belum ada meja di ruangan ini.</p>
                    )}
                    <div className="grid grid-cols-3 gap-2">
                      {allMeja.map((m) => {
                        const isOccupied = !!m.id_petugas_aktif;
                        const isSelected = sel.id_meja === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => handleMejaClick(m)}
                            title={isOccupied ? `Digunakan oleh: ${m.nama_petugas ?? "petugas lain"}` : undefined}
                            className={`relative px-3 py-3 rounded-lg border text-sm font-bold transition-colors ${
                              isSelected
                                ? isOccupied
                                  ? "bg-red-600 border-red-500 text-white"
                                  : "bg-blue-600 border-blue-500 text-white"
                                : isOccupied
                                  ? "bg-red-900/40 border-red-700 text-red-300 hover:border-red-500"
                                  : "bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500"
                            }`}
                          >
                            Meja {m.nomor_meja}
                            {isOccupied && (
                              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={!sel.id_ruangan || !sel.id_jenis_layanan || !sel.id_meja || submitting}
                >
                  {submitting ? "Memproses..." : <>Mulai Layani <ArrowRight className="h-4 w-4" /></>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
