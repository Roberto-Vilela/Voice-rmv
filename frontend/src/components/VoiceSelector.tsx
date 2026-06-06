import { useState, useRef, useEffect } from "react";
import { useVoices } from "../api/hooks";
import api from "../api/client";

interface VoiceOption {
  name: string;
  locale: string;
  gender: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (voice: string) => void;
  variant?: "default" | "compact";
}

function formatLabel(v: VoiceOption): string {
  const flag = v.locale.startsWith("pt") ? "🇧🇷" : "🇺🇸";
  const genderIcon = v.gender === "Female" ? "♀" : "♂";
  const short = v.name.replace("MultilingualNeural", "").replace("Neural", "");
  return `${flag} ${short} (${genderIcon})`;
}

function sampleText(v: VoiceOption): string {
  return v.locale.startsWith("pt")
    ? "Olá, esta é a voz de demonstração."
    : "Hello, this is a demonstration voice.";
}

export default function VoiceSelector({ value, onChange, variant = "default" }: Props) {
  const { data: voices = [], isLoading } = useVoices();
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const ptVoices: VoiceOption[] = voices
    .filter((v: any) => v.locale?.startsWith("pt"))
    .map((v: any) => ({ ...v, label: formatLabel(v) }));

  const enVoices: VoiceOption[] = voices
    .filter((v: any) => v.locale?.startsWith("en"))
    .map((v: any) => ({ ...v, label: formatLabel(v) }));

  const currentLabel = [...ptVoices, ...enVoices].find((v) => v.name === value)?.label || value;

  const handlePlay = async (e: React.MouseEvent, v: VoiceOption) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlaying(v.name);
    try {
      const res = await api.post("/narrate/text", { text: sampleText(v), voice: v.name });
      const audioUrl = (res.data as any).audio_url;
      if (audioUrl) {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onended = () => setPlaying(null);
        audio.play();
      }
    } catch {
      setPlaying(null);
    }
  };

  return (
    <div className={`relative bg-primary-container text-on-primary-container p-gutter rounded-2xl shadow-sm ${variant === "default" ? "pt-8" : ""}`}>
      {variant === "default" && (
        <>
          <div className="absolute -top-4 left-6 w-9 h-9 rounded-full border-2 border-white bg-orange-500 text-white flex items-center justify-center text-label-md shadow-md">
            1
          </div>
          <p className="text-label-md opacity-80 mb-2">Voice</p>
        </>
      )}
      {isLoading ? (
        <p className="text-body-sm opacity-60">Loading voices…</p>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="w-full bg-on-primary-container text-primary-container rounded-xl px-3 py-2.5 text-label-md flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim"
          >
            <span className="truncate mr-2">{currentLabel}</span>
            <span className="material-symbols-outlined text-[18px] shrink-0">
              {open ? "expand_less" : "expand_more"}
            </span>
          </button>
          {open && (
            <div className="absolute left-0 right-0 top-full mt-1 max-h-72 overflow-y-auto bg-white rounded-xl shadow-lg border border-outline-variant z-50">
              <div className="py-1">
                <div className="px-3 py-1.5 text-label-sm text-outline font-semibold">🇧🇷 Português (Brasil)</div>
                {ptVoices.map((v) => (
                  <div key={v.name} className="flex items-center gap-2 px-3 py-2 hover:bg-surface-container group">
                    <button
                      onClick={(e) => handlePlay(e, v)}
                      className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary-fixed transition-colors"
                      title="Ouvir amostra"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {playing === v.name ? "volume_up" : "play_arrow"}
                      </span>
                    </button>
                    <button
                      onClick={() => { onChange(v.name); setOpen(false); }}
                      className={`flex-grow text-left text-label-md rounded-lg px-2 py-1 transition-colors ${
                        value === v.name ? "bg-primary-fixed text-primary font-semibold" : "text-on-surface hover:text-primary"
                      }`}
                    >
                      {v.label}
                    </button>
                  </div>
                ))}
              </div>
              <div className="border-t border-outline-variant py-1">
                <div className="px-3 py-1.5 text-label-sm text-outline font-semibold">🇺🇸 English</div>
                {enVoices.map((v) => (
                  <div key={v.name} className="flex items-center gap-2 px-3 py-2 hover:bg-surface-container group">
                    <button
                      onClick={(e) => handlePlay(e, v)}
                      className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary-fixed transition-colors"
                      title="Hear sample"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {playing === v.name ? "volume_up" : "play_arrow"}
                      </span>
                    </button>
                    <button
                      onClick={() => { onChange(v.name); setOpen(false); }}
                      className={`flex-grow text-left text-label-md rounded-lg px-2 py-1 transition-colors ${
                        value === v.name ? "bg-primary-fixed text-primary font-semibold" : "text-on-surface hover:text-primary"
                      }`}
                    >
                      {v.label}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
