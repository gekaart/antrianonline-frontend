"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { api } from "@/lib/api";

interface RuanganInfo {
  nama: string;
  kantor: { nama: string; logo?: string | null };
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
  const [time, setTime] = useState(new Date());
  const [origin, setOrigin] = useState("");
  const midnightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      const d = await api.get<{ ruangan: { nama: string; kantor: { nama: string; logo?: string | null } } }>(
        `/api/public/ruangan/kode-qr/${kode}`
      );
      setInfo({ nama: d.ruangan.nama, kantor: d.ruangan.kantor });
    };
    fetchInfo(true).catch(() => fetchInfo(false).catch(() => {}));
  }, [kodeQr, todayStr]);

  // Clock — tick every second
  useEffect(() => {
    const tick = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, []);

  // Auto-refresh QR at midnight (update todayStr which triggers re-render + re-fetch)
  useEffect(() => {
    function scheduleRefresh() {
      const ms = getMsUntilMidnight();
      midnightTimerRef.current = setTimeout(() => {
        setTodayStr(getTodayStr());
        scheduleRefresh(); // reschedule for next midnight
      }, ms + 500); // +500ms buffer past midnight
    }
    scheduleRefresh();
    return () => {
      if (midnightTimerRef.current) clearTimeout(midnightTimerRef.current);
    };
  }, []);

  const dateLabel = time.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeLabel = time.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-8 p-8 select-none">
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
    </div>
  );
}
