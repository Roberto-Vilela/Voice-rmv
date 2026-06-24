import { useEffect, useState } from "react";

const THEMES = [
  { name: "saude", label: "Health", icon: "local_hospital" },
  { name: "lei", label: "Law", icon: "gavel" },
  { name: "tecnologia", label: "Technology", icon: "computer" },
  { name: "economia", label: "Economy", icon: "account_balance" },
  { name: "marketing", label: "Marketing", icon: "campaign" },
  { name: "politica", label: "Politics", icon: "how_to_vote" },
  { name: "idioma", label: "Language", icon: "translate" },
  { name: "relacionamento", label: "Relationships", icon: "favorite" },
  { name: "financeiro", label: "Finance", icon: "payments" },
];

const THEME_LABELS = new Map(THEMES.map((theme) => [theme.name, theme.label]));

const LOADING_MESSAGES = [
  "Please wait, the AI is searching for vocabulary in your selected area",
  "One moment — we are contacting external agents for precise voice recognition",
  "Thank you for waiting, we are configuring your machine",
  "Ready",
];

type Props = {
  open: boolean;
  phase: "select" | "loading" | "ready";
  selectedTheme: string | null;
  smartModeEnabled: boolean;
  smartModeAvailable: boolean;
  onSelectTheme: (theme: string) => void;
  onStart: () => void;
};

export default function DictationModal({
  open,
  phase,
  selectedTheme,
  smartModeEnabled,
  smartModeAvailable,
  onSelectTheme,
  onStart,
}: Props) {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (phase !== "loading") return;
    setMsgIndex(0);
    const interval = setInterval(() => {
      setMsgIndex((i) => {
        if (i >= LOADING_MESSAGES.length - 1) {
          clearInterval(interval);
          return i;
        }
        return i + 1;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [phase]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-surface p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
        {phase === "select" && (
          <>
            <h2 className="text-headline-md text-on-surface mb-6">Select your topic</h2>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map((t) => (
                <button
                  key={t.name}
                  onClick={() => onSelectTheme(t.name)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-outline-variant hover:border-primary hover:bg-primary-container/20 transition-all"
                >
                  <span className="material-symbols-outlined text-2xl text-on-surface-variant">{t.icon}</span>
                  <span className="text-label-md text-on-surface text-center">{t.label}</span>
                </button>
              ))}
              <button
                onClick={() => onSelectTheme("outros")}
                className="flex items-center justify-center gap-2 p-4 rounded-xl border border-outline-variant hover:border-primary transition-all col-span-3"
              >
                <span className="material-symbols-outlined text-on-surface-variant">more_horiz</span>
                <span className="text-label-md text-on-surface">Other (no specialized vocabulary)</span>
              </button>
            </div>
          </>
        )}
        {phase === "loading" && (
          <div className="text-center py-8 space-y-4">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-label-md text-primary">
              {selectedTheme ? `Installing theme avatar: ${THEME_LABELS.get(selectedTheme) || selectedTheme}` : "Preparing your theme avatar"}
            </p>
            <p className="text-body-md text-on-surface-variant">
              {LOADING_MESSAGES[Math.min(msgIndex, LOADING_MESSAGES.length - 1)]}
            </p>
          </div>
        )}
        {phase === "ready" && (
          <div className="text-center py-8 space-y-4">
            <span className="material-symbols-outlined text-4xl text-primary">check_circle</span>
            <p className="text-body-md text-on-surface font-semibold">Ready — click below to start dictating</p>
            <p className="text-body-sm text-on-surface-variant">
              {smartModeEnabled && smartModeAvailable
                ? "Smart transcription is active for this dictation."
                : "Standard transcription is active for this dictation."}
            </p>
            <button
              onClick={onStart}
              className="bg-primary text-on-primary px-6 py-2 rounded-xl font-semibold hover:bg-primary-fixed-dim transition-colors"
            >
              Start Dictating
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
