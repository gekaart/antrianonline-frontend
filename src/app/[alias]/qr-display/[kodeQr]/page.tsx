"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { api } from "@/lib/api";

interface RuanganInfo {
  nama: string;
  kantor: { nama: string; logo?: string | null; antrian_manual_aktif?: boolean; antrian_manual_timeout?: number };
}

interface AntrianManual {
  id: number;
  nomor_antrian: string;
  jenis_layanan: string;
  status: string;
  is_printed: boolean;
  created_at: string;
  hash: string;
}

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

function getMsUntilMidnight() {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

export default function QrDisplayPage() {
  const params = useParams<{ alias: string; kodeQr: string }>();
  const { alias, kodeQr } = params;

  const [info, setInfo] = useState<RuanganInfo | null>(null);
  const [todayStr, setTodayStr] = useState(getTodayStr());
  const [time, setTime] = useState<Date | null>(null);
  const [origin, setOrigin] = useState("");
  const midnightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Manual antrian state
  const [manualAktif, setManualAktif] = useState(false);
  const [manualTimeout, setManualTimeout] = useState(3);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<{ nomor_antrian: string; hash: string; nama?: string } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyList, setHistoryList] = useState<AntrianManual[]>([]);
  const [loadingManual, setLoadingManual] = useState(false);
  const modalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const printIframeRef = useRef<HTMLIFrameElement>(null);

  // Resolve origin client-side only to avoid SSR/client hydration mismatch
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  // Build the queue URL that the QR points to (with daily date suffix)
  const queueUrl = `${origin}/${alias}/queue/${kodeQr}-${todayStr}`;

  // Fetch ruangan info — try with date suffix (works for both qr_dinamis on/off)
  useEffect(() => {
    const fetchInfo = async (suffix: boolean) => {
      const kode = suffix ? `${kodeQr}-${getTodayStr()}` : kodeQr;
      const d = await api.get<{ ruangan: { nama: string; kantor: { nama: string; logo?: string | null; antrian_manual_aktif?: boolean; antrian_manual_timeout?: number } } }>(
        `/api/public/ruangan/kode-qr/${kode}`
      );
      const kantor = d.ruangan.kantor;
      setInfo({ nama: d.ruangan.nama, kantor });
      if (kantor?.antrian_manual_aktif) {
        setManualAktif(true);
        setManualTimeout(kantor.antrian_manual_timeout ?? 3);
      }
    };
    fetchInfo(true).catch(() => fetchInfo(false).catch(() => {}));
  }, [kodeQr, todayStr]);

  // Clock — initialize on mount and tick every second
  useEffect(() => {
    setTime(new Date());
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  // Auto-refresh QR at midnight
  useEffect(() => {
    function scheduleRefresh() {
      const ms = getMsUntilMidnight();
      midnightTimerRef.current = setTimeout(() => {
        setTodayStr(getTodayStr());
        scheduleRefresh();
      }, ms + 500);
    }
    scheduleRefresh();
    return () => {
      if (midnightTimerRef.current) clearTimeout(midnightTimerRef.current);
    };
  }, []);

  // Auto-close modal after timeout
  useEffect(() => {
    if (showModal && modalData) {
      const timeoutMs = (manualTimeout || 3) * 60 * 1000;
      modalTimerRef.current = setTimeout(() => {
        setShowModal(false);
        setModalData(null);
      }, timeoutMs);
      return () => {
        if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
      };
    }
  }, [showModal, modalData, manualTimeout]);

  const handleAmbilAntrian = useCallback(async () => {
    setLoadingManual(true);
    try {
      const res = await api.post<{ antrian: { nomor_antrian: string }; hash: string; timeout_menit: number }>(
        "/api/public/antrian/manual-take",
        { kode_qr: kodeQr }
      );
      setModalData({ nomor_antrian: res.antrian.nomor_antrian, hash: res.hash });
      setShowModal(true);
      setManualTimeout(res.timeout_menit || 3);
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error?.message || "Gagal mengambil antrian manual");
    } finally {
      setLoadingManual(false);
    }
  }, [kodeQr]);

  const handleLihatRiwayat = useCallback(async () => {
    try {
      const res = await api.get<{ antrian_manual: AntrianManual[] }>(
        `/api/public/antrian/manual-list/${kodeQr}`
      );
      setHistoryList(res.antrian_manual || []);
      setShowHistory(true);
    } catch (err: unknown) {
      const error = err as { message?: string };
      alert(error?.message || "Gagal memuat riwayat");
    }
  }, [kodeQr]);

  const handleTampilkanUlang = useCallback((item: AntrianManual) => {
    setModalData({ nomor_antrian: item.nomor_antrian, hash: item.hash });
    setShowModal(true);
    setShowHistory(false);
  }, []);

  const handleCetak = useCallback((item?: AntrianManual) => {
    if (item) {
      setModalData({ nomor_antrian: item.nomor_antrian, hash: item.hash });
      setShowHistory(false);
    }
    // Trigger print after a short delay
    setTimeout(() => {
      try {
        printIframeRef.current?.contentWindow?.print();
      } catch (e) {
        window.print();
      }
    }, 500);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setModalData(null);
    if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
  }, []);

  const dateLabel = time
    ? time.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";
  const timeLabel = time
    ? time.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "";

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-8 p-8 select-none">
      {/* Hidden iframe for silent printing */}
      {modalData && (
        <iframe
          ref={printIframeRef}
          srcDoc={`
            <html>
              <head>
                <style>
                  @page { margin: 0; }
                  body {
                    font-family: 'Courier New', monospace;
                    text-align: center;
                    padding: 40px 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                  }
                  .header { font-size: 14px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px; }
                  .kantor-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
                  .ruangan-name { font-size: 14px; margin-bottom: 30px; }
                  .label { font-size: 16px; margin-bottom: 10px; }
                  .nomor { font-size: 72px; font-weight: bold; margin: 20px 0; letter-spacing: 5px; }
                  .info { font-size: 12px; margin-top: 30px; color: #666; }
                  .footer { font-size: 10px; margin-top: 40px; color: #999; }
                  @media print {
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                  }
                </style>
              </head>
              <body>
                <div class="header">Nomor Antrian</div>
                <div class="kantor-name">${info?.kantor.nama || alias}</div>
                <div class="ruangan-name">${info?.nama || ""}</div>
                <div class="label">Silahkan menuju ke</div>
                <div class="nomor">${modalData.nomor_antrian}</div>
                <div class="label">Tunggu nomor anda dipanggil</div>
                <div class="info">${new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
                <div class="info">${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</div>
                <div class="footer">Antrian Online - Nomor ini otomatis dicetak</div>
              </body>
            </html>
          `}
          style={{ position: "absolute", top: "-9999px", left: "-9999px", width: "1px", height: "1px", opacity: 0 }}
          title="print-frame"
        />
      )}

      {/* Header */}
      <div className="flex flex-col items-center gap-3 text-center">
        {info?.kantor.logo && (
          <img src={info.kantor.logo} alt="Logo" className="h-16 w-16 object-contain" />
        )}
        <p className="text-gray-400 text-sm uppercase tracking-widest font-medium">
          Ambil Nomor Antrian
        </p>
        <h1 className="text-4xl font-bold">{info?.kantor.nama ?? alias}</h1>
        {info && (
          <p className="text-blue-400 text-2xl font-medium">{info.nama}</p>
        )}
      </div>

      {/* QR Code */}
      <div className="bg-white p-6 rounded-3xl shadow-2xl">
        <QRCodeSVG value={queueUrl} size={300} level="M" includeMargin />
      </div>

      {/* Scan instruction */}
      <p className="text-gray-300 text-lg font-medium">
        Scan QR untuk mengambil nomor antrian
      </p>

      {/* Manual antrian buttons */}
      {manualAktif && (
        <div className="flex flex-col items-center gap-3 mt-2">
          <button
            onClick={handleAmbilAntrian}
            disabled={loadingManual}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white text-xl font-semibold rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            {loadingManual ? "Memproses..." : "📋 Ambil Antrian Manual"}
          </button>
          <button
            onClick={handleLihatRiwayat}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
          >
            Lihat Antrian Manual
          </button>
        </div>
      )}

      {/* URL (small) */}
      <p className="text-gray-600 text-xs text-center break-all max-w-md">
        {queueUrl}
      </p>

      {/* Clock */}
      <div className="text-center mt-2">
        <p className="text-white text-5xl font-mono font-bold tracking-wider">
          {timeLabel}
        </p>
        <p className="text-gray-400 text-base mt-2">{dateLabel}</p>
        <p className="text-gray-600 text-xs mt-2">
          QR diperbarui otomatis setiap tengah malam
        </p>
      </div>

      {/* ─── Modal Antrian Manual ──────────────────────────────────── */}
      {showModal && modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white text-black rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center relative animate-in zoom-in-95">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl leading-none p-1"
            >
              &times;
            </button>

            <div className="space-y-4">
              <p className="text-gray-500 text-sm uppercase tracking-widest font-medium">
                Nomor Antrian
              </p>
              <p className="text-gray-700 text-lg font-semibold">
                {info?.kantor.nama || alias}
              </p>
              <p className="text-blue-600 text-base">
                {info?.nama || ""}
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl py-8 px-4 my-4 border border-blue-100">
                <p className="text-gray-500 text-sm mb-2">Silahkan menuju ke</p>
                <p className="text-6xl font-bold tracking-[0.1em] text-gray-900">
                  {modalData.nomor_antrian}
                </p>
                <p className="text-gray-500 text-sm mt-2">Tunggu nomor anda dipanggil</p>
              </div>

              <button
                onClick={() => handleCetak()}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
              >
                🖨️ Cetak
              </button>

              <p className="text-xs text-gray-400">
                Modal akan tertutup otomatis dalam {manualTimeout} menit
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal Riwayat Antrian Manual ──────────────────────────── */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white text-black rounded-3xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in-95 max-h-[80vh] overflow-y-auto">
            <button
              onClick={() => setShowHistory(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl leading-none p-1"
            >
              &times;
            </button>

            <h2 className="text-xl font-bold mb-1">Riwayat Antrian Manual</h2>
            <p className="text-gray-500 text-sm mb-4">Nomor antrian yang telah diambil hari ini</p>

            {historyList.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Belum ada antrian manual hari ini</p>
            ) : (
              <div className="space-y-2">
                {historyList.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border">
                    <div>
                      <p className="text-lg font-bold tracking-wider">{item.nomor_antrian}</p>
                      <p className="text-xs text-gray-500">
                        {item.jenis_layanan} · {item.status === "menunggu" ? "Menunggu" : item.status === "dipanggil" ? "Dipanggil" : "Selesai"}
                        {item.is_printed ? " · Sudah dicetak" : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleTampilkanUlang(item)}
                        className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded-lg transition-colors"
                      >
                        Tampilkan
                      </button>
                      <button
                        onClick={() => handleCetak(item)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors"
                      >
                        Cetak
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
