# Arquivo Historico

Esta continuacao preserva integralmente o historico registrado ate 2026-06-10.
Para o estado atual e o indice de progresso, consultar `progress.md`.

# Voice-RMV — Progress Report

**Last Updated:** 2026-06-10  
**Status:** 24/24 itens VoiceOverPage resolvidos ✅

### 2026-06-09 — VoiceOverPage Problemas 1, 2, 3 + workflow learning

**Workflow learning:** Durante Problema 1, apresentei plano e aguardei aprovação ✅. Durante Problema 2, pulei o plano (steps 5-6) e pulei a validação humana (step 8). O usuário apontou ambas as falhas. Workflow exige: **apresentar plano (steps 5-6)** → executar → **listar testes → PARAR e aguardar validação (step 8)** → só então wrap-up (steps 9-14).

**Problema 1 — Speed/Pitch/Volume sliders + Voice personas:**
- Backend: `schemas.py` (speed, pitch, volume), `tts_engine.py` (rate/pitch/volume params), `narrate.py` (passa body params)
- Frontend: `client.ts` + `tasks.ts` + `VoiceOverPage.tsx` (3 sliders, volume novo, language filter All/PT/EN, 12 persona cards com ícones, View All expande grid)
- Voice personas revisadas: mapeamento validado contra API real (Davis/Tony/Sara não existiam → corrigido para Andrew/Roger/Ana; adicionado pt-PT Duarte + Raquel)
- Testes manuais validados pelo usuário ✅

**Problema 2 — Text task síncrona → Celery async:** ✅
- Criada `narrate_text_task` em `narration_tasks.py:43` (segue mesmo padrão: `run_async(synthesize(...))` → `_save_narration_audio()` → `update_task(completed)`)
- `/text` endpoint agora cria task `pending` → `narrate_text_task.delay(...)` → retorna imediatamente
- Speed/pitch/volume preservados na task
- Containers api + celery_worker rebuildos
- Testes manuais validados pelo usuário ✅ (curl retornou `pending`, poll mostrou `completed` com `audio_url`)

**Problema 3 — `catch (err: any)` → `getErrorMessage()`:** ✅
- Criado `frontend/src/utils/errors.ts` com `getErrorMessage()` (DRY, `isAxiosError` + `instanceof Error`)
- `EditorPage.tsx`: removeu função local, importa de `../utils/errors`
- `VoiceOverPage.tsx`: `catch (err: unknown)` + `getErrorMessage(err, fallback)`
- Build validado (162 modules)

**Problema 4 — `fontVariationSettings` inline → `.icon-filled`:** ✅
- `VoiceOverPage.tsx:279`: inline `style` substituído pela classe `.icon-filled`
- Padronizado com EditorPage e WaveformPlayer (que já usavam `.icon-filled`)

**Item #6 — "Advanced Modulation" placeholder removido:** ✅
- Botão + placeholder removidos — speed/pitch/volume já expostos como sliders diretos, edge-tts não tem mais parâmetros
- `advanced` state removido
- Bundle -0.49 kB

**Item #10 — Reveal observer eficiente:** ✅
- Deps alterado de `[generatedTask?.id, script, selectedVoice]` → só `[generatedTask?.id]`
- Observer não reconecta ao digitar (script) ou trocar voz (selectedVoice)

**Item #11 — Preview section sem `hover-lift`:** ✅
- Classe `hover-lift` removida da preview section

**Item #12 — Textarea sem `maxLength`:** ✅
- Frontend: `maxLength={5000}` no textarea — bloqueia digitação + colagem
- Backend: `Field(max_length=5000)` no `NarrateTextRequest` — valida 422 no POST

**Item #13 — Error toast sem auto-dismiss:** ✅
- `useEffect` com `setTimeout(6000)` → `setError(null)` com cleanup
- Botão X no toast para fechamento manual
- Layout flex com ícone close

**Micro-interações suaves (UX):** ✅
- `index.css`: novas classes `.card-hover`, `.btn-glow`, `.filter-pill`, `.toast-slide`, `.stagger-1` a `.stagger-8`
- Voice cards: hover sobe 4px + sombra + ícone animado
- Generate button: brilho roxo + escala 1.02 no hover
- Language filters: transição suave + sobe 1px
- Error toast: animação slide-in ao aparecer
- Build validado (CSS 54→55 kB)

**Problema (queue) — Polling + Waveform sem barras:** ✅
- **Causa 1:** `generateAudio()` criava task `pending` mas nunca polling para `completed` → UI ficava travada em "No audio yet."
  - Fix: adicionado `setInterval` de 1s chamando `getTask(id)` até `completed` ou `error`
- **Causa 2:** `WaveformPlayer` só criava barras com dep `[task?.id]`. Transição `pending`→`completed` mantinha mesmo `id`, então `useEffect` não re-executava
  - Fix: adicionado `task?.audio_url` às deps do efeito de criação de barras
- `VoiceOverPage.tsx`: polling + import `getTask`
- `WaveformPlayer.tsx`: dep `task?.audio_url`

### 2026-06-09 — Fix waveform bars invisíveis no Editor + verificação auto-save

**Problema:** As barras do waveform no Editor não apareciam visualmente, apesar de estarem no DOM.

**Diagnóstico (2 causas):**
1. **Layout overflow:** 100 barras × `gap-1.5` (6px) = 594px só de gaps — maior que qualquer container mobile/editor, forçando `flex-grow` a distribuir espaço negativo → barras com **0px de largura**
2. **Baixo contraste:** `bg-secondary-container` (#57dffe) sobre `bg-white` (#ffffff) tem contraste ~1.6:1 — praticamente invisível

**Solução:**
- Reduzido número de barras: 100 → 48
- Reduzido gap: `gap-1.5` (6px) → `gap-0.5` (2px)
- Adicionado `min-w-[2px]` para evitar colapso total
- Idle bars agora usam gradiente visível (0.5 opacidade) igual ao playing mas mais sutil
- Removido `bg-secondary-container` das barras (gradiente no CSS resolve)

**Verificação auto-save:** O mecanismo está correto — `useEffect` com debounce de 1s chama `saveChanges("auto")` que faz PATCH para `/api/tasks/{id}` com `transcription` + `editor_segments`. Backend faz merge corretamente (history.py:89-96). Única limitação: não salva se página for fechada abruptamente.

**Arquivos alterados:**
- `frontend/src/components/WaveformPlayer.tsx` (count, gap, min-w)
- `frontend/src/index.css` (idle gradient opacity)

### 2026-06-09 — Fase 3: Design rules + Type safety

- Inline styles `fontVariationSettings` substituídos por classe `.icon-filled` no `index.css`
- `catch (err: any)` substituído por `catch (err: unknown)` + `getErrorMessage()` com `isAxiosError`
- Adicionada função helper `getErrorMessage()` no `EditorPage.tsx`

### 2026-06-09 — Análise do módulo Editor (Fase 1)

**Módulo Editor — análise completa concluída (3 fases).**
- 18 achados identificados inicialmente, todos tratados ou já resolvidos

**Escopo:** Correção item por item dos 18 achados no Editor, validados pelo usuário a cada entrega.

**Item 1 concluído:** Removido `TranscriptionView.tsx` — componente placeholder de 5 linhas que nunca era importado em lugar nenhum. Build TypeScript validado.

**Item 2 concluído:** Adicionadas classes CSS `active-row`, `zebra-row`, `desktop-content-height` ao `index.css`. Validação visual do usuário aprovada.

**Item 4 — Race condition do Audio:** Já resolvido nas refatorações anteriores (06-06-09). Pulado.

**Item 5 — seekTo no segmento:** Já resolvido — sincronização funciona via `onTimeUpdate` + `activeSegmentIndex`.

**Item 6 concluído:** `document.execCommand()` substituído por `applyFormat()` com Range API (Selection API + `range.extractContents()` + `insertNode()`). Bold/Italic/Underline sem API deprecada. Undo/Redo mantidos com `execCommand` (gatilho para desfazer nativo do navegador).

**Fase 1 completa.**

### 2026-06-09 — Fase 2: Layout conflict (double header)

**Problema:** EditorPage renderizava dentro do AppLayout (TopBar + Sidebar + BottomNav) E tinha seu próprio `header` sticky com back/title/export/profile — resultando em 2 headers, 2 fotos de perfil, z-index competindo.

**Solução:** Removido sticky header do Editor. Substituído por um cabeçalho de página simples (back + title + export) no fluxo do conteúdo, estilo Dashboard. Profile pic removida (agora única no TopBar/Sidebar).

### 2026-06-09 — Sincronização do Editor com a narração TTS

**Problema validado:**
- O Editor reproduzia o áudio sintetizado pela voz escolhida, mas destacava a transcrição usando timestamps extraídos pelo Whisper do áudio original.
- Como o ritmo, as pausas e a duração da narração TTS são diferentes do áudio original, offsets fixos não mantinham a sincronização, especialmente em frases curtas.

**Diagnóstico humano:**
- O usuário identificou que o problema já não era apenas um atraso constante. A causa real era a existência de duas linhas do tempo diferentes: áudio original e voz narrada.
- A sessão anterior estava sendo conduzida com Gemini; a tentativa aplicada com offset fixo não resolveu estruturalmente o problema.

**Solução validada pelo usuário:**
- `edge-tts` agora emite eventos `WordBoundary` durante a síntese.
- As tasks criam `narration_segments` alinhados à voz sintetizada.
- `duration_seconds` passa a representar a duração real do MP3 narrado, obtida com `ffprobe`.
- Os timestamps originais do Whisper continuam preservados em `transcription_segments`.
- A duração original é preservada em `original_duration_seconds`.
- O Editor prioriza `narration_segments` para o destaque visual.
- O destaque ativo voltou a atualizar `activeSegmentIndex` corretamente.

**Validação humana:**
- O usuário recriou o worker, gerou uma nova task e confirmou que áudio e marcação passaram a funcionar sincronizados.
- Tasks antigas não recebem retroativamente `narration_segments`.

**Arquivos alterados:**
- `backend/app/services/tts_engine.py`
- `backend/app/services/audio_processor.py`
- `backend/app/tasks/narration_tasks.py`
- `backend/tests/test_tts.py`
- `backend/tests/test_audio_processor.py`
- `frontend/src/pages/EditorPage.tsx`
- `frontend/src/components/WaveformPlayer.tsx`
- `frontend/src/types.ts`

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

> **Referência atual:** Esta informação foi alterada; veja o item **2026-06-09 — Sincronização do Editor com a narração TTS** para a informação atual.

**Bugs corrigidos:**
- Problema de "aceleração" visual no destaque das transcrições (desync entre áudio e texto).
- **Solução:** A solução foi identificada pelo **humano (usuário)**, que observou um atraso consistente de 1.5s - 2.0s entre o áudio e a transcrição. Através de observação empírica, o usuário sugeriu a implementação de um offset fixo para alinhar o playback.
- Implementada compensação de offset (SYNC_OFFSET = 2.0s) no frontend para alinhar os timestamps do Faster-Whisper com o áudio final processado pelo ffmpeg.
- Refatorado `WaveformPlayer.tsx` para usar `requestAnimationFrame` para sincronização de alta precisão.
- Refatorado `EditorPage.tsx` para usar estado otimizado (`useState` com verificação de mudança) para evitar re-renderizações excessivas.

**Arquivos alterados:**
- `frontend/src/pages/EditorPage.tsx`
- `frontend/src/components/WaveformPlayer.tsx`

**Correção posterior — 2026-06-09:**
- O registro acima foi preservado como histórico da tentativa feita durante o trabalho anterior com Gemini.
- O offset fixo não resolveu estruturalmente o problema porque o áudio reproduzido era a narração TTS, enquanto os timestamps pertenciam ao áudio original.
- O usuário identificou essa diferença entre as duas linhas do tempo.
- O diagnóstico definitivo e a solução validada estão registrados na entrada de 2026-06-09.

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
- Editor sincroniza o destaque com a linha do tempo da narração TTS em tasks novas

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

---

### 2026-06-10 — Items 16-19: Segurança (CORS, Rate Limit, Auth, Output)

**Itens resolvidos do checklist VoiceOverPage:**

| # | Item | Status | Resumo |
|---|------|--------|--------|
| 16 | CORS `allow_origins=["*"]` | ✅ | Restrito a origens configuráveis via `CORS_ORIGINS` env var. Default: `localhost:5173,localhost:8456`. |
| 17 | Sem rate limiting | ✅ | `RateLimitMiddleware` com Redis (fallback memória). Global 60 req/min, `/api/narrate/` 10 req/min, `/api/tasks` 120 req/min, `/api/output` 120 req/min. |
| 18 | Sem auth/authentication | ✅ | `verify_api_key()` dependency via header `X-API-Key`. Se `API_KEY` não configurada → dev mode (sem auth). |
| 19 | `/api/output` sem acesso controlado | ✅ | Substituído `StaticFiles` mount por router com `FileResponse` + verificação de auth. |

**Arquivos criados:**
- `backend/app/middleware/__init__.py` — pacote middleware
- `backend/app/middleware/auth.py` — verificação de API key
- `backend/app/middleware/rate_limit.py` — rate limiter (Redis + fallback memória)
- `backend/app/middleware/rate_limit_middleware.py` — middleware ASGI com limites por path
- `backend/app/routers/output.py` — endpoint controlado para servir arquivos de áudio

**Arquivos modificados:**
- `backend/app/config.py` — adicionado `cors_origins`, `api_key`, `rate_limit_enabled`
- `backend/app/main.py` — CORS restrito, auth dependency, rate limit middleware, output router
- `docker-compose.yml` — adicionado `CORS_ORIGINS` e `API_KEY` env vars
- `backend/tests/conftest.py` — `mock_text_task_delay` fixture, `disable_rate_limit` autouse
- `backend/tests/test_narrate_api.py` — tests refatorados para Celery async
- `backend/tests/test_transcriber.py` — assert ajustado para `language=None, word_timestamps=True`

**Testes automatizados:** 30/30 passando

**Validação humana (resultados):**
| Teste | Resultado |
|-------|-----------|
| CORS `Origin: evil.com` → sem `Access-Control-Allow-Origin` | ✅ |
| CORS `Origin: localhost:5173` → com header | ✅ |
| Rate limit /api/narrate/ 10 req/min → requests 1-10=200, 11-15=429 | ✅ |
| Auth key errada (`X-API-Key: wrong`) → 401 | ✅ |
| Auth key correta (`X-API-Key: my-secret-key`) → 200 | ✅ |
| Dev mode (sem API_KEY) → 200 sem header | ✅ |
| Output `/api/output/inexistente.mp3` → 404 | ✅ |

**Learnings:**
- `docker-compose.yml` precisa referenciar `API_KEY: ${API_KEY-}` para passar env var do shell para o container — prefixo `VAR=value docker compose` não injeta automaticamente
- Rate limiter deve ser desabilitado em testes via `disable_rate_limit` fixture (autouse) para evitar falsos positivos
- `request.client` pode ser `None` em testes ASGI (httpx ASGITransport) — necessário fallback para "test"
- `redis.asyncio` está disponível no pacote `redis>=5.2.0` já existente nas dependências
- Testes de texto narrate precisaram ser refatorados de síncrono (mock `synthesize`) para async (mock `narrate_text_task.delay`) após migração Celery

---

### 2026-06-10 — Items 23, 24: Button padding + Voices skeleton (VoiceOverPage)

**#23 — Botão primário padding ajustado:** ✅
- Generate & Record button: `py-4` → `h-12 px-8`, `font-headline-md` → `font-semibold`, `active:scale-[0.98]` → `active:scale-95`
- Alinhado com DESIGNER_RULES.md sec.4 (botões: `h-11 px-6 rounded-lg font-semibold active:scale-95`)

**#24 — Loading voices skeleton:** ✅
- Texto "Loading voices…" substituído por 4 skeleton cards com `animate-pulse`
- Layout: círculo 40px + 2 barras de texto, mesma estrutura dos voice cards

**Checklist completo:** 24/24 itens do VoiceOverPage resolvidos e validados pelo usuário.

**Arquivo alterado:** `frontend/src/pages/VoiceOverPage.tsx`

**Testes manuais validados pelo usuário:** ✅

---

### 2026-06-10 — Library Module: L1 (total) + L2 (delete error handling)

**L1 — Backend `total` corrigido:** ✅
- `history.py:29`: `total=len(tasks)` → `select(func.count(Task.id))` — agora retorna o total real de registros no banco
- Testes: 30/30 passando

**L2 — Delete com try/catch + toast:** ✅
- `VideoUploadPage.tsx`: adicionado `error` state, `deletingId` state, `getErrorMessage()`, auto-dismiss toast 6s
- Botão delete desabilitado (`opacity-40`) durante operação
- Build: 163 modules, sem erros

**Workflow learning:**
- Novo formato de plano obrigatório adicionado ao `WORKFLOW_RULES.md` — deve conter: o que fazer, arquivos (com porquê), técnica, mini draft, riscos, viabilidade, fallback
- Plano detalhado melhora a compreensão do usuário e reduz retrabalho
