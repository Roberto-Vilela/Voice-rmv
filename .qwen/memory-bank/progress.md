# Progress — Voice-rmv

> **Detailed history:** [`progress_01.md`](./progress_01.md) (até 2026-06-10)

## v0.1.0 (current)

### Done & validated

| # | Task | Commit / PR | Status |
|---|------|-------------|--------|
| 1 | Send translated text from Editor → Voice Over (sessionStorage) | `f6c45de` | ✅ |
| 2 | Security audit: externalize POSTGRES_PASSWORD, TRANSLATION_CONTROLLER_TOKEN via `${VAR-default}` + `Field(validation_alias=...)` | `0a15b2d` | ✅ |
| 3 | Repository restructuring: `backend/src/` by domain, `docs/`, `examples/`, `assets/`, root clutter cleanup, `.gitignore` | `5c3f43c`, `1bd03e5`, `ec73f89` | ✅ |
| 4 | README rewrite (English, portfolio tone, Human Review & Governance section) | `b2c823c` | ✅ |
| 5 | Release v0.1.0 + GitHub Issues #1-#5 | Direct GitHub | ✅ |
| 6 | Import migration (Issue #5): all internal imports → `src.*`; re-export compatibility layer; `task_response.py` → `src/utils/` | `a0e8d77` | ✅ |
| 7 | Fix tests: video_downloader context manager mocking, translate async patching + import paths | `(this session)` | ✅ |
| 8 | GitHub Actions CI: backend-tests + frontend-build workflow | `(this session)` | ✅ |
| 9 | Fix Clear button in EditorPage: enable for all task types, prevent segment rebuild after clear, add disabled visual style | `fa1b2bf` | ✅ |
| 10 | Fix Clear/Remove Source regression: preserve Library identity while marking source as removed, stop editor rebuild via `source_removed` flag | `(this session)` | ✅ |
| 11 | Fix backend CI failures: install backend test deps, add `aiosqlite` runtime dependency, and validate both GitHub Actions jobs pass | `(this session)` | ✅ |
| 12 | Fix 500 error — Redis/Celery + sync_engine SQLite UUID regression. Compile Redis from source, fix `sync_engine` URL replace for `+aiosqlite`, fix `uuid.UUID` conversion in sync queries | `(this session)` | ✅ |
| 13 | Audio download system: new endpoint `GET /api/tasks/{id}/download` with `Content-Disposition: attachment`, frontend handler + buttons on Library, Editor, and VoiceOver pages | `(this session)` | ✅ |
| 14 | v1.02 High-precision dictation: MediaRecorder + faster-whisper backend, theme-based vocabulary (Wikipedia + fallback), GPU toggle, TTL model cache (10 min), DictationModal with topic grid + loading messages, progressive loading UX | `(this session)` | ✅ Validated |
| 14a | Fix: hoisting bug (`dictationError`/`clearError` used before declaration) crashed VoiceOverPage | `(this session)` | ✅ Fixed |
| 14b | Fix: trailing-slash route mismatch (`POST /` vs `POST ""`) caused network error on dictation | `(this session)` | ✅ Fixed |
| 14c | Fix: `torch` import crash when PyTorch not installed | `(this session)` | ✅ Fixed |
| 14d | Fix: `httpx` used in production but only dev dependency → replaced with `urllib.request` | `(this session)` | ✅ Fixed |
| 14e | Fix: `ffmpeg` not in PATH → fallback via `imageio_ffmpeg.get_ffmpeg_exe()` | `(this session)` | ✅ Fixed |
| 14f | Fix: `language="pt-BR"` forçava whisper a português → mudado para `"auto"` (auto-detect) | `(this session)` | ✅ Fixed |
| 14g | Fix: `_build_vocabulary` não salvava fallback em disco → agora salva SEMPRE (Wikipedia ou fallback) | `(this session)` | ✅ Fixed |

### Test results (current)

- **Backend**: 35/35 pytest passed (0.12s)
- **Frontend**: `npm run build` (tsc + vite) clean, 163 modules, 404.98 KB gzip: 124.99 KB
- **Human validation**: Clear now removes editor content without turning the Library entry into `Untitled`; user confirmed the corrected flow. Download system validated via curl (endpoint + Content-Disposition) and via frontend.
- **CI validation**: Backend and frontend GitHub Actions jobs passed after adding backend test dependencies and `aiosqlite`
- **Process note**: `erro_implementacao.md` was preserved as a reusable failure template and its task-specific contents were cleared after validation
- **Reference doc**: [`botao_clear.md`](./botao_clear.md) contains the full implementation narrative, debugging path, and repair guide for future regressions

### 2026-06-30 — Porta do frontend: 5173 → 5174

Motivo: porta 5173 já estava em uso por outro projeto no host.

O que foi alterado:
- `frontend/vite.config.ts` já estava em **5174** (consistente)
- `docker-compose.yml`: `CORS_ORIGINS` corrigido de `5173` para `5174`
- `backend/app/config.py`: default `cors_origins` corrigido para `5174`
- `AGENTS.md` e `README.md`: documentação atualizada para `5174`
- Containers rebuildados com `docker compose up -d --build`

### 2026-06-30 — Fix download no EditorPage

**Root cause:** `Content-Disposition` header no endpoint `GET /api/tasks/{id}/download` continha caracteres Unicode (travessão `—`, aspas curvas) que não são latin-1 → `UnicodeEncodeError` → 500 → fetch não-ok → erro engolido por `void`.

**O que foi alterado:**
- `backend/app/routers/history.py`: sanitização do filename com `encode("ascii", errors="replace")` + fallback paths (mesmo padrão do `output.py`)
- `frontend/src/pages/EditorPage.tsx`: `handleDownloadAudio` agora é async com try/catch e exibe erro no toast, ao invés de `void` silencioso

**Validado:** curl retorna 200 com `audio/mpeg`.

### Reference docs

| Doc | Content |
|-----|---------|
| [`dictacao_v1_implementacao.md`](./dictacao_v1_implementacao.md) | Full implementation narrative for v1.02 dictation: files created/modified, complete flow, 7 errors with causes/fixes, verification checklist for another model |
| [`erros_dictacao_v1.md`](./erros_dictacao_v1.md) | Two implementation errors (hoisting + trailing slash) — root cause, final fix, junior checks |

### Known issues (recorded as GitHub Issues)

| Issue | Title | Status |
|-------|-------|--------|
| #1 | GPU acceleration for faster-whisper | Open |
| #2 | Structured logging (structlog) | Open |
| #3 | Batch narration processing | Open |
| #4 | Export presets (JSON, SRT, subtitle formats) | Open |
| #5 | Remove app/services/ and app/tasks/ compatibility layer | Open |

### 2026-07-06 — Fix sync audio/texto em text tasks (VoiceOverPage → Editor)

**Problema:** `narrate_text_task` usava `synthesize()` sem WordBoundary, não gerava `narration_segments`, não salvava `duration_seconds`. Editor caía no fallback de segmentos uniformes — delay de 1-2s em textos longos.

**O que foi feito:**
- `tts_engine.py`: `synthesize_with_timing()` agora aceita `speed/pitch/volume`
- `narration_tasks.py`: `narrate_text_task` usa `synthesize_with_timing()` → gera `narration_segments` via `build_narration_segments()` + salva `duration_seconds` (mesmo padrão já validado das tasks de vídeo/upload)
- `EditorPage.tsx`: adicionado `SYNC_OFFSET = -2.0` no cálculo do `activeSegmentIndex` — compensa áudio estar adiantado vs destaque visual

**Commit:** `537dbe5`
**Arquivos:** 3 (backend/src/sync/narration_tasks.py, backend/src/voice_generation/tts_engine.py, frontend/src/pages/EditorPage.tsx)

### 2026-07-19 — Port conflict resolution + frontend port change

**Problema:** Containers `postgres` e `redis` do voice-rmv não iniciavam — portas `5432` e `6379` já ocupadas pelo projeto `opencut-classic`. API falhava com `Temporary failure in name resolution` → frontend recebia 500 em `/api/voices` e `/api/transcribe/gpu-check`.

**O que foi alterado:**
- `docker-compose.yml`: `5432:5432` → `5433:5432` (postgres host port)
- `docker-compose.yml`: `6379:6379` → `6380:6379` (redis host port)
- `docker-compose.yml`: `5174:5174` → `5001:5174` (frontend host port)
- `docker-compose.yml`: `CORS_ORIGINS` atualizado de `localhost:5174` para `localhost:5001`

**Validado:** `curl http://localhost:8456/api/voices` → 200 (lista de vozes), `curl http://localhost:5001/` → 200 (frontend), todos os 5 containers healthy.

### 2026-11-13 — Porta do frontend: 5174 → 15174

**Motivo:** a porta 5174 era usada/reservada por outros projetos (`AFV_STUDIO` e `English Coah - RMV`). A porta `15174` foi verificada livre no host e sem referências em outros projetos.

**O que foi alterado:**
- `frontend/vite.config.ts`: `port: 5174` → `port: 15174` (host, container e dev local)
- `docker-compose.yml`: mapeamento `"5001:5174"` → `"15174:15174"`
- `docker-compose.yml`: `CORS_ORIGINS` `localhost:5001` → `localhost:15174`
- `backend/app/config.py`: default `cors_origins` `localhost:5174` → `localhost:15174`
- `README.md` e `AGENTS.md`: documentação → `15174`
- `.qwen/memory-bank/techContext.md` e `activeContext.md`: portas → `15174`
- Containers `api` e `frontend` recriados com `docker compose up -d --force-recreate api frontend`

**Validado:** Vite em `http://localhost:15174/`; API `8456` preservada; CORS alinhado. Validação humana confirmada.

### 2026-11-18 — Translation provider integration + transcription/task hardening

**Commit:** `8e6003d` (push para `origin/main`).

**O que foi entregue:**
- `GET /api/translate/config` expõe configuração efetiva (model, device, context, idle TTL); tela Provider Settings passa a ler a API.
- Controller de tradução robusto: systemd transient ou nohup, descoberta de caminhos, sem `fuser -k`, template Gemma, `--n-gpu-layers 0`; `docs/TRANSLATION_SETUP.md`.
- Transcrição: ffmpeg/whisper fora do event loop, 422 em áudio inválido/timeout, limpeza de temp garantida.
- Duplicar task de texto reenvia ao worker e reseta `status`/`progress`.
- Frontend: ESLint + deps, tipagem de respostas, erros de task/download, remoção de rAF morto.
- Deps: `edge-tts>=7.3.1,<8`.

**Validação:**
- Backend: 38/38 pytest passaram.
- Frontend: `npm run build` e `npm run lint` limpos.
- App: `docker compose up -d`; `/api/health` ok; `/api/translate/config` 200; `/api/voices` 200; frontend `15174` 200; proxy ok.
- E2E: narração de texto concluiu em ~1s com `audio_url` + `narration_segments`; áudio `audio/mpeg` (21 KB) servido via API e proxy.

### Next planned

- Replace placeholder `assets/workflow-diagram.png` with real diagram
- Add screenshots/GIF demo to release
- Create Notion case study (Problem, Workflow, My Role, Governance, Evidence, Learning, Next Steps)
- Planar refactor: remove `app/services/*` and `app/tasks/*` compatibility layer
- Preserve `erro_implementacao.md` as reusable failure template; clear task-specific incident content after validation
- Keep `botao_clear.md` updated as the canonical guide for this regression pattern
- Keep CI dependency documentation in dedicated reference docs when the failure root cause is environment-specific
