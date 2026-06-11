const TRANSLATOR_SETTINGS = [
  ["Model", "TranslateGemma 4B Q4_K_M"],
  ["Execution", "CPU only"],
  ["Context", "4096 tokens"],
  ["Concurrency", "1 translation"],
  ["Idle unload", "60 seconds"],
  ["API endpoint", "host.docker.internal:11435"],
] as const;

export default function ProviderSettingsPage() {
  return (
    <div className="space-y-8 pb-24">
      <section className="relative overflow-hidden rounded-2xl bg-primary-container p-8 text-on-primary-container shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-on-primary-container/20 px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-widest">
              Translation AI
            </span>
          </div>
          <h1 className="text-headline-lg font-bold mb-3">Local Translation Service</h1>
          <p className="text-body-lg opacity-90 leading-relaxed">
            The Editor uses a dedicated TranslateGemma model without consuming GPU memory.
          </p>
        </div>
        <div className="absolute right-[-10%] top-[-20%] w-96 h-96 bg-secondary-container/30 rounded-full blur-[80px]" />
        <div className="absolute right-[10%] bottom-[-10%] w-64 h-64 bg-tertiary-container/40 rounded-full blur-[60px]" />
      </section>

      <section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-primary p-2 bg-primary-container/10 rounded-lg">
            translate
          </span>
          <div>
            <h2 className="font-bold text-headline-sm">Dedicated translator</h2>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Loaded on demand when the Translate button is pressed.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TRANSLATOR_SETTINGS.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-outline-variant bg-surface p-4">
              <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">{label}</p>
              <p className="mt-1 font-semibold text-on-surface">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary-container/20 border border-secondary/20 p-6 rounded-2xl flex gap-6 items-start">
        <div className="bg-secondary-container text-on-secondary-container p-3 rounded-full">
          <span className="material-symbols-outlined">memory</span>
        </div>
        <div>
          <h3 className="font-bold text-on-secondary-container mb-1">Memory behavior</h3>
          <p className="text-body-md text-on-secondary-container/80 leading-relaxed">
            The first translation loads the model into system RAM. After 60 seconds without
            requests, LM Studio unloads it automatically. The main GPU model remains untouched.
          </p>
        </div>
      </section>

      <section className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl">
        <h3 className="font-bold text-on-surface mb-2">Host requirement</h3>
        <p className="text-body-md text-on-surface-variant">
          Start the local service with <code>scripts/start-translation-server.sh</code> before
          using translation in the Editor.
        </p>
      </section>
    </div>
  );
}
