import { useEffect, useRef, useState } from "react";
import VideoTemplate from "./VideoTemplate";

const TOTAL_DURATION_MS = 3500 + 4000 + 5000 + 5000 + 4000 + 4000; // 25 500 ms

type Status = "idle" | "permission" | "recording" | "done" | "error";

export default function RecordPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  }, []);

  async function startCapture() {
    setStatus("permission");
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({
        video: { frameRate: 30 },
        audio: false,
        preferCurrentTab: true,
      } as any);

      chunksRef.current = [];
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setDownloadUrl(URL.createObjectURL(blob));
        setStatus("done");
        if (intervalRef.current) clearInterval(intervalRef.current);
      };

      recorder.start(200);
      setStatus("recording");
      setProgress(0);

      const startedAt = Date.now();
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startedAt;
        const pct = Math.min(100, (elapsed / TOTAL_DURATION_MS) * 100);
        setProgress(pct);
        if (elapsed >= TOTAL_DURATION_MS) {
          recorder.stop();
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }, 100);
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  function cancelRecording() {
    recorderRef.current?.stop();
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStatus("idle");
    setProgress(0);
  }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* The live video plays underneath */}
      <VideoTemplate />

      {/* HUD overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-end pb-10 z-50">
        <div className="pointer-events-auto bg-black/70 backdrop-blur-md rounded-2xl border border-white/10 p-6 w-[420px] shadow-2xl space-y-4">
          {status === "idle" && (
            <>
              <p className="text-white/80 text-sm text-center">
                Records the full demo loop (~26 s) and saves it as a
                downloadable <strong className="text-white">WebM</strong> file.
              </p>
              <p className="text-white/50 text-xs text-center">
                When the browser asks what to share, choose
                <strong className="text-white/80"> "This Tab"</strong>.
              </p>
              <button
                onClick={startCapture}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
              >
                <span className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />
                Start Recording
              </button>
            </>
          )}

          {status === "permission" && (
            <p className="text-white/60 text-sm text-center animate-pulse">
              Waiting for browser permission…
            </p>
          )}

          {status === "recording" && (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                <span className="text-white text-sm font-semibold">
                  Recording — {Math.round(progress)}%
                </span>
                <span className="text-white/40 text-xs ml-auto">
                  ~{Math.round((TOTAL_DURATION_MS * (1 - progress / 100)) / 1000)}s left
                </span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <button
                onClick={cancelRecording}
                className="w-full py-2 rounded-xl border border-white/20 text-white/50 hover:text-white text-sm transition-colors"
              >
                Cancel
              </button>
            </>
          )}

          {status === "done" && downloadUrl && (
            <>
              <p className="text-green-400 text-sm text-center font-semibold">
                ✓ Recording complete!
              </p>
              <a
                href={downloadUrl}
                download="vaultalk-demo.webm"
                className="block w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold text-sm text-center transition-all"
              >
                ↓ Download vaultalk-demo.webm
              </a>
              <button
                onClick={() => {
                  setStatus("idle");
                  setProgress(0);
                  setDownloadUrl(null);
                }}
                className="w-full py-2 rounded-xl border border-white/20 text-white/50 hover:text-white text-sm transition-colors"
              >
                Record Again
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <p className="text-red-400 text-sm text-center">
                Permission denied or recording failed.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="w-full py-2 rounded-xl border border-white/20 text-white/50 hover:text-white text-sm transition-colors"
              >
                Try Again
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
