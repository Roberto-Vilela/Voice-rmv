# Voice-RMV — Progress Report

**Last Updated:** 2026-06-08  
**Status:** Functional core validated; frontend and backend still have known gaps

### 2026-06-08 (tarde)

- Aumentada largura mínima do input de URL no `HeroSection` (`min-w-0` → `lg:min-w-[400px]`)

### 2026-06-08 (noite) — Fix upload tasks + Dashboard refactor

**Problemas resolvidos:**
- Upload tasks não mostravam `display_name` — agora setado early (logo ao iniciar) e no completion
- `useTasks()` sem polling — tasks ficavam "pending" para sempre sem refresh adicionado `refetchInterval: 3000` condicional (só quando há tasks ativas)
- `getTaskLink()` mostrava `/api/output/uuid.mp3` para uploads — agora mostra `input_file`

**Bugs corrigidos (8 total):**
1. `history.py` — Duplicar task não disparava celery; agora redispara video_url, erro para upload
2. `RecentActivity.tsx` — Botão "View All" sem `onClick`; agora navega para `/library`
3. `TaskRow.tsx` — Status `pending` sem cor específica; adicionado cinza
4. `TaskRow.tsx` — `window.location.href` causava reload; trocado por `useNavigate()`
5. `TaskRow.tsx` — Menu dropdown overflow; `max-h-[60vh] overflow-y-auto`
6. `TaskRow.tsx` — `|| "Untitled"` inalcançável removido
7. `task.py` — `JSONB` import não usado removido
8. `task.py` — `SQLiteJSON` trocado por `JSON` genérico (compatível PostgreSQL + SQLite)
   - `UUID(as_uuid=True)` trocado por `Uuid` genérico

**Arquivos alterados:**
- `backend/app/routers/history.py` (duplicate dispatch)
- `backend/app/models/task.py` (JSON + Uuid genéricos)
- `backend/app/routers/narrate.py` (passa `file.filename` para celery)
- `backend/app/tasks/narration_tasks.py` (early `display_name`)
- `frontend/src/api/hooks.ts` (refetchInterval em useTasks)
- `frontend/src/components/TaskRow.tsx` (pending color, navigate, menu, link)
- `frontend/src/components/RecentActivity.tsx` (View All navigate)

### 2026-06-08 (noite) — Correção da renderização de transcrição no Editor

**Bugs corrigidos:**
- `transcriber.py`: Correção no consumo do gerador `faster-whisper` (estava retornando segmentos vazios).
- `database.py`: Adicionado `attributes.flag_modified` para persistência correta de campos JSON no ORM SQLAlchemy.
- `narration_tasks.py`: Refatorado para mesclar `extra_data` de forma consistente, evitando perda de metadados.
- `EditorPage.tsx`: Forçada a classe `is-visible` nos itens de segmento para contornar falha de animação CSS.

**Arquivos alterados:**
- `backend/app/services/transcriber.py`
- `backend/app/database.py`
- `backend/app/tasks/narration_tasks.py`
- `frontend/src/pages/EditorPage.tsx`

### 2026-06-08 (noite) — Correção da Sincronização de Áudio (Highlight Sync)

**Bugs corrigidos:**
- Problema de "aceleração" visual no destaque das transcrições (desync entre áudio e texto).
- **Solução:** A solução foi identificada pelo **humano (usuário)**, que observou um atraso consistente de 1.5s - 2.0s entre o áudio e a transcrição. Através de observação empírica, o usuário sugeriu a implementação de um offset fixo para alinhar o playback.
- Implementada compensação de offset (SYNC_OFFSET = 2.0s) no frontend para alinhar os timestamps do Faster-Whisper com o áudio final processado pelo ffmpeg.
- Refatorado `WaveformPlayer.tsx` para usar `requestAnimationFrame` para sincronização de alta precisão.
- Refatorado `EditorPage.tsx` para usar estado otimizado (`useState` com verificação de mudança) para evitar re-renderizações excessivas.

**Arquivos alterados:**
- `frontend/src/pages/EditorPage.tsx`
- `frontend/src/components/WaveformPlayer.tsx`

---

## Executive Summary

Estado atual validado nesta revisão:
- Backend sobe com `postgres`, `redis`, `api` e `celery_worker`
- Frontend sobe em `5173` e compila com `npm run build`
- Fluxo de envio de URL do YouTube está funcional no `HeroSection`
- Mensagens de erro do hero foram humanizadas para casos reais de YouTube
- Worker agora possui `deno` instalado para compatibilidade com `yt-dlp`
- Primeiro processamento após recriação do worker pode demorar por download/warmup do `faster-whisper`

---

## Recent Changes

### 2026-06-08

#### Project State
- Workflow skill created for Voice-RMV execution discipline
- Project memory updated to reflect the current codebase and runtime state
- Current stack validated locally with `podman-compose`

#### Frontend
- Corrigido build TypeScript em `HeroSection.tsx`
- Corrigido polling do hero para não ficar preso quando a task falha
- Ajustado layout do hero:
  - campo de URL
  - seletor de voz
  - botão de ação
- Removido título duplicado da dashboard
- Corrigido ícone de task em `Recent Activity`
- Corrigido dropdown de voz encoberto no hero
- Melhoradas mensagens amigáveis de erro para:
  - `This video is not available`
  - `Video unavailable`
  - `task not found`
  - erro de rede temporário
  - vídeo privado, age restricted, shorts e login required
- `Recent Activity` agora mostra título original, link de origem e idioma

#### Backend / Infra
- Dependência alterada para `yt-dlp[default]`
- Imagem do backend ajustada para instalar `deno` em local fixo
- Rebuild sem cache validado
- Worker recriado e confirmado com `deno 2.8.2`
- Warning de runtime JavaScript ausente do `yt-dlp` deixou de aparecer nos logs do worker novo
- Worker grava `video_title`, `source_url` e `language` nas tasks de vídeo URL

#### Runtime Notes
- `GET /api/health` respondeu `{"status":"ok"}`
- URL pública de teste foi aceita e entrou em `processing`
- Primeira execução do worker após rebuild baixou assets do `faster-whisper` do Hugging Face

---

## What Works

### Backend
- API FastAPI sobe em `8456`
- Healthcheck funcional
- Redis e PostgreSQL operacionais na stack local
- Worker Celery consome tasks de vídeo
- Download de YouTube funcional para links públicos válidos
- `yt-dlp` roda com runtime JavaScript disponível

### Frontend
- Build de produção conclui com sucesso
- App sobe em `5173`
- Home/dashboard renderiza
- Hero de URL do YouTube integrado ao backend
- Seleção de voz funcional no hero
- Feedback de erro mais claro para usuário final

---

## Known Issues

### Alta prioridade
- Helper de banco síncrono no backend continua frágil para o cenário default de SQLite async
- `GET /api/tasks` ainda precisa corrigir o campo `total`
- Upload do backend ainda lê arquivo inteiro em memória

### Média prioridade
- Editor ainda usa `document.execCommand`
- Há uso de `dangerouslySetInnerHTML` no editor que merece revisão cuidadosa
- Frontend ainda mistura navegação SPA com `window.location` em alguns pontos
- Preview de voz ainda cria tasks reais de TTS

### Operacional
- Primeiro processamento após subir worker novo pode ser lento por warmup/download de modelo
- Worker Celery ainda roda como `root` no container

---

## Validation Commands

```bash
cd frontend && npm run build
curl -fsS http://localhost:8456/api/health
podman-compose ps
podman-compose logs --tail=80 celery_worker
```

---

## Notes

- Evitar registrar percentuais fixos de readiness sem revalidação da codebase.
- Evitar registrar contagens rígidas de componentes/páginas quando o frontend estiver em mudança ativa.
- Para detalhes de arquitetura e gaps, consultar:
  - `/mnt/projetos/voice-rmv/.qwen/REPORTO_BACKEND_ANALISE.md`
  - `/mnt/projetos/voice-rmv/.qwen/FRONTEND_ANALYSIS.md`
