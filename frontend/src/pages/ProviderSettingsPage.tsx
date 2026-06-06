export default function ProviderSettingsPage() {
  return (
    <div className="space-y-8 pb-24">
      <section className="relative overflow-hidden rounded-2xl bg-primary-container p-8 text-on-primary-container shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-on-primary-container/20 px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-widest">
              Módulo de IA
            </span>
          </div>
          <h1 className="text-headline-lg font-bold mb-3">Configurações do Sistema</h1>
          <p className="text-body-lg opacity-90 leading-relaxed">
            Configure o provedor, o modelo e os endpoints usados para geração de voz e refinamento de texto.
          </p>
        </div>
        <div className="absolute right-[-10%] top-[-20%] w-96 h-96 bg-secondary-container/30 rounded-full blur-[80px]" />
        <div className="absolute right-[10%] bottom-[-10%] w-64 h-64 bg-tertiary-container/40 rounded-full blur-[60px]" />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary p-2 bg-primary-container/10 rounded-lg">psychology</span>
              <h2 className="font-bold text-headline-sm">Modelo & Provedor</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-label-md mb-2 text-on-surface-variant">Provedor de IA</label>
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-primary bg-primary/5 text-primary font-bold">
                    <span className="material-symbols-outlined">cloud</span>
                    OpenAI
                  </button>
                  <button className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-outline-variant text-on-surface-variant hover:border-primary/50 transition-all">
                    <span className="material-symbols-outlined">dns</span>
                    Local
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-label-md mb-2 text-on-surface-variant">Seleção do Modelo</label>
                <select className="w-full bg-surface border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                  <option>GPT-4o (Standard)</option>
                  <option>GPT-4 Turbo</option>
                  <option>GPT-3.5-Turbo</option>
                  <option>Custom Model (Local)</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-secondary p-2 bg-secondary-container/10 rounded-lg">api</span>
              <h2 className="font-bold text-headline-sm">Endpoints de Conexão</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-label-md mb-2 text-on-surface-variant">URL Base do Provedor</label>
                <input className="w-full bg-surface border border-outline-variant rounded-xl p-3 focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="ex: http://localhost:11434/v1" type="text" />
                <p className="mt-2 text-[12px] text-on-surface-variant">Deixe em branco para usar o endpoint padrão da OpenAI.</p>
              </div>
              <div>
                <label className="block text-label-md mb-2 text-on-surface-variant">Token de Acesso (API Key)</label>
                <div className="relative">
                  <input className="w-full bg-surface border border-outline-variant rounded-xl p-3 pr-12 focus:ring-2 focus:ring-primary outline-none transition-all" type="password" placeholder="sk-proj-..." readOnly />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    <span className="material-symbols-outlined">visibility</span>
                  </button>
                </div>
                <p className="mt-2 text-[12px] text-on-surface-variant">Use sua API Key do OpenAI ou outro provedor de TTS.</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="bg-secondary-container/20 border border-secondary/20 p-6 rounded-2xl flex gap-6 items-start">
        <div className="bg-secondary-container text-on-secondary-container p-3 rounded-full">
          <span className="material-symbols-outlined">info</span>
        </div>
        <div>
          <h3 className="font-bold text-on-secondary-container mb-1">Compatibilidade de Local Server</h3>
          <p className="text-body-md text-on-secondary-container/80 leading-relaxed">
            Suporta servidores compatíveis com a API OpenAI, como Ollama, LocalAI e LM Studio.
          </p>
        </div>
      </section>

      <footer className="h-24 px-6 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between rounded-2xl sticky bottom-4 z-40 shadow-sm">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-[18px]">history</span>
          <span className="text-label-md">Última alteração: há 2 horas por Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-6 py-3 text-on-surface-variant font-bold rounded-xl hover:bg-surface-container transition-all active:scale-95">
            Restaurar Padrões
          </button>
          <button className="px-8 py-3 bg-primary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">save</span>
            Salvar Configurações
          </button>
        </div>
      </footer>
    </div>
  );
}
