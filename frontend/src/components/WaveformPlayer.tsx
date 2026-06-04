import { useEffect, useRef } from "react";

export default function WaveformPlayer() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const bars: HTMLDivElement[] = [];
    const barCount = 100;

    for (let i = 0; i < barCount; i++) {
      const bar = document.createElement("div");
      bar.className = "waveform-bar flex-grow bg-secondary-container rounded-t-sm";
      bar.style.height = `${Math.random() * 80 + 20}%`;
      container.appendChild(bar);
      bars.push(bar);
    }

    const interval = setInterval(() => {
      bars.forEach((bar) => {
        bar.style.height = `${Math.random() * 80 + 20}%`;
      });
    }, 800);

    return () => {
      clearInterval(interval);
      bars.forEach((bar) => bar.remove());
    };
  }, []);

  return (
    <section className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button className="w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-primary/20">
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: 32 }}
            >
              play_arrow
            </span>
          </button>
          <div>
            <p className="text-label-md text-on-surface">
              Last Edited: Summary_Voiceover.mp3
            </p>
            <p className="text-body-sm text-on-surface-variant">
              01:45 / 03:20
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">edit</span>
          </button>
          <button className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined">share</span>
          </button>
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex items-end gap-1.5 h-16 w-full px-2"
      />
    </section>
  );
}
