import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createTextTask } from "../api/tasks";
import { useTask, useVoices } from "../api/hooks";
import {
  downloadTaskAudio,
  getSmartTranscriptionCapability,
  getTask,
  prepareThemeVocabulary,
} from "../api/client";
import { getErrorMessage } from "../utils/errors";
import { useSpeechToText } from "../hooks/useSpeechToText";
import DictationModal from "../components/DictationModal";
import WaveformPlayer from "../components/WaveformPlayer";
import type { Task, Voice } from "../types";

type FeaturedVoice = {
  name: string;
  title: string;
  subtitle: string;
  icon: string;
  locale: string;
};

const VOICE_PERSONAS: { name: string; title: string; subtitle: string; icon: string; locale: string }[] = [
  { name: "en-US-AriaNeural",   title: "Soft Female",      subtitle: "Calm & Soothing",            icon: "face_3",           locale: "en-US" },
  { name: "en-US-GuyNeural",    title: "Natural Male",     subtitle: "Warm & Engaging",            icon: "face",             locale: "en-US" },
  { name: "pt-BR-FranciscaNeural", title: "Executiva",     subtitle: "Clara & Profissional",       icon: "business_center",  locale: "pt-BR" },
  { name: "pt-BR-AntonioNeural",   title: "Narrador",      subtitle: "Profundo & Dramático",       icon: "record_voice_over", locale: "pt-BR" },
  { name: "en-US-JennyNeural",     title: "Executive",     subtitle: "Professional & Confident",   icon: "business_center",  locale: "en-US" },
  { name: "en-US-ChristopherNeural", title: "Business",    subtitle: "Formal & Polished",          icon: "work",             locale: "en-US" },
  { name: "en-US-AndrewNeural",     title: "Lecture",      subtitle: "Authoritative & Clear",      icon: "school",           locale: "en-US" },
  { name: "en-US-MichelleNeural",   title: "Creative",     subtitle: "Expressive & Vibrant",       icon: "brush",            locale: "en-US" },
  { name: "en-US-RogerNeural",      title: "Motivational", subtitle: "Energetic & Inspiring",      icon: "trending_up",      locale: "en-US" },
  { name: "en-US-AnaNeural",        title: "Friendly",     subtitle: "Warm & Approachable",        icon: "favorite",         locale: "en-US" },
];

function buildVoices(voices: Voice[]): FeaturedVoice[] {
  const lookup = new Map(voices.map((voice) => [voice.name, voice]));
  return VOICE_PERSONAS.map((c) => {
    const voice = lookup.get(c.name) || voices.find((item) => item.locale?.startsWith(c.locale)) || null;
    return { name: voice?.name || c.name, title: c.title, subtitle: c.subtitle, icon: c.icon, locale: c.locale };
  });
}

export default function VoiceOverPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get("taskId");
  const textParam = searchParams.get("text") || "";
  const { data: voices = [], isLoading: voicesLoading } = useVoices();
  const { data: loadedTask, isError: taskError } = useTask(taskId);

  const [script, setScript] = useState(textParam);
  const [selectedVoice, setSelectedVoice] = useState("en-US-AriaNeural");
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [showAllVoices, setShowAllVoices] = useState(false);
  const [langFilter, setLangFilter] = useState<"all" | "pt-BR" | "en-US">("pt-BR");
  const [generatedTask, setGeneratedTask] = useState<Task | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalPhase, setModalPhase] = useState<"select" | "loading" | "ready">("select");
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [useGpu, setUseGpu] = useState(false);
  const [smartTranscriptionAvailable, setSmartTranscriptionAvailable] = useState(false);
  const scriptTextareaRef = useRef<HTMLTextAreaElement>(null);
  const revealScopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 6000);
    return () => clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    const stored = sessionStorage.getItem("voiceOverText");
    if (stored) {
      setScript(stored);
      sessionStorage.removeItem("voiceOverText");
    }
  }, []);

  useEffect(() => {
    let active = true;
    void getSmartTranscriptionCapability()
      .then((capability) => {
        if (!active) return;
        setSmartTranscriptionAvailable(capability.available);
        if (!capability.available) setUseGpu(false);
      })
      .catch(() => {
        if (!active) return;
        setSmartTranscriptionAvailable(false);
        setUseGpu(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const personaVoices = useMemo(() => buildVoices(voices), [voices]);
  const featuredVoices = useMemo(() => personaVoices.slice(0, 4), [personaVoices]);
  const { isListening, transcript, isProcessing, dictationError, start, stop, clearError, isSupported } = useSpeechToText();

  useEffect(() => {
    if (dictationError) {
      setError(dictationError);
      clearError();
    }
  }, [dictationError, clearError]);

  useEffect(() => {
    if (!loadedTask) return;
    setScript(loadedTask.input_text || loadedTask.transcription || textParam || "");
    setSelectedVoice(loadedTask.voice || "en-US-AriaNeural");
    setGeneratedTask(loadedTask.audio_url ? loadedTask : null);
    setError(null);
  }, [loadedTask?.id, textParam]);

  useEffect(() => {
    if (transcript) {
      setScript((prev) => prev + (prev ? " " : "") + transcript);
      scriptTextareaRef.current?.focus();
    }
  }, [transcript]);

  useEffect(() => {
    const root = revealScopeRef.current;
    if (!root) return;

    const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, [generatedTask?.id]);

  const characterCount = script.length;
  const previewTask = generatedTask || (loadedTask?.audio_url ? loadedTask : null);

  const handleSelectTheme = async (theme: string) => {
    setSelectedTheme(theme);
    setModalPhase("loading");
    const loadingStartedAt = Date.now();
    try {
      const result = await prepareThemeVocabulary(theme);
      if (!result.valid && theme !== "outros") {
        setError("We could not prepare this theme vocabulary right now. Try again in a moment.");
        setModalOpen(false);
        setModalPhase("select");
        return;
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "We could not prepare the selected theme."));
      setModalOpen(false);
      setModalPhase("select");
      return;
    }
    const elapsed = Date.now() - loadingStartedAt;
    const minimumLoadingMs = 2500;
    if (elapsed < minimumLoadingMs) {
      await new Promise((resolve) => setTimeout(resolve, minimumLoadingMs - elapsed));
    }
    setModalPhase("ready");
  };

  const handleStartDictation = () => {
    setModalOpen(false);
    start(selectedTheme || "outros", useGpu);
  };

  const autoFixScript = () => {
    const cleaned = script
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\s+([,.;!?])/g, "$1");
    if (!cleaned) return;
    setScript(cleaned.charAt(0).toUpperCase() + cleaned.slice(1));
  };

  const copyScript = async () => {
    if (!script.trim()) return;
    await navigator.clipboard.writeText(script);
  };

  const generateAudio = async () => {
    if (!script.trim()) {
      setError("Paste or write a script first.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const task = await createTextTask(script, selectedVoice, speed, pitch, volume);
      setGeneratedTask(task);

      const poll = setInterval(async () => {
        try {
          const updated = await getTask(task.id);
          if (updated.status === "completed" || updated.status === "error") {
            clearInterval(poll);
            setGeneratedTask(updated);
            setIsGenerating(false);
          }
        } catch {
          clearInterval(poll);
          setIsGenerating(false);
        }
      }, 1000);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Unable to generate audio."));
      setIsGenerating(false);
    }
  };

  return (
    <div ref={revealScopeRef} className="space-y-stack-lg pb-24 md:pb-12">
      <div className="flex items-center justify-between">
        <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Voice-over Studio</h2>
        <span className="px-3 py-1 bg-surface-container text-primary rounded-full font-label-md text-label-md">AI Generation Active</span>
      </div>

      <main className="max-w-container-max mx-auto px-0 grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        <div className="lg:col-span-7 xl:col-span-8 space-y-stack-lg">
          <section data-reveal className="reveal-card hover-lift bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <label className="block font-label-md text-label-md text-on-surface-variant mb-4" htmlFor="script-input">
              Paste or write your script here
            </label>
            <textarea
              ref={scriptTextareaRef}
              id="script-input"
              className="w-full h-64 lg:h-[420px] bg-transparent border-none focus:ring-0 text-body-lg font-body-lg resize-none placeholder-outline-variant outline-none"
              placeholder="Start typing your story or paste a professional script here..."
              value={script}
              onChange={(e) => setScript(e.target.value)}
              maxLength={5000}
            />
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-outline-variant">
              <span className={`text-body-sm font-body-sm ${characterCount > 5000 ? "text-error" : "text-outline"}`}>
                {characterCount.toLocaleString()} / 5,000 characters
              </span>
              <div className="flex gap-2">
                {isSupported && (
                  <>
                    <button
                      type="button"
                      className={`relative w-10 h-5 rounded-full transition-colors ${smartTranscriptionAvailable && useGpu ? "bg-primary" : "bg-outline-variant"}`}
                      onClick={() => {
                        if (!smartTranscriptionAvailable) {
                          setError("Your machine does not support smart transcription.");
                          return;
                        }
                        setUseGpu((v) => !v);
                      }}
                      title={smartTranscriptionAvailable ? "Enable smarter transcription" : "Smart transcription is not available on this machine"}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${smartTranscriptionAvailable && useGpu ? "translate-x-5" : "translate-x-0"}`}
                      />
                    </button>
                    <div className="flex flex-col">
                      <span className="text-label-sm text-on-surface-variant">Enable smarter transcription</span>
                      {!smartTranscriptionAvailable && (
                        <span className="text-[11px] text-outline">Your machine does not support smart transcription.</span>
                      )}
                    </div>
                    {isListening && (
                      <span className="text-label-sm text-error animate-pulse">Recording… tap to stop</span>
                    )}
                    <button
                      className={`p-2 rounded-lg transition-colors material-symbols-outlined ${isListening ? "bg-error/20 text-error animate-pulse" : "hover:bg-surface-container text-on-surface-variant"}`}
                      onClick={() => {
                        if (isListening) {
                          stop();
                        } else if (isProcessing) {
                          // ignore
                        } else {
                          setModalOpen(true);
                          setModalPhase("select");
                        }
                      }}
                      title={isListening ? "Stop recording" : "Dictate with high precision"}
                    >
                      {isProcessing ? "hourglass_top" : isListening ? "stop" : "mic"}
                    </button>
                  </>
                )}
                <button className="p-2 hover:bg-surface-container rounded-lg transition-colors material-symbols-outlined text-on-surface-variant" onClick={autoFixScript} title="Auto fix">
                  auto_fix_high
                </button>
                <button className="p-2 hover:bg-surface-container rounded-lg transition-colors material-symbols-outlined text-on-surface-variant" onClick={copyScript} title="Copy script">
                  content_copy
                </button>
              </div>
            </div>
          </section>

          <section data-reveal className="reveal-card hover-lift">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-headline-md">Select Voice Model</h3>
              <button className="text-primary font-label-md text-label-md hover:underline" onClick={() => setShowAllVoices((v) => !v)}>{showAllVoices ? "Show Less" : "View All"}</button>
            </div>
            {voicesLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-outline-variant" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-24 bg-outline-variant rounded" />
                      <div className="h-2 w-16 bg-outline-variant rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-4">
                  {(["all", "pt-BR", "en-US"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLangFilter(lang)}
                      className={`filter-pill px-4 py-1.5 rounded-full text-label-md ${langFilter === lang ? "bg-primary text-on-primary" : "bg-outline-variant text-on-surface hover:bg-primary/20"}`}
                    >
                      {lang === "all" ? "All" : lang === "pt-BR" ? "🇧🇷 Português" : "🇺🇸 English"}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {(showAllVoices ? personaVoices : featuredVoices).filter((v) => langFilter === "all" || v.locale === langFilter).map((voice) => {
                    const active = selectedVoice === voice.name;
                    return (
                      <button
                        key={voice.name}
                        type="button"
                        onClick={() => setSelectedVoice(voice.name)}
                        className={`card-hover text-left bg-surface-container-lowest rounded-xl p-4 cursor-pointer group border shadow-sm hover:border-primary ${active ? "border-primary active-voice-card" : "border-outline-variant"}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors duration-220 ${active ? "bg-primary-container text-on-primary" : "bg-surface-container-highest text-secondary group-hover:bg-primary-fixed group-hover:text-primary"}`}>
                          <span className="material-symbols-outlined">{voice.icon}</span>
                        </div>
                        <p className="font-label-md text-label-md text-on-surface">{voice.title}</p>
                        <p className="text-body-sm font-body-sm text-on-surface-variant">{voice.subtitle}</p>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </section>
        </div>

        <div className="lg:col-span-5 xl:col-span-4 space-y-stack-lg lg:sticky lg:top-24">
          <section data-reveal className="reveal-card hover-lift bg-surface-container-low rounded-xl p-6 border border-outline-variant shadow-sm">
            <h3 className="font-headline-md text-headline-md mb-6">Voice Parameters</h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-label-md text-label-md text-on-surface">Playback Speed</label>
                  <span className="text-primary font-bold">{speed.toFixed(1)}x</span>
                </div>
                <input className="w-full h-2 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary" max="2" min="0.5" step="0.1" type="range" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
                <div className="flex justify-between text-body-sm text-outline">
                  <span>Slower</span>
                  <span>Faster</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-label-md text-label-md text-on-surface">Vocal Pitch</label>
                  <span className="text-primary font-bold">{pitch === 0 ? "Default" : pitch > 0 ? `+${pitch}` : String(pitch)}</span>
                </div>
                <input className="w-full h-2 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary" max="10" min="-10" step="1" type="range" value={pitch} onChange={(e) => setPitch(Number(e.target.value))} />
                <div className="flex justify-between text-body-sm text-outline">
                  <span>Deep</span>
                  <span>High</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-label-md text-label-md text-on-surface">Volume</label>
                  <span className="text-primary font-bold">{volume.toFixed(1)}x</span>
                </div>
                <input className="w-full h-2 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary" max="2.0" min="0.0" step="0.1" type="range" value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
                <div className="flex justify-between text-body-sm text-outline">
                  <span>Mute</span>
                  <span>Amplify</span>
                </div>
              </div>

            </div>
          </section>

          <section data-reveal className="reveal-card bg-surface-container-highest rounded-xl p-6 border border-primary/20 relative overflow-hidden group" id="preview-section">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-label-md text-label-md text-on-surface">Real-time Preview</h3>
              {isGenerating ? (
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              ) : previewTask?.audio_url ? (
                <span className="w-2 h-2 rounded-full bg-primary" />
              ) : null}
            </div>
            {taskId && taskError ? (
              <p className="text-body-sm text-error text-center py-6">Task not found.</p>
            ) : isGenerating ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-body-sm text-on-surface-variant">Generating audio…</p>
              </div>
            ) : (
              <WaveformPlayer task={previewTask} />
            )}
            {previewTask?.audio_url && (
              <div className="mt-4 flex gap-3">
                <button className="text-primary text-label-md hover:underline" onClick={() => navigate(`/editor?taskId=${previewTask.id}`)}>
                  Open in Editor
                </button>
                <button
                  className="text-primary text-label-md hover:underline flex items-center gap-1"
                  onClick={() => {
                    const display = previewTask?.extra_data?.display_name || previewTask?.input_text || previewTask?.id;
                    void downloadTaskAudio(previewTask!.id, `${String(display).slice(0, 80)}.mp3`);
                  }}
                >
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Download
                </button>
              </div>
            )}
          </section>

          <button
            data-reveal
            className="btn-glow reveal-card hover-lift w-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-semibold h-12 px-8 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 group disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => void generateAudio()}
            disabled={isGenerating || !script.trim()}
          >
            <span className="material-symbols-outlined icon-filled group-hover:rotate-12 transition-transform">
              record_voice_over
            </span>
            {isGenerating ? "Generating..." : "Generate & Record"}
          </button>
        </div>
      </main>

      <DictationModal
        open={modalOpen}
        phase={modalPhase}
        selectedTheme={selectedTheme}
        smartModeEnabled={useGpu}
        smartModeAvailable={smartTranscriptionAvailable}
        onSelectTheme={handleSelectTheme}
        onStart={handleStartDictation}
      />

      {error && (
        <div className="toast-slide fixed bottom-28 right-margin-mobile md:right-margin-desktop z-50 bg-error text-white px-4 py-3 rounded-xl shadow-lg max-w-sm flex items-center gap-3">
          <span className="flex-grow">{error}</span>
          <button onClick={() => setError(null)} className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors material-symbols-outlined text-[16px]">close</button>
        </div>
      )}
    </div>
  );
}
