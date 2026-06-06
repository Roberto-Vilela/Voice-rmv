import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createTextTask } from "../api/tasks";
import { useTask, useVoices } from "../api/hooks";
import WaveformPlayer from "../components/WaveformPlayer";
import type { Task, Voice } from "../types";

type FeaturedVoice = {
  name: string;
  title: string;
  subtitle: string;
  icon: string;
};

function buildFeaturedVoices(voices: Voice[]): FeaturedVoice[] {
  const lookup = new Map(voices.map((voice) => [voice.name, voice]));
  const candidates = [
    { name: "en-US-GuyNeural", title: "Natural Male", subtitle: "Warm & Engaging", icon: "face", fallbackLocale: "en-US" },
    { name: "en-US-AriaNeural", title: "Soft Female", subtitle: "Calm & Soothing", icon: "face_3", fallbackLocale: "en-US" },
    { name: "pt-BR-FranciscaNeural", title: "AI Professional", subtitle: "Clear & Direct", icon: "smart_toy", fallbackLocale: "pt-BR" },
    { name: "pt-BR-AntonioNeural", title: "Storyteller", subtitle: "Deep & Dramatic", icon: "record_voice_over", fallbackLocale: "pt-BR" },
  ];

  return candidates.map((candidate) => {
    const voice = lookup.get(candidate.name) || voices.find((item) => item.locale?.startsWith(candidate.fallbackLocale)) || null;
    return {
      name: voice?.name || candidate.name,
      title: candidate.title,
      subtitle: candidate.subtitle,
      icon: candidate.icon,
    };
  });
}

export default function VoiceOverPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get("taskId");
  const textParam = searchParams.get("text") || "";
  const { data: voices = [], isLoading: voicesLoading } = useVoices();
  const { data: loadedTask } = useTask(taskId);

  const [script, setScript] = useState(textParam);
  const [selectedVoice, setSelectedVoice] = useState("en-US-AriaNeural");
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [advanced, setAdvanced] = useState(false);
  const [generatedTask, setGeneratedTask] = useState<Task | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const revealScopeRef = useRef<HTMLDivElement>(null);

  const featuredVoices = useMemo(() => buildFeaturedVoices(voices), [voices]);

  useEffect(() => {
    if (!loadedTask) return;
    setScript(loadedTask.input_text || loadedTask.transcription || textParam || "");
    setSelectedVoice(loadedTask.voice || "en-US-AriaNeural");
    setGeneratedTask(loadedTask.audio_url ? loadedTask : null);
    setError(null);
  }, [loadedTask?.id, textParam]);

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
  }, [generatedTask?.id, script, selectedVoice]);

  const characterCount = script.length;
  const previewTask = generatedTask || (loadedTask?.audio_url ? loadedTask : null);

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
      const task = await createTextTask(script, selectedVoice);
      setGeneratedTask(task);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || "Unable to generate audio.");
    } finally {
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
              id="script-input"
              className="w-full h-64 lg:h-[420px] bg-transparent border-none focus:ring-0 text-body-lg font-body-lg resize-none placeholder-outline-variant outline-none"
              placeholder="Start typing your story or paste a professional script here..."
              value={script}
              onChange={(e) => setScript(e.target.value)}
            />
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-outline-variant">
              <span className={`text-body-sm font-body-sm ${characterCount > 5000 ? "text-error" : "text-outline"}`}>
                {characterCount.toLocaleString()} / 5,000 characters
              </span>
              <div className="flex gap-2">
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
              <button className="text-primary font-label-md text-label-md hover:underline">View All</button>
            </div>
            {voicesLoading ? (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 text-on-surface-variant">Loading voices…</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {featuredVoices.map((voice) => {
                  const active = selectedVoice === voice.name;
                  return (
                    <button
                      key={voice.name}
                      type="button"
                      onClick={() => setSelectedVoice(voice.name)}
                      className={`text-left bg-surface-container-lowest rounded-xl p-4 cursor-pointer transition-all active:scale-95 group border shadow-sm hover:border-primary ${active ? "border-primary active-voice-card" : "border-outline-variant"}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${active ? "bg-primary-container text-on-primary" : "bg-surface-container-highest text-secondary"}`}>
                        <span className="material-symbols-outlined">{voice.icon}</span>
                      </div>
                      <p className="font-label-md text-label-md text-on-surface">{voice.title}</p>
                      <p className="text-body-sm font-body-sm text-on-surface-variant">{voice.subtitle}</p>
                    </button>
                  );
                })}
              </div>
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

              <button className="flex items-center gap-2 text-primary font-label-md text-label-md py-2 hover:bg-primary/5 rounded-lg w-full transition-colors" onClick={() => setAdvanced((current) => !current)}>
                <span className="material-symbols-outlined text-[20px]">settings_input_component</span>
                {advanced ? "Hide Advanced" : "Advanced Modulation"}
              </button>

              {advanced && (
                <div className="text-body-sm text-on-surface-variant bg-surface-container rounded-xl p-4">
                  Advanced modulation is ready for future TTS controls.
                </div>
              )}
            </div>
          </section>

          <section data-reveal className="reveal-card hover-lift bg-surface-container-highest rounded-xl p-6 border border-primary/20 relative overflow-hidden group" id="preview-section">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-label-md text-label-md text-on-surface">Real-time Preview</h3>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
            <WaveformPlayer task={previewTask} />
            {previewTask && (
              <button className="mt-4 text-primary text-label-md hover:underline" onClick={() => navigate(`/editor?taskId=${previewTask.id}`)}>
                Open in Editor
              </button>
            )}
          </section>

          <button
            data-reveal
            className="reveal-card hover-lift w-full bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-headline-md py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 group disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => void generateAudio()}
            disabled={isGenerating || !script.trim()}
          >
            <span className="material-symbols-outlined group-hover:rotate-12 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
              record_voice_over
            </span>
            {isGenerating ? "Generating..." : "Generate & Record"}
          </button>
        </div>
      </main>

      {error && (
        <div className="fixed bottom-28 right-margin-mobile md:right-margin-desktop z-50 bg-error text-white px-4 py-3 rounded-xl shadow-lg max-w-sm">
          {error}
        </div>
      )}
    </div>
  );
}
