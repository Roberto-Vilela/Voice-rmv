import { useEffect, useRef, useState } from "react";
import type { Task } from "../types";

interface Props {
  task: Task;
  onClose: () => void;
}

function displayName(task: Task): string {
  if (task.extra_data?.display_name) return task.extra_data.display_name;
  return task.input_file || task.input_text || task.input_url || "Untitled";
}

export default function AudioModal({ task, onClose }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bars, setBars] = useState<number[]>([]);

  useEffect(() => {
    setBars(Array.from({ length: 60 }, () => Math.random() * 80 + 20));
  }, [task.id]);

  useEffect(() => {
    const audio = new Audio(task.audio_url);
    audioRef.current = audio;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => { setPlaying(false); setCurrentTime(0); };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
    };
  }, [task.audio_url]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (playing) {
      interval = setInterval(() => {
        setBars((current) => current.map((bar) => Math.max(20, Math.min(100, bar + (Math.random() * 20 - 10)))));
      }, 300);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [playing]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { e.stopPropagation(); if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="min-w-0">
            <h3 className="text-headline-md text-on-surface truncate">{displayName(task)}</h3>
            <p className="text-body-sm text-on-surface-variant">{task.voice}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors shrink-0"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (!audioRef.current) audioRef.current = new Audio(task.audio_url);
                if (playing) {
                  audioRef.current.pause();
                  setPlaying(false);
                } else {
                  audioRef.current.currentTime = 0;
                  audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
                }
              }}
              className={`w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-primary/20 shrink-0 ${playing ? "animate-pulse" : ""}`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: 32 }}>
                {playing ? "pause" : "play_arrow"}
              </span>
            </button>
            <div className="min-w-0">
              <p className="text-label-md text-on-surface-variant">
                {String(Math.floor(currentTime / 60)).padStart(2, "0")}:{String(Math.floor(currentTime % 60)).padStart(2, "0")} / {String(Math.floor(duration / 60)).padStart(2, "0")}:{String(Math.floor(duration % 60)).padStart(2, "0")}
              </p>
            </div>
          </div>
        </div>

        <div className="mx-6 mb-6 flex items-end gap-1 h-20 w-[calc(100%-3rem)] rounded-2xl bg-surface-container-low px-3 py-3 overflow-hidden">
          {bars.map((bar, index) => {
            const progress = duration > 0 ? currentTime / duration : 0;
            const active = index / bars.length <= progress;
            return (
              <div
                key={index}
                className={`w-2 flex-none rounded-full transition-all duration-200 ${active ? "bg-primary" : "bg-secondary-container"}`}
                style={{ height: `${bar}%` }}
              />
            );
          })}
        </div>

        {task.transcription && (
          <div className="px-6 pb-6">
            <p className="text-label-sm text-outline mb-1">Transcription</p>
            <p className="text-body-sm text-on-surface bg-surface-container rounded-xl p-3 max-h-24 overflow-y-auto">
              {task.transcription}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
