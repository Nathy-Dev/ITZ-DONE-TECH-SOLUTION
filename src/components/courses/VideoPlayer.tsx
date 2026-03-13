"use client";

import React, { useState } from "react";
import ReactPlayer from "react-player/lazy";
import { Loader2, Play, Maximize, Volume2, VolumeX } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  onEnded?: () => void;
  title?: string;
}

export default function VideoPlayer({ url, onEnded, title }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  return (
    <div className="relative aspect-video w-full bg-black rounded-[2rem] overflow-hidden group shadow-2xl">
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
        </div>
      )}

      <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        playing={playing}
        muted={muted}
        onReady={() => setLoading(false)}
        onEnded={onEnded}
        onProgress={(state: { played: number }) => setProgress(state.played * 100)}
        config={{
          youtube: {
            playerVars: { modestbranding: 1, rel: 0 }
          }
        }}
        className="absolute top-0 left-0"
      />

      {/* Custom Controls Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 md:p-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-4">
                <button 
                  onClick={() => setPlaying(!playing)}
                  className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-95"
                >
                  {playing ? <div className="w-4 h-4 bg-white rounded-sm" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                </button>
                <button 
                  onClick={() => setMuted(!muted)}
                  className="p-2 text-white/70 hover:text-white transition-colors"
                >
                  {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
             </div>
             
             <div className="flex items-center gap-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{title || "Lesson Video"}</span>
                <button className="p-2 text-white/70 hover:text-white transition-colors">
                  <Maximize className="w-4 h-4" />
                </button>
             </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
             <div 
              className="absolute left-0 top-0 h-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
             />
          </div>
        </div>
      </div>

      {/* Big Play Button (Center) */}
      {!playing && !loading && (
        <button 
          onClick={() => setPlaying(true)}
          className="absolute inset-0 z-10 flex items-center justify-center group/play"
        >
          <div className="w-24 h-24 bg-blue-800/80 text-white rounded-full flex items-center justify-center shadow-2xl backdrop-blur-sm group-hover/play:scale-110 group-hover/play:bg-blue-800 transition-all">
            <Play className="w-10 h-10 fill-current ml-2" />
          </div>
        </button>
      )}
    </div>
  );
}
