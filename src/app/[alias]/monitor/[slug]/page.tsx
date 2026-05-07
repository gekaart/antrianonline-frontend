"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useWebSocket } from "@/hooks/useWebSocket";
import { wsManager } from "@/lib/ws";
import { Spinner } from "@/components/ui/spinner";
import { Building2, Volume2, VolumeX, Terminal } from "lucide-react";

interface AntrianAktif {
  id: number;
  nomor_antrian: string;
  nama_pengunjung?: string;
  jl_nama?: string;
}

interface MejaInfo {
  id: number;
  nomor_meja: number;
  id_petugas_aktif: number | null;
  status_tersedia: boolean | number;
  petugas_aktif: { id: number; nama: string } | null;
  antrian_aktif: AntrianAktif | null;
}

interface RecentlyServed {
  nomor_antrian: string;
  nama_pengunjung?: string;
  jl_nama?: string;
}

interface MonitorData {
  kantor: {
    nama: string;
    logo?: string | null;
    running_text?: string;
    media_informasi?: string;
    aktif_running_text?: boolean | number;
  };
  ruangan: {
    id: number;
    nama: string;
  };
  meja: MejaInfo[];
  recently_served: RecentlyServed[];
  waiting_count: number;
}

// ── Dynamic sizing helpers ──────────────────────────────────────────────────
// Use fixed column counts so cards always fill available space
function getMejaGridCols(count: number): string {
  if (count <= 1) return "repeat(1, 1fr)";
  if (count <= 2) return "repeat(2, 1fr)";
  if (count <= 4) return "repeat(2, 1fr)";
  if (count <= 6) return "repeat(3, 1fr)";
  if (count <= 9) return "repeat(3, 1fr)";
  return "repeat(4, 1fr)";
}
function getMejaRowCount(count: number): number {
  if (count <= 1) return 1;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return Math.ceil(count / 4);
}
function getMejaNomorSize(count: number): string {
  if (count <= 2) return "text-[10rem] leading-none";
  if (count <= 4) return "text-9xl";
  if (count <= 6) return "text-8xl";
  if (count <= 9) return "text-7xl";
  return "text-6xl";
}
// YouTube panel: percentage of container so it scales with screen size
function getYoutubePanelWidth(count: number): string {
  if (count <= 2) return "w-[48%]";
  if (count <= 4) return "w-[50%]";
  if (count <= 8) return "w-[42%]";
  return "w-[34%]";
}

export default function MonitorPage() {
  const params = useParams<{ alias: string; slug: string }>();
  const { alias, slug } = params;
  // Read token from URL query string (client-side only; not rendered in JSX so no hydration mismatch)
  const monitorToken = typeof window !== 'undefined'
    ? (new URLSearchParams(window.location.search).get('token') ?? '')
    : '';
  const [data, setData] = useState<MonitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [calledQueue, setCalledQueue] = useState<{ nomor: string; meja: number } | null>(null);
  const calledTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const tokenParam = monitorToken ? `?token=${encodeURIComponent(monitorToken)}` : '';
      const d = await api.get<MonitorData>(`/api/public/monitor/${alias}/${slug}${tokenParam}`);
      setData(d);
    } catch {
      // silent on poll
    } finally {
      setLoading(false);
    }
  }, [alias, slug, monitorToken]);

  useEffect(() => {
    fetchData();
    pollRef.current = setInterval(fetchData, 2000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchData]);

  const roomId = data?.ruangan.id ? String(data.ruangan.id) : null;

  const [audioLog, setAudioLog] = useState<string[]>([]);
  const [showLog, setShowLog] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioUnlockedRef = useRef(false);
  const [resetNotif, setResetNotif] = useState<string | null>(null);
  const resetNotifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Live clock
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Announcement queue — prevents multiple simultaneous calls from overlapping
  const announcementQueueRef = useRef<Array<{ nomor: string; meja: number }>>([]);
  const announcingRef = useRef(false);
  // Track nomors that are enqueued or currently being announced to avoid race duplicates
  const announcementSetRef = useRef<Set<string>>(new Set());

  function addLog(msg: string) {
    const ts = new Date().toLocaleTimeString("id-ID", { hour12: false });
    const line = `[${ts}] ${msg}`;
    console.log("[MonitorAudio]", line);
    setAudioLog((prev) => [...prev.slice(-49), line]);
  }

  // Unlock AudioContext on first user interaction
  useEffect(() => {
    function unlock() {
      if (audioUnlockedRef.current) return;
      audioUnlockedRef.current = true;
      addLog("Interaksi pengguna terdeteksi — audio context dibuka");
      if ("speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance("");
        window.speechSynthesis.speak(u);
        addLog(`SpeechSynthesis tersedia, jumlah suara: ${window.speechSynthesis.getVoices().length}`);
      } else {
        addLog("SpeechSynthesis TIDAK tersedia di browser ini");
      }
    }
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    return () => {
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  // Log info WebSocket URL
  useEffect(() => {
    const wsBase = process.env.NEXT_PUBLIC_WS_URL || "(tidak diset, pakai proxy frontend)";
    addLog(`NEXT_PUBLIC_WS_URL = ${wsBase}`);
    addLog(`Browser: ${navigator.userAgent.split(" ").slice(-2).join(" ")}`);
  }, []);

  // Langganan event status WebSocket
  useEffect(() => {
    const unsubscribe = wsManager.onStatus((event, detail) => {
      const label: Record<string, string> = {
        connecting: "🔄 WS menghubungkan",
        connected: "✅ WS terhubung",
        disconnected: "❌ WS terputus",
        message: "📨 WS pesan diterima",
        error: "⚠️ WS error",
      };
      addLog(`${label[event] ?? event}: ${detail}`);
    });
    return () => { unsubscribe(); };
  }, []);

  // Log suara yang tersedia saat dimuat
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const logVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      const id = voices.filter((v) => v.lang.startsWith("id"));
      addLog(`Suara tersedia: ${voices.length} total, ${id.length} bahasa Indonesia (${id.map((v) => v.name).join(", ") || "tidak ada"})`);
    };
    window.speechSynthesis.addEventListener("voiceschanged", logVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", logVoices);
  }, []);

  function unlockAudio() {
    if (audioUnlockedRef.current) return;
    audioUnlockedRef.current = true;
    addLog("Audio dibuka secara manual");
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance("");
      window.speechSynthesis.speak(u);
    }
    // Resume suspended AudioContext by creating and immediately closing one
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        ctx.resume().then(() => ctx.close());
      }
    } catch {/* ignore */}
  }

  function toggleAudio() {
    setAudioEnabled((prev) => {
      const next = !prev;
      addLog(next ? "🔊 Audio diaktifkan" : "🔇 Audio dinonaktifkan");
      if (next) unlockAudio();
      return next;
    });
  }

  function playDing(): Promise<void> {
    return new Promise((resolve) => {
      if (!audioEnabled) {
        addLog("playDing() dipanggil — audio disabled, skipping");
        resolve();
        return;
      }
      addLog("playDing() dipanggil");
      // Preload audio untuk menghindari NotSupportedError
      const audioUrl = "/sounds/freesound_community-ding-47489.mp3";
      const audio = new Audio();
      audio.volume = 0.85;
      
      const onCanPlay = () => {
        addLog(`✅ Audio siap dimainkan: ${audioUrl}`);
        audio.play()
          .then(() => addLog(`✅ Suara ding mulai diputar (mp3): ${audioUrl}`))
          .catch((err) => {
            addLog(`⚠️ Gagal play() MP3: ${err} — fallback ke WAV`);
            // Fallback ke WAV
            const audio2 = new Audio("/sounds/ding.wav");
            audio2.volume = 0.85;
            audio2.addEventListener("ended", () => { addLog("✅ Suara ding selesai (wav)"); resolve(); });
            audio2.addEventListener("error", () => {
              addLog("❌ WAV juga gagal — fallback oscillator");
              playFallbackOscillator(resolve);
            });
            audio2.play().catch(() => playFallbackOscillator(resolve));
          });
      };
      
      const onError = () => {
        addLog(`⚠️ Audio MP3 gagal dimuat — fallback ke WAV`);
        const audio2 = new Audio("/sounds/ding.wav");
        audio2.volume = 0.85;
        audio2.addEventListener("ended", () => { addLog("✅ Suara ding selesai (wav)"); resolve(); });
        audio2.addEventListener("error", () => {
          addLog("❌ WAV juga gagal — fallback oscillator");
          playFallbackOscillator(resolve);
        });
        audio2.play().catch(() => playFallbackOscillator(resolve));
      };
      
      audio.addEventListener("canplaythrough", onCanPlay, { once: true });
      audio.addEventListener("error", onError, { once: true });
      audio.preload = "auto";
      audio.src = audioUrl;
      audio.load();
    });
  }

  function playFallbackOscillator(resolve: () => void) {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) { addLog("AudioContext TIDAK didukung"); resolve(); return; }
      const ctx = new AudioCtx();
      addLog(`Status AudioContext (fallback): ${ctx.state}`);
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.6);
      oscillator.onended = () => { ctx.close(); addLog("✅ Suara ding berhasil (oscillator fallback)"); resolve(); };
    } catch (e) {
      addLog(`❌ Fallback oscillator gagal: ${e}`);
      resolve();
    }
  }

  function angkaKeKata(n: number): string {
    if (n === 0) return "nol";
    const satuan = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan"];
    const belasan = ["sepuluh", "sebelas", "dua belas", "tiga belas", "empat belas", "lima belas",
                     "enam belas", "tujuh belas", "delapan belas", "sembilan belas"];
    if (n < 10) return satuan[n];
    if (n < 20) return belasan[n - 10];
    if (n < 100) {
      const tens = Math.floor(n / 10);
      const ones = n % 10;
      return satuan[tens] + " puluh" + (ones > 0 ? " " + satuan[ones] : "");
    }
    if (n < 200) {
      const rem = n - 100;
      return "seratus" + (rem > 0 ? " " + angkaKeKata(rem) : "");
    }
    if (n < 1000) {
      const hundreds = Math.floor(n / 100);
      const rem = n % 100;
      return satuan[hundreds] + " ratus" + (rem > 0 ? " " + angkaKeKata(rem) : "");
    }
    return String(n);
  }

  function speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (!audioEnabled) { resolve(); return; }
      addLog(`speak() dipanggil: "${text}"`);
      if (!("speechSynthesis" in window)) {
        addLog("❌ speechSynthesis tidak ada di browser ini");
        resolve();
        return;
      }
      if (!audioUnlockedRef.current) {
        addLog("⚠️ Audio belum dibuka (belum ada interaksi) — TTS mungkin diblokir");
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      utterance.rate = 0.85;
      utterance.pitch = 1;
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find((v) => v.lang.startsWith("id"));
      if (idVoice) { utterance.voice = idVoice; addLog(`Menggunakan suara: ${idVoice.name}`); }
      else { addLog(`Tidak ada suara id-ID, pakai default browser (${voices[0]?.name ?? "tidak ada"})`); }
      utterance.onstart = () => addLog("✅ TTS mulai berbicara");
      utterance.onend  = () => { addLog("✅ TTS selesai"); resolve(); };
      utterance.onerror = (e) => { addLog(`❌ TTS error: ${e.error}`); resolve(); };
      window.speechSynthesis.speak(utterance);
    });
  }

  function buildAnnouncementText(nomor: string, meja: number): string {
    const numPart = parseInt(nomor.replace(/[A-Za-z]/g, ""), 10);
    const letter = nomor.replace(/[^A-Za-z]/g, "").toUpperCase();
    const angkaStr = isNaN(numPart) ? "" : angkaKeKata(numPart);
    const mejaStr = meja > 0 ? angkaKeKata(meja) : String(meja);
    return `Nomor ${letter ? letter + " " : ""}${angkaStr}, silakan menuju meja ${mejaStr}`;
  }

  async function processAnnouncements() {
    if (announcingRef.current) return; // already running
    announcingRef.current = true;
    addLog(`📢 Mulai memproses antrian pengumuman`);
    while (announcementQueueRef.current.length > 0) {
      const item = announcementQueueRef.current.shift()!;
      addLog(`📢 Memanggil ${item.nomor} meja ${item.meja} (${announcementQueueRef.current.length} antri berikutnya)`);
      setCalledQueue({ nomor: item.nomor, meja: item.meja });
      if (calledTimerRef.current) clearTimeout(calledTimerRef.current);
      calledTimerRef.current = setTimeout(() => setCalledQueue(null), 6000);
      await playDing();
      await speak(buildAnnouncementText(item.nomor, item.meja));
      // Brief gap between consecutive announcements
      if (announcementQueueRef.current.length > 0) {
        await new Promise<void>((r) => setTimeout(r, 600));
      }
      // remove from set so same nomor can be re-enqueued in future
      try { announcementSetRef.current.delete(item.nomor); } catch (_) { /* ignore */ }
    }
    announcingRef.current = false;
    addLog("📢 Antrian pengumuman selesai");
  }

  useWebSocket(roomId, "queue_called", (payload: unknown) => {
    addLog(`📣 queue_called diterima: ${JSON.stringify(payload)}`);
    const p = payload as { nomor_antrian?: string; nomor_meja?: number } | null;
    if (!p) { addLog("⚠️ payload queue_called kosong — diabaikan"); return; }
    fetchData();
    const nomor = p.nomor_antrian || "";
    const meja = p.nomor_meja || 0;
    // Deduplicate robustly using announcementSetRef to avoid race conditions
    if (announcementSetRef.current.has(nomor)) {
      addLog(`⛔ Duplikat pengumuman terdeteksi (set), melewati: ${nomor} meja ${meja}`);
      return;
    }
    announcementSetRef.current.add(nomor);
    announcementQueueRef.current.push({ nomor, meja });
    addLog(`📣 Ditambahkan ke antrian pengumuman: ${nomor} meja ${meja} (total: ${announcementQueueRef.current.length})`);
    processAnnouncements();
  });

  useWebSocket(roomId, "queue_updated", () => { addLog("📨 queue_updated diterima"); fetchData(); });

  useWebSocket(roomId, "auto_reset", (payload) => {
    const p = payload as { pesan?: string } | null;
    const msg = p?.pesan || 'Telah dilakukan reset nomor karena lewat hari, harap cek nomor antrian anda';
    setResetNotif(msg);
    if (resetNotifTimerRef.current) clearTimeout(resetNotifTimerRef.current);
    resetNotifTimerRef.current = setTimeout(() => setResetNotif(null), 60000);
    fetchData();
  });

  // Preload audio file agar siap saat dipanggil
  useEffect(() => {
    const preloadAudio = new Audio();
    preloadAudio.preload = "auto";
    preloadAudio.src = "/sounds/freesound_community-ding-47489.mp3";
    preloadAudio.load();
    addLog("🎵 Audio MP3 di-preload");
    // Juga preload WAV sebagai cadangan
    const preloadWav = new Audio();
    preloadWav.preload = "auto";
    preloadWav.src = "/sounds/ding.wav";
    preloadWav.load();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <Spinner size="lg" className="border-t-blue-400" />
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <p className="text-gray-500">Monitor tidak ditemukan.</p>
    </div>
  );

  const { kantor, ruangan, meja, recently_served, waiting_count } = data;

  // Parse YouTube embed ID
  let youtubeId: string | null = null;
  if (kantor.media_informasi) {
    const match = kantor.media_informasi.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
    );
    if (match) youtubeId = match[1];
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col overflow-hidden">
      {/* Called notification overlay */}
      {calledQueue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 pointer-events-none">
          <div className="bg-blue-600 rounded-3xl px-16 py-10 text-center shadow-2xl animate-bounce">
            <div className="text-2xl text-blue-200 mb-2">Nomor Dipanggil</div>
            <div className="text-8xl font-black tracking-widest text-white">{calledQueue.nomor}</div>
            <div className="text-xl text-blue-200 mt-3">Silakan ke Meja {calledQueue.meja}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Logo + Kantor + Ruangan */}
          <div className="flex items-center gap-4">
            {kantor.logo ? (
              <img src={kantor.logo} alt="Logo" className="h-14 w-14 object-contain flex-shrink-0 rounded-xl" />
            ) : (
              <div className="h-14 w-14 bg-blue-800/50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="h-8 w-8 text-blue-400" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white leading-tight">{kantor.nama}</h1>
              <p className="text-blue-300 text-sm font-medium">{ruangan.nama}</p>
            </div>
          </div>

          {/* Right: Waiting count + Clock */}
          <div className="flex items-center gap-10">
            <div className="text-center bg-blue-900/40 border border-blue-800 rounded-2xl px-6 py-2">
              <div className="text-4xl font-bold text-blue-300 leading-none">{waiting_count}</div>
              <div className="text-xs text-blue-400 mt-1 uppercase tracking-widest">Menunggu</div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-mono font-bold text-white tabular-nums">
                {time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </div>
              <div className="text-sm text-gray-400 mt-0.5">
                {time.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </div>
              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  onClick={toggleAudio}
                  title={audioEnabled ? "Matikan Suara" : "Aktifkan Suara"}
                  className={`p-1.5 rounded-md transition-colors text-sm ${
                    audioEnabled
                      ? "text-green-400 bg-green-900/20 hover:bg-green-900/40"
                      : "text-gray-500 bg-gray-800 hover:text-gray-300"
                  }`}
                >
                  {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => { setShowLog((v) => !v); addLog("Log panel toggled"); }}
                  title="Toggle Debug Log"
                  className={`p-1.5 rounded-md transition-colors text-sm ${
                    showLog ? "text-yellow-400 bg-yellow-900/20" : "text-gray-500 bg-gray-800 hover:text-gray-300"
                  }`}
                >
                  <Terminal className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Reset notification banner */}
      {resetNotif && (
        <div className="bg-yellow-600 border-b border-yellow-700 px-6 py-3 flex items-center justify-between z-20">
          <p className="text-white font-medium text-sm">⚠️ {resetNotif}</p>
          <button
            onClick={() => setResetNotif(null)}
            className="text-yellow-200 hover:text-white text-xs ml-4 border border-yellow-400 rounded px-2 py-1"
          >
            Tutup ✕
          </button>
        </div>
      )}

      {/* Audio debug log panel */}
      {showLog && (
        <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-yellow-400 font-bold uppercase tracking-widest">Audio Debug Log</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  addLog("Manual test: memasukkan ke antrian pengumuman");
                  announcementQueueRef.current.push({ nomor: "A001", meja: 1 });
                  processAnnouncements();
                }}
                className="text-xs bg-blue-700 hover:bg-blue-600 text-white rounded px-2 py-1"
              >
                ▶ Test Suara
              </button>
              <button onClick={() => setAudioLog([])} className="text-xs text-gray-500 hover:text-gray-300">Clear</button>
            </div>
          </div>
          {audioLog.length === 0 && <p className="text-xs text-gray-600">Belum ada log. Klik di mana saja dulu untuk mengaktifkan audio.</p>}
          {audioLog.map((line, i) => (
            <div key={i} className="text-xs font-mono text-green-400 leading-5">{line}</div>
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Counter grid — fills available height, fixed column count based on desk count */}
        <div
          className="flex-1 grid gap-4 overflow-hidden"
          style={{
            gridTemplateColumns: getMejaGridCols(meja.length),
            gridTemplateRows: `repeat(${getMejaRowCount(meja.length)}, 1fr)`,
          }}
        >
          {meja.map((m) => (
            <div
              key={m.id}
              className={`rounded-2xl border flex flex-col items-center justify-center text-center transition-all p-6 ${
                m.antrian_aktif
                  ? "bg-blue-900/80 border-blue-500 shadow-xl shadow-blue-900/60"
                  : "bg-gray-900 border-gray-800"
              }`}
            >
              <div className={`text-base font-bold mb-3 px-4 py-1.5 rounded-full ${m.antrian_aktif ? "text-blue-200 bg-blue-800/60" : "text-gray-500 bg-gray-800"}`}>
                Meja {m.nomor_meja}
              </div>
              {m.antrian_aktif ? (
                <>
                  <div className={`${getMejaNomorSize(meja.length)} font-black text-white leading-none mb-2 tracking-tight`}>
                    {m.antrian_aktif.nomor_antrian}
                  </div>
                  {m.antrian_aktif.jl_nama && (
                    <div className="text-sm text-blue-300 mb-1 font-medium">{m.antrian_aktif.jl_nama}</div>
                  )}
                  {m.antrian_aktif.nama_pengunjung && (
                    <div className="text-sm text-gray-300 truncate max-w-full">{m.antrian_aktif.nama_pengunjung}</div>
                  )}
                  {m.petugas_aktif?.nama && (
                    <div className="text-xs text-gray-400 mt-2 italic">{m.petugas_aktif.nama}</div>
                  )}
                </>
              ) : (
                <div className="text-5xl font-bold text-gray-700">—</div>
              )}
            </div>
          ))}
        </div>

        {/* Right panel: YouTube (dynamic width) + recently served */}
        {youtubeId ? (
          <div className={`${getYoutubePanelWidth(meja.length)} flex flex-col gap-4 flex-shrink-0`}>
            <div className="rounded-2xl overflow-hidden aspect-video bg-black flex-shrink-0">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0`}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
            {recently_served.length > 0 && (
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 flex-1 overflow-y-auto">
                <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3 font-semibold">✔ Selesai Dilayani</h3>
                <div className="space-y-2">
                  {recently_served.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-800 rounded-lg px-3 py-2">
                      <div className="font-bold text-green-400 text-lg">{r.nomor_antrian}</div>
                      {r.jl_nama && <div className="text-xs text-blue-300 truncate">{r.jl_nama}</div>}
                      {r.nama_pengunjung && <div className="text-sm text-gray-400 truncate flex-1">{r.nama_pengunjung}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          recently_served.length > 0 && (
            <div className="w-72 flex-shrink-0">
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 h-full overflow-y-auto">
                <h3 className="text-xs uppercase tracking-widest text-gray-500 mb-3 font-semibold">✔ Selesai Dilayani</h3>
                <div className="space-y-2">
                  {recently_served.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-800 rounded-lg px-3 py-2">
                      <div className="font-bold text-green-400 text-lg">{r.nomor_antrian}</div>
                      {r.jl_nama && <div className="text-xs text-blue-300 truncate">{r.jl_nama}</div>}
                      {r.nama_pengunjung && <div className="text-sm text-gray-400 truncate flex-1">{r.nama_pengunjung}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Running text marquee — show when text is set (regardless of aktif flag, admin can clear text to disable) */}
      {kantor.running_text && (
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 py-2.5 overflow-hidden">
          <div className="whitespace-nowrap animate-marquee text-white text-sm font-medium inline-block">
            {kantor.running_text}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;{kantor.running_text}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
          </div>
        </div>
      )}

      {/* Bottom control bar (label only) */}
      <div className="bg-gray-900 border-t border-gray-800 px-6 py-2">
        <p className="text-center text-gray-500 text-xs">AntriOnline Monitor</p>
      </div>
    </div>
  );
}