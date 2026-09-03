"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { Loader2, Play, Volume2, VolumeX, Maximize, AlertCircle } from "lucide-react";

interface SecureVideoPlayerProps {
  mediaId: string;
  title?: string;
  onEnded?: () => void;
}

export default function SecureVideoPlayer({ mediaId, title, onEnded }: SecureVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestAccess = useCallback(() => {
    let cancelled = false;
    void fetch(`/api/media/${encodeURIComponent(mediaId)}/access`, { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok || body.type !== "video" || !body.url) throw new Error(body.error || "Playback authorization failed");
        if (!cancelled) setUrl(body.url);
      })
      .catch((reason: unknown) => { if (!cancelled) { setError(reason instanceof Error ? reason.message : "Unable to load video"); setLoading(false); } });
    return () => { cancelled = true; };
  }, [mediaId]);

  useEffect(() => requestAccess(), [requestAccess]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;
    let disposed = false;
    hlsRef.current?.destroy();
    hlsRef.current = null;
    const native = video.canPlayType("application/vnd.apple.mpegurl");
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => { if (!disposed) setLoading(false); });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) { hls.startLoad(); return; }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) { hls.recoverMediaError(); return; }
        if (!disposed) { setError("Playback failed. Please refresh and try again."); setLoading(false); }
      });
    } else if (native) {
      video.src = url;
      video.addEventListener("loadeddata", () => { if (!disposed) setLoading(false); }, { once: true });
    } else {
      const message = "Your browser does not support secure video playback.";
      const notify = () => { if (!disposed) { setError(message); setLoading(false); } };
      queueMicrotask(notify);
    }
    return () => { disposed = true; hlsRef.current?.destroy(); hlsRef.current = null; };
  }, [url]);

  const togglePlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) await video.play().catch(() => undefined); else video.pause();
  }, []);

  return (
    <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden group select-none" onContextMenu={(event) => event.preventDefault()}>
      {url && <video ref={videoRef} className="absolute inset-0 h-full w-full object-contain" controls={false} playsInline disablePictureInPicture onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={onEnded} onContextMenu={(event) => event.preventDefault()} />}
      {(loading || !url) && !error && <div className="absolute inset-0 flex items-center justify-center bg-slate-900"><Loader2 className="w-8 h-8 text-blue-500 animate-spin" /></div>}
      {error && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900 text-center p-6"><AlertCircle className="w-8 h-8 text-red-400" /><p className="text-xs text-slate-300 max-w-sm">{error}</p></div>}
      {url && !error && !loading && <div className="absolute inset-x-0 bottom-0 p-4 pt-12 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><button onClick={togglePlay} className="text-white" aria-label={playing ? "Pause video" : "Play video"}>{playing ? <span className="inline-block h-4 w-4 bg-white rounded-sm" /> : <Play className="w-5 h-5 fill-current" />}</button><button onClick={() => { setMuted((value) => !value); if (videoRef.current) videoRef.current.muted = !videoRef.current.muted; }} className="text-white" aria-label={muted ? "Unmute video" : "Mute video"}>{muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}</button></div><div className="flex items-center gap-3"><span className="text-[10px] text-white/70 truncate max-w-40">{title || "Lesson video"}</span><button onClick={() => videoRef.current?.requestFullscreen()} className="text-white" aria-label="Fullscreen"><Maximize className="w-4 h-4" /></button></div></div></div>}
    </div>
  );
}
