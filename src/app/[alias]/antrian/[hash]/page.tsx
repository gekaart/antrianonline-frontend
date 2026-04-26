"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toast";
import { toast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Star, CheckCircle, Clock, Users, SkipForward, Ticket } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

function getRatingResponse(stars: number): { text: string; pesanWajib: boolean } {
  if (stars === 1) return {
    text: "Mohon maaf atas pelayanan yang kurang baik, silahkan sampaikan saran dan kritik Anda.",
    pesanWajib: true,
  };
  if (stars === 2) return {
    text: "Terima kasih atas masukannya. Kami mohon maaf pelayanan kami belum sesuai harapan. Dengan senang hati kami menerima kritik Anda untuk perbaikan ke depan.",
    pesanWajib: true,
  };
  if (stars === 3) return {
    text: "Terima kasih atas penilaian yang Anda berikan. Kami akan terus berupaya memberikan pelayanan yang terbaik.",
    pesanWajib: false,
  };
  if (stars === 4) return {
    text: "Terima kasih atas apresiasinya. Senang mengetahui Anda cukup puas. Kami akan berusaha lebih baik lagi agar ke depannya layanan kami sempurna di mata Anda.",
    pesanWajib: false,
  };
  return {
    text: "Terima kasih atas penilaian terbaiknya. Penilaian ini dapat memotivasi kami lebih baik lagi dikemudian hari.",
    pesanWajib: false,
  };
}

interface AntrianData {
  id: number;
  nomor_antrian: string;
  status: "menunggu" | "dipanggil" | "selesai" | "dilewati";
  nama_pengunjung?: string;
  id_ruangan: number;
  ruangan: { id: number; nama: string; slug: string } | null;
  jenis_layanan: { id: number; nama: string; kode_huruf: string } | null;
  kantor: { nama: string; aktif_rating: boolean } | null;
  created_at: string;
  rating?: { id: number; bintang: number; pesan: string } | null;
}

interface AntrianResponse {
  antrian: AntrianData;
  posisi: number;
}

const statusConfig = {
  menunggu: { label: "Menunggu", color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  dipanggil: { label: "Dipanggil!", color: "bg-blue-100 text-blue-800 border-blue-200 animate-pulse", icon: Users },
  selesai: { label: "Selesai", color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
  dilewati: { label: "Dilewati", color: "bg-red-100 text-red-800 border-red-200", icon: SkipForward },
};

export default function AntrianStatusPage() {
  const params = useParams<{ alias: string; hash: string }>();
  const { hash } = params;

  const [data, setData] = useState<AntrianResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingDone, setRatingDone] = useState(false);
  const [ratingPesan, setRatingPesan] = useState("");
  const [skipAgreeSubmitting, setSkipAgreeSubmitting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const d = await api.get<AntrianResponse>(`/api/public/antrian/${hash}`);
      setData(d);
      if (d.antrian.rating?.bintang) setRatingDone(true);
    } catch {
      // silent on poll
    } finally {
      setLoading(false);
    }
  }, [hash]);

  useEffect(() => {
    fetchData();
    pollRef.current = setInterval(fetchData, 15000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchData]);

  const roomId = data?.antrian.id_ruangan ? String(data.antrian.id_ruangan) : null;

  useWebSocket(roomId, "queue_called", () => { fetchData(); });
  useWebSocket(roomId, "queue_updated", () => { fetchData(); });
  useWebSocket(roomId, "queue_done", () => { fetchData(); });
  useWebSocket(roomId, "auto_reset", () => {
    fetchData();
    toast({ title: 'Nomor antrian diperbarui', description: 'Nomor antrian Anda telah direset karena pergantian hari. Harap cek nomor baru Anda di atas.' });
  });

  async function handleRating() {
    if (!rating) return;
    const { pesanWajib } = getRatingResponse(rating);
    if (pesanWajib && !ratingPesan.trim()) {
      toast({ title: "Saran dan kritik wajib diisi", variant: "destructive" });
      return;
    }
    setRatingSubmitting(true);
    try {
      await api.post(`/api/public/antrian/${hash}/rating`, { bintang: rating, pesan: ratingPesan.trim() });
      setRatingDone(true);
      toast({ title: "Terima kasih atas penilaian Anda!" });
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast({ title: e?.message || "Gagal mengirim rating", variant: "destructive" });
    } finally {
      setRatingSubmitting(false);
    }
  }

  async function handleSkipAgree() {
    setSkipAgreeSubmitting(true);
    try {
      await api.post(`/api/public/antrian/${hash}/skip-agree`, {});
      await fetchData();
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast({ title: e?.message || "Gagal", variant: "destructive" });
    } finally {
      setSkipAgreeSubmitting(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <Spinner size="lg" className="border-t-blue-600" />
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Tiket tidak ditemukan.</p>
    </div>
  );

  const { antrian, posisi } = data;
  const cfg = statusConfig[antrian.status] || statusConfig.menunggu;
  const StatusIcon = cfg.icon;

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Ticket card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 px-6 py-5 text-white text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Ticket className="h-5 w-5 opacity-80" />
                <span className="text-sm opacity-80">{antrian.kantor?.nama ?? ""}</span>
              </div>
              <p className="text-blue-200 text-sm">{antrian.ruangan?.nama ?? ""}</p>
              <p className="text-blue-200 text-sm">{antrian.jenis_layanan?.nama ?? ""}</p>
            </div>

            {/* Nomor antrian */}
            <div className="px-6 py-8 text-center border-b border-dashed border-gray-200">
              <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">Nomor Antrian Anda</div>
              <div className={`text-7xl font-black tracking-wider ${antrian.status === "dipanggil" ? "text-blue-600 animate-pulse" : "text-gray-900"}`}>
                {antrian.nomor_antrian}
              </div>
              {antrian.nama_pengunjung && (
                <div className="mt-2 text-gray-600">{antrian.nama_pengunjung}</div>
              )}
            </div>

            {/* Status */}
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center justify-center">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${cfg.color}`}>
                  <StatusIcon className="h-4 w-4" />
                  {cfg.label}
                </span>
              </div>

              {antrian.status === "menunggu" && posisi > 0 && (
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-700">{posisi}</div>
                  <div className="text-sm text-gray-500">antrian di depan Anda</div>
                </div>
              )}

              {antrian.status === "dilewati" && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Nomor Anda dilewati. Setuju kembali ke antrian?
                  </p>
                  <Button
                    onClick={handleSkipAgree}
                    disabled={skipAgreeSubmitting}
                    className="w-full"
                  >
                    {skipAgreeSubmitting ? "Memproses..." : "Ya, Antri Kembali"}
                  </Button>
                </div>
              )}

              {/* Rating */}
              {antrian.status === "selesai" && antrian.kantor?.aktif_rating && !ratingDone && (
                <div className="border-t pt-4 text-center">
                  <p className="text-sm text-gray-600 mb-3">Beri penilaian layanan</p>
                  <div className="flex justify-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onMouseEnter={() => setRatingHover(s)}
                        onMouseLeave={() => setRatingHover(0)}
                        onClick={() => setRating(s)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            s <= (ratingHover || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (() => {
                    const { text, pesanWajib } = getRatingResponse(rating);
                    return (
                      <div className="text-center mt-2 mb-3 space-y-2">
                        <p className={`text-sm ${rating <= 2 ? "text-red-600" : "text-blue-600"}`}>{text}</p>
                        <Textarea
                          placeholder={pesanWajib ? "Saran dan kritik Anda (wajib)" : "Tulis pesan (opsional)"}
                          value={ratingPesan}
                          onChange={(e) => setRatingPesan(e.target.value)}
                          className="text-sm"
                          rows={3}
                        />
                      </div>
                    );
                  })()}
                  <Button
                    onClick={handleRating}
                    disabled={!rating || ratingSubmitting}
                    className="w-full"
                  >
                    {ratingSubmitting ? "Mengirim..." : "Kirim Penilaian"}
                  </Button>
                </div>
              )}

              {ratingDone && antrian.status === "selesai" && (
                <div className="border-t pt-4 text-center">
                  <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`h-6 w-6 ${s <= (antrian.rating?.bintang || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Terima kasih!</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 text-center">
              <p className="text-xs text-gray-400">
                Halaman ini otomatis diperbarui
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
