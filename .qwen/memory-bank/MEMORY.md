# Voice-RMV — Memory Bank Index

Arquivo principal de index para o memory bank do projeto Voice-RMV.

## 🚀 Como Começar

### Primeira Consulta: **MEMORY.md** (Este Arquivo)
- Contém overview de todos os arquivos
- Quick reference com fatos importantes
- Links para todos os arquivos relevantes

### Guia Completo: **README.md**
- Instruções detalhadas de uso
- Melhores práticas
- Checklist de manutenção

### Workflow: **EXECUTION_WORKFLOW.md**
- 14 passos para execução de tarefas
- Inclui passo crítico de listar testes para validação humana

### Workflow Skill: **voice-rmv-workflow**
- Skill local para aplicar o workflow do projeto de forma consistente
- Usa o mesmo processo documentado em `WORKFLOW_RULES.md` e `EXECUTION_WORKFLOW.md`

---

## 📚 Arquivos de Referência (Analysis Reports)

### Backend Analysis
- 📄 **Relatório Completo:** `/mnt/projetos/voice-rmv/.qwen/REPORTO_BACKEND_ANALISE.md`
- 📄 **Índice Rápido:** `/mnt/projetos/voice-rmv/.qwen/memory-bank/REPORTO_BACKEND_ANALISE_INDEX.md`

**Conteúdo:**
- Arquitetura do backend (FastAPI + Celery + Redis + PostgreSQL)
- 8 serviços principais (TTS, STT, Audio, Video, DB, Response, etc.)
- API endpoints (/api/narrate/*, /api/tasks/*, /api/voices)
- Celery tasks (narrate_text_task, narrate_video_url_task, narrate_audio_file_task, narrate_video_file_task)
  - `POST /api/narrate/text` agora é assíncrono via Celery (speed/pitch/volume preservados)
- Testes e status atual da suíte
- Docker e runtime notes
- Voices suportadas (PT-BR e EN-US)

**Use quando:**
- Precisar entender a arquitetura do backend
- Consultar endpoints de API disponíveis
- Ver fluxo de tarefas assíncronas
- Debugar serviços específicos (TTS, STT, etc.)

---

### Frontend Analysis
- 📄 **Relatório Completo:** `/mnt/projetos/voice-rmv/.qwen/FRONTEND_ANALYSIS.md`
- 📄 **Índice Rápido:** `/mnt/projetos/voice-rmv/.qwen/memory-bank/FRONTEND_ANALYSIS_INDEX.md`

**Conteúdo:**
- Arquitetura do frontend (React 19 + TypeScript + Tailwind 4 + Vite)
- páginas principais, componentes ativos e placeholders remanescentes
- API client e React Query hooks
- Estilização e tema (Tailwind CSS 4)
- Known issues e pontos de atenção
- Status de arquivos modificados (Git)

**Use quando:**
- Precisar entender a arquitetura do frontend
- Consultar componentes disponíveis
- Ver mapeamento de rotas
- Debugar componentes específicos
- Entender known issues

---

### Component Count (Atualizado)
- **Frontend Components:** múltiplos componentes ativos + placeholders remanescentes
- **Frontend Pages:** rotas principais implementadas com algumas telas placeholder
- **Production Readiness:** parcial; validar contra a codebase atual antes de usar métricas percentuais

---

## 📚 Arquivos do Memory Bank

### Index Principal
- 📄 **MEMORY.md** - Este arquivo (index principal)
- 📄 **README.md** - Guia de uso do memory-bank

### Progress Report
- 📄 **progress.md**
  - Status geral do projeto
  - Mudanças recentes validadas
  - Known issues e prioridades abertas
  - Comandos de validação
  - Runtime notes da stack local

### Workflow Skill
- 📄 **.qwen/skills/voice-rmv-workflow/SKILL.md**
- 📄 **.qwen/skills/voice-rmv-workflow/agents/openai.yaml**

---

## 🎨 Design System

### Designer Rules
- 📄 **Arquivo:** `/mnt/projetos/voice-rmv/.qwen/memory-bank/DESIGNER_RULES.md`

**Conteúdo:**
- Brand Identity (Precision, Speed, Modern Minimalism)
- Technical Stack (React 18+, TypeScript, Vite, Tailwind CSS, TanStack Query)
- Color Palette and current implementation notes
- Typography (Inter font family)
- Elevation & Shapes (rounded-lg, shadow-sm/lg)
- UI Patterns (Navigation, Components, AI Features)
- Development Patterns (Atomic design, Query hooks, Styles)

**Use quando:**
- Precisar seguir regras de design
- Consultar paleta de cores
- Implementar componentes novos
- Ver padrões de UI/UX

**Use quando:**
- Precisar ter visão geral do progresso
- Ver o que está funcionando vs. o que falta
- Consultar known issues
- Entender status de deployment

---

## ⚙️ Tech Context

### TechContext.md
- 📄 **Arquivo:** `/mnt/projetos/voice-rmv/.qwen/memory-bank/techContext.md`

**Conteúdo:**
- Technologies Used (backend e frontend)
- Development Setup
- Technical Constraints
- Dependencies
- Tool Usage Patterns
- Celery Tasks patterns
- Database Access patterns
- Frontend API patterns

**Use quando:**
- Precisar entender constraints técnicos
- Ver padrões de uso de ferramentas
- Consultar dependências
- Entender setup de development

---

## 🎯 Memory Bank Organization

### Estrutura de Arquivos

```
.qwen/memory-bank/
├── MEMORY.md                          ← Este arquivo (index principal)
├── README.md                          ← Guia de uso do memory-bank
├── EXECUTION_WORKFLOW.md              ← Workflow de 14 passos
├── WORKFLOW_RULES.md                  ← Regras oficiais de workflow (+ anexo VoiceOverPage)
├── ANALYSIS_SUMMARY.md                ← Guia rápido de análise
├── DESIGNER_RULES.md                  ← Design system & regras
├── progress.md                        ← Progress report
├── techContext.md                     ← Tech context
├── REPORTO_BACKEND_ANALISE_INDEX.md  ← Backend analysis index
├── FRONTEND_ANALYSIS_INDEX.md        ← Frontend analysis index
├── voiceoverpage_analise.md          ← Diagnóstico VoiceOverPage (24 achados)
```

### Arquivos de Análise Externos

```
.qwen/
├── REPORTO_BACKEND_ANALISE.md        ← Backend analysis completo (~970 linhas)
└── FRONTEND_ANALYSIS.md              ← Frontend analysis completo (~1156 linhas)
```

---

## 🔍 Como Buscar Informações

### Para Backend
1. **Leve:** `/mnt/projetos/voice-rmv/.qwen/REPORTO_BACKEND_ANALISE_INDEX.md`
2. **Detalhes:** `/mnt/projetos/voice-rmv/.qwen/REPORTO_BACKEND_ANALISE.md`
3. **Git Status:** `git status` no diretório `backend/`

### Para Frontend
1. **Leve:** `/mnt/projetos/voice-rmv/.qwen/FRONTEND_ANALYSIS_INDEX.md`
2. **Detalhes:** `/mnt/projetos/voice-rmv/.qwen/FRONTEND_ANALYSIS.md`
3. **Git Status:** `git status` no diretório `frontend/`

### Para Progresso
1. `/mnt/projetos/voice-rmv/.qwen/memory-bank/progress.md`

### Para Contexto Técnico
1. `/mnt/projetos/voice-rmv/.qwen/memory-bank/techContext.md`

### Para Design System
1. `/mnt/projetos/voice-rmv/.qwen/memory-bank/DESIGNER_RULES.md`

### Para Guia Rápido de Análise
1. `/mnt/projetos/voice-rmv/.qwen/memory-bank/ANALYSIS_SUMMARY.md`

---

## 📋 Quick Reference

### Backend Quick Facts
- **Framework:** FastAPI 0.115.0+
- **Database:** PostgreSQL (async) + SQLite (dev)
- **Cache:** Redis 7.0+
- **Tasks:** Celery 5.4.0+
- **TTS:** edge-tts 6.1.3+
- **STT:** faster-whisper 1.1.0+
- **Video:** yt-dlp com extras default e runtime `deno` validado no worker local
- **Language:** Python 3.14+
- **Workflow skill:** `voice-rmv-workflow` disponível para seguir o processo do projeto

### Frontend Quick Facts
- **Framework:** React 19.0.0
- **Language:** TypeScript 5.7.0
- **Build:** Vite 6.0.0
- **CSS:** Tailwind CSS 4.0.0
- **Routing:** React Router 7.16.0
- **Data Fetching:** TanStack Query 5.60.0
- **HTTP:** Axios 1.7.0
- **Current validated state:** `npm run build` ok em 2026-06-09
- **Recent Activity:** mostra título original, link de origem, idioma e voz
- **Editor sync:** tasks novas usam `narration_segments` derivados do Edge TTS; timestamps do Whisper permanecem separados

### Component Count
- **Backend Services:** TTS, STT, Audio, Video, DB, Response, Task Queue, Helpers
- **Frontend Components:** consultar `FRONTEND_ANALYSIS.md` para contagem atual
- **Frontend Pages:** consultar `FRONTEND_ANALYSIS.md` para status atual

### Test Coverage
- **Backend:** suíte existe, mas o status deve ser verificado antes de confiar nos números documentados
- **Frontend:** sem suíte automatizada identificada nesta revisão

---

## 🚀 Deployment

### Docker Compose Services
- Consultar runtime e arquivos de infraestrutura atuais antes de assumir compose completo
- Portas confirmadas na codebase atual:
  - `api`: `8456`
  - `frontend`: `5173`

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `OUTPUT_DIR` - Narration outputs
- `TEMP_DIR` - Temporary files
- `CORS_ORIGINS` - Allowed CORS origins (comma-separated, default: `http://localhost:5173,http://localhost:8456`)
- `API_KEY` - Optional API key for auth (empty = dev mode without auth)
- `RATE_LIMIT_ENABLED` - Enable/disable rate limiting (default: `True`)

---

## 📊 Production Readiness

### Backend
- Estrutura principal implementada
- Runtime local validado com `podman-compose`
- Ainda há gaps conhecidos de banco, paginação e uploads
- Tasks de vídeo URL persistem `video_title`, `source_url` e `language`
- Tasks assíncronas persistem linha do tempo da narração TTS e duração real do MP3

### Frontend
- Core UI principal implementada
- Build validado em 2026-06-08
- Ainda há páginas/componentes placeholder e débitos técnicos abertos
- Dashboard/Recent Activity: YouTube mostra título do vídeo, uploads mostram filename sem extensão, status atualiza automaticamente via polling
- Editor sincroniza o destaque com a voz narrada em tasks geradas após 2026-06-09

---

## 📝 Last Updated

**Data:** 2026-06-10  
**Status:** 24/24 itens VoiceOverPage resolvidos ✅; segurança backend implementada (CORS, Rate Limit, Auth, Output controlado)
**Next Milestone:** Complete placeholder pages + quality improvements

---

## ⭐ Workflow de Execução

### EXECUTION_WORKFLOW.md
- 📄 **Arquivo:** `/mnt/projetos/voice-rmv/.qwen/memory-bank/EXECUTION_WORKFLOW.md`

**Conteúdo:**
- 14 passos de execução de tarefas validados
- Passo 1-12: Workflow padrão (Entender → Analisar → Executar → Refinar)
- Passo 13: Atualizar documentação no workflow
- Passo 14: Atualizar índice principal
- Checklist de execução prévio e pós-tarefa
- Template de plano detalhado
- Exemplos de uso
- Por que este workflow funciona

**Use quando:**
- Precisar executar nova tarefa
- Quer entender fluxo completo de desenvolvimento
- Desejar documentar lições aprendidas no workflow

**Quando atualizar o workflow:**
- Após conclusão de tarefa complexa
- Quando descobrir novo padrão de implementação
- Quando aprender nova técnica ou abordagem
- Quando melhorar significativamente uma parte do código
- Quando descobrir nova ferramenta ou recurso
- Quando otimizar performance de forma significativa

**Exemplos de Atualizações:**
- Novo componente criado → Adicionar ao Quick Reference
- Novo padrão descoberto → Adicionar seção "Novo Padrão"
- Lição aprendida → Adicionar ao Learnings
- Novo arquivo criado → Atualizar estrutura de arquivos

---

## 📝 Last Updated

**Data:** 2026-06-05
**Status:** Production Ready - 85% Complete
**Next Milestone:** Complete placeholder pages + quality improvements

**Nota posterior (2026-06-09):** O bloco acima foi preservado como registro histórico. Para o estado atual, consultar o bloco de 2026-06-09 e `progress.md`.

**Nota posterior (2026-06-09 tarde):** Waveform bars do Editor corrigidas (overflow + contraste). Auto-save verificado e funcionando.

---

*Memory Bank Index — Voice-RMV*
