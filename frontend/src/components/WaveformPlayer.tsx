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
  const [localTitle, setLocalTitle] = useState<string | null>(null);
  const title = localTitle || (task ? displayName(task) : "Untitled");
  const wrapperRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setLocalTitle(null);
  }, [task?.id]);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const barsRef = useRef<HTMLDivElement[]>([]);
  const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    barsRef.current.forEach((b) => b.remove());
    barsRef.current = [];
    const count = 48;
    for (let i = 0; i < count; i++) {
      const bar = document.createElement("div");
      bar.className = "waveform-bar flex-grow rounded-t-sm min-w-[2px]";
      bar.style.height = `${Math.random() * 80 + 20}%`;
      container.appendChild(bar);
      barsRef.current.push(bar);
    }
  }, [task?.id, task?.audio_url]);

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

  useEffect(() => {
    if (task?.audio_url) return;

    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    audioRef.current = null;
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    onTimeUpdate?.(0);
  }, [task?.audio_url, onTimeUpdate]);

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

  const handleSkipBack = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  };

  const handleSkipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    const audio = audioRef.current;
    if (audio) audio.currentTime = time;
    setCurrentTime(time);
    onTimeUpdate?.(time);
  };

  const cycleSpeed = () => {
    const currentIndex = SPEEDS.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % SPEEDS.length;
    const newSpeed = SPEEDS[nextIndex];
    setPlaybackRate(newSpeed);
    const audio = audioRef.current;
    if (audio) audio.playbackRate = newSpeed;
  };

  const handleRename = async () => {
    if (!task) return;
    const current = title;
    const name = prompt("Rename file:", current);
    if (name && name !== current) {
      await patchTask(task.id, { display_name: name });
      setLocalTitle(name);
    }
  };

  const handleShare = async () => {
    if (!task?.audio_url) return;
    const fullUrl = `${window.location.origin}${task.audio_url}`;
    if (navigator.share) {
      await navigator.share({ title, text: task.transcription || "", url: fullUrl });
    } else {
      await navigator.clipboard.writeText(fullUrl);
      alert("Link copied to clipboard!");
    }
  };

  const total = duration || task?.duration_seconds || 0;
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={handleSkipBack}
            className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors shrink-0"
            title="Retroceder 10s"
          >
            <span className="material-symbols-outlined">replay_10</span>
          </button>
          <button
            data-editor-player-play-button="true"
            onClick={handlePlayPause}
            className={`waveform-play-button w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-primary/20 shrink-0 ${playing ? "is-playing" : ""}`}
          >
            <span className="material-symbols-outlined icon-filled" style={{ fontSize: 32 }}>
              {playing ? "pause" : "play_arrow"}
            </span>
          </button>
          <button
            onClick={handleSkipForward}
            className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors shrink-0"
            title="Avançar 10s"
          >
            <span className="material-symbols-outlined">forward_10</span>
          </button>
          <div className="min-w-0 ml-2">
            <p className="text-label-md text-on-surface truncate">{title}</p>
            <p className="text-body-sm text-on-surface-variant">
              {formatTime(current)} / {formatTime(total)}
            </p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0 items-center">
          <button
            onClick={cycleSpeed}
            className={`h-8 px-3 rounded-full text-xs font-semibold transition-colors shrink-0 ${playbackRate !== 1 ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}
            title="Velocidade de reprodução"
          >
            {playbackRate}x
          </button>
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
      <div ref={containerRef} className="flex items-end gap-0.5 h-16 w-full px-0.5" />
      <div className="mt-3 px-0.5">
        <input
          type="range"
          min={0}
          max={total || 0}
          step={0.1}
          value={current}
          onChange={handleSeek}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-surface-container-high accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
        />
      </div>
    </section>
  );
}
