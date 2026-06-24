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
  const [playbackRate, setPlaybackRate] = useState(1);
  const [bars, setBars] = useState<number[]>([]);
  const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

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

        <div className="px-6 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const audio = audioRef.current;
                if (audio) audio.currentTime = Math.max(0, audio.currentTime - 10);
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors shrink-0"
              title="Retroceder 10s"
            >
              <span className="material-symbols-outlined">replay_10</span>
            </button>
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
            <button
              onClick={() => {
                const audio = audioRef.current;
                if (audio) audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors shrink-0"
              title="Avançar 10s"
            >
              <span className="material-symbols-outlined">forward_10</span>
            </button>
            <div className="min-w-0 ml-2">
              <p className="text-label-md text-on-surface-variant">
                {String(Math.floor(currentTime / 60)).padStart(2, "0")}:{String(Math.floor(currentTime % 60)).padStart(2, "0")} / {String(Math.floor(duration / 60)).padStart(2, "0")}:{String(Math.floor(duration % 60)).padStart(2, "0")}
              </p>
            </div>
            <button
              onClick={() => {
                const currentIndex = SPEEDS.indexOf(playbackRate);
                const nextIndex = (currentIndex + 1) % SPEEDS.length;
                const newSpeed = SPEEDS[nextIndex];
                setPlaybackRate(newSpeed);
                const audio = audioRef.current;
                if (audio) audio.playbackRate = newSpeed;
              }}
              className={`ml-auto h-8 px-3 rounded-full text-xs font-semibold transition-colors shrink-0 ${playbackRate !== 1 ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}
              title="Velocidade de reprodução"
            >
              {playbackRate}x
            </button>
          </div>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={(e) => {
              const time = Number(e.target.value);
              const audio = audioRef.current;
              if (audio) audio.currentTime = time;
              setCurrentTime(time);
            }}
            className="w-full h-2 rounded-full appearance-none cursor-pointer bg-surface-container-high accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
          />
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
