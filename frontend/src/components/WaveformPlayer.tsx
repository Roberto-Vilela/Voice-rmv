import { useEffect, useRef, useState } from "react";
import type { Task } from "../types";
import { patchTask } from "../api/client";

interface Props {
  task: Task | null;
  onTimeUpdate?: (time: number) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function displayName(task: Task): string {
  if (task.extra_data?.display_name) return task.extra_data.display_name;
  return task.input_file || task.input_text || task.input_url || "Untitled";
}

export default function WaveformPlayer({ task, onTimeUpdate }: Props) {
  const wrapperRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const barsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    barsRef.current.forEach((b) => b.remove());
    barsRef.current = [];
    const count = 100;
    for (let i = 0; i < count; i++) {
      const bar = document.createElement("div");
      bar.className = "waveform-bar flex-grow bg-secondary-container rounded-t-sm";
      bar.style.height = `${Math.random() * 80 + 20}%`;
      container.appendChild(bar);
      barsRef.current.push(bar);
    }
  }, [task?.id]);

  useEffect(() => {
    if (wrapperRef.current) {
      wrapperRef.current.dataset.playing = playing ? "true" : "false";
    }
    let interval: ReturnType<typeof setInterval> | null = null;
    if (playing) {
      interval = setInterval(() => {
        barsRef.current.forEach((bar) => {
          bar.style.height = `${Math.random() * 72 + 28}%`;
        });
      }, 140);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [playing]);

  useEffect(() => {
    if (!task?.audio_url) return;

    // Inicializa o objeto de áudio apenas uma vez por mudança de task
    const audio = new Audio(task.audio_url);
    audioRef.current = audio;

    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    let rafId: number;
    const updateTime = () => {
      if (audioRef.current) {
        const time = audioRef.current.currentTime;
        setCurrentTime(time);
        onTimeUpdate?.(time);
        if (playing) {
          rafId = requestAnimationFrame(updateTime);
        }
      }
    };

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => {
      setPlaying(false);
      setCurrentTime(0);
      onTimeUpdate?.(0);
      cancelAnimationFrame(rafId);
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);
    
    return () => {
      audio.pause();
      cancelAnimationFrame(rafId);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
      audioRef.current = null;
    };
  }, [task?.audio_url]);

  // Efeito separado para controlar o loop de animação conforme o estado playing
  useEffect(() => {
    let rafId: number;
    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
        onTimeUpdate?.(audioRef.current.currentTime);
        if (playing) {
          rafId = requestAnimationFrame(updateTime);
        }
      }
    };

    if (playing) {
      rafId = requestAnimationFrame(updateTime);
    }
    return () => cancelAnimationFrame(rafId);
  }, [playing]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch((e) => {
        console.error("Playback failed:", e);
      });
    }
  };

  const handleRename = async () => {
    if (!task) return;
    const current = displayName(task);
    const name = prompt("Rename file:", current);
    if (name && name !== current) {
      await patchTask(task.id, { display_name: name });
      window.location.reload();
    }
  };

  const handleShare = async () => {
    if (!task?.audio_url) return;
    const fullUrl = `${window.location.origin}${task.audio_url}`;
    if (navigator.share) {
      await navigator.share({ title: displayName(task), text: task.transcription || "", url: fullUrl });
    } else {
      await navigator.clipboard.writeText(fullUrl);
      alert("Link copied to clipboard!");
    }
  };

  const total = task?.duration_seconds || duration;
  const current = currentTime;

  if (!task || !task.audio_url) {
    return (
      <section className="waveform-player bg-white p-6 rounded-2xl border border-outline-variant shadow-sm overflow-hidden" ref={wrapperRef}>
        <p className="text-body-sm text-on-surface-variant text-center">No audio yet. Upload or generate a narration to play here.</p>
      </section>
    );
  }

  return (
    <section
      ref={wrapperRef}
      className="waveform-player relative bg-white p-6 rounded-2xl border border-outline-variant shadow-sm overflow-hidden"
      data-playing={playing ? "true" : "false"}
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4 min-w-0">
          <button
            data-editor-player-play-button="true"
            onClick={handlePlayPause}
            className={`waveform-play-button w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-primary/20 shrink-0 ${playing ? "is-playing" : ""}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: 32 }}>
              {playing ? "pause" : "play_arrow"}
            </span>
          </button>
          <div className="min-w-0">
            <p className="text-label-md text-on-surface truncate">{displayName(task)}</p>
            <p className="text-body-sm text-on-surface-variant">
              {formatTime(current)} / {formatTime(total)}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleRename}
            className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
            title="Renomear"
          >
            <span className="material-symbols-outlined">edit</span>
          </button>
          <button
            onClick={handleShare}
            className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
            title="Compartilhar"
          >
            <span className="material-symbols-outlined">share</span>
          </button>
        </div>
      </div>
      <div ref={containerRef} className="flex items-end gap-1.5 h-16 w-full px-2" />
    </section>
  );
}
