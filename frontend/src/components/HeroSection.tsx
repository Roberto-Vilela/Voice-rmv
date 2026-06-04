export default function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-primary text-on-primary p-8 md:p-16 shadow-xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary opacity-20 blur-3xl -mr-20 -mt-20 rounded-full" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-tertiary opacity-20 blur-2xl -ml-20 -mb-20 rounded-full" />
      <div className="relative z-10 max-w-3xl">
        <h1 className="text-headline-lg-mobile md:text-display-lg mb-4">
          Transform any video into clear text and audio.
        </h1>
        <p className="text-body-lg text-on-primary-container mb-8 md:mb-12 opacity-90 max-w-xl">
          AI-powered extraction, transcription, and high-fidelity voice-over
          synthesis in seconds.
        </p>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-60 group-focus-within:opacity-100 transition-opacity">
              link
            </span>
            <input
              className="w-full pl-12 pr-4 py-4 md:py-5 rounded-2xl border-none text-on-surface focus:ring-4 focus:ring-primary-fixed-dim transition-all text-body-md bg-white"
              placeholder="Paste YouTube URL here..."
              type="text"
            />
          </div>
          <button className="bg-secondary-container text-on-secondary-container px-8 py-4 md:py-5 rounded-2xl text-label-md hover:scale-[1.02] hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg">
            <span className="material-symbols-outlined">
              download_for_offline
            </span>
            <span>Download & Transcribe</span>
          </button>
        </div>
      </div>
    </section>
  );
}
