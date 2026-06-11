# AGENTS.md — Voice-rmv

## Dev

```bash
docker compose up -d                        # postgres, redis, api:8456, celery_worker, frontend:5173
docker compose up -d --build

# Local backend
pip install -r backend/requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8456 --reload

# Local frontend
cd frontend && npm install && npm run dev   # proxies /api → localhost:8456
```

### Tests

```bash
pytest backend/tests -v --cov=app           # mocked DB/TTS/transcriber (no services needed)
cd frontend && npm run build                # tsc -b && vite build (type-check + bundle)
cd frontend && npm run lint                 # ESLint (not in CI)
```

CI: Python 3.14 + real PostgreSQL/Redis, `pytest` + `httpx` + `pytest-asyncio` installed explicitly.  
CI frontend: Node 22, `npm ci && npm run build`.

## Architecture

- **backend/** — FastAPI (async), SQLAlchemy 2.0, Celery/Redis, edge-tts, faster-whisper, yt-dlp, ffmpeg
- **frontend/** — React 19 + Vite + TS strict + Tailwind v4 (`@tailwindcss/vite`) + TanStack Query

### Pipeline

```
POST /api/narrate/{text,upload,video-url} → Task (pending) → Celery task.delay()
→ ffmpeg convert → faster-whisper transcribe → edge-tts synthesize → Task (completed)
```

### Key files

| Area | File |
|------|------|
| API app | `backend/app/main.py` |
| Config | `backend/app/config.py` (pydantic-settings) |
| DB | `backend/app/database.py` (async + sync engine, `update_task()`, `run_async()`) |
| Celery | `backend/app/tasks/celery_app.py` — uses `include=["app.tasks.narration_tasks"]` |
| Tasks | `backend/app/tasks/narration_tasks.py` (video URL, audio file, video file) |
| Routes | `backend/app/routers/narrate.py`, `history.py` |
| Frontend | `frontend/src/main.tsx`, `App.tsx` (BrowserRouter, 7 pages) |
| API client | `frontend/src/api/client.ts` |

### Config

| Env var | Default | Notes |
|---------|---------|-------|
| `DATABASE_URL` | `sqlite+aiosqlite:///./dev.db` | Prod: `postgresql+asyncpg://...` |
| `REDIS_URL` | `redis://localhost:6379/0` | Required for Celery |
| `OUTPUT_DIR` | `./output` | Narrations + transcriptions |
| `TEMP_DIR` | `./temp` | Cleared after tasks |

Default voice: `en-US-AriaNeural`. PT-BR: `pt-BR-FranciscaNeural`, `pt-BR-AntonioNeural`.

### Celery

`celery_app.py` must include `"app.tasks.narration_tasks"` or worker drops messages ("Received unregistered task"). Rebuild containers after changing tasks. Tasks use `run_async()` (`asyncio.run()`) to call async services.

## Gotchas

- `sync_engine` in `database.py` rewrites `+asyncpg` → `+psycopg2` to avoid MissingGreenlet.
- `update_task()` uses sync engine if no running event loop, async engine if in async context.
- Tests in `backend/tests/conftest.py` mock DB/TTS/transcriber via dependency overrides — no real services needed.
- Pytest config: `asyncio_mode = "auto"` (in `backend/pyproject.toml`).
- Root `package.json` (tailwindcss v3) is stale — real frontend config is `frontend/package.json` (tailwindcss v4).
- Docker volumes: `shared_output` and `shared_temp` between `api` and `celery_worker`.

## Memory bank (.qwen/memory-bank/)

Project knowledge base. Always consult before starting work.

| File | Content |
|------|---------|
| `Workflow.md` | **Start here** — official execution sequence and reference index |
| `workflow_rules.md` | Normative rules, mandatory plan format, approval and validation gates |
| `designer_rules.md` | Current visual rules, tokens and UI patterns |
| `progress.md` | Current state and index of validated project history |
| `REPORTO_BACKEND_ANALISE_INDEX.md` | Backend API endpoints, services, tests |
| `FRONTEND_ANALYSIS_INDEX.md` | Frontend pages, components, routes, hooks |
| `techContext.md` | Stack versions, constraints, dependencies |

Large documents use numbered continuations such as `progress_01.md`. Read a
continuation only when its main file points to it for the current task.

## Workflow (rules + execution)

Follow these 14 steps in order on every task. The workflow is defined in
`workflow_rules.md` (normative rules) and `Workflow.md` (execution sequence).

### Phase 1 — Analysis & planning (steps 1-6)

1. **Entender input** — read request carefully, identify context/objective
2. **Analisar código** — read relevant files, directory structure, existing patterns
3. **Ver viabilidade** — assess complexity, constraints, dependencies
4. **Consultar memory bank** — read `Workflow.md`, `workflow_rules.md`, `progress.md`, then only relevant references
5. **Montar plano** — include every mandatory field defined in `workflow_rules.md`
6. **Plano aprovado** — present plan to user and wait for explicit confirmation (`"OK"` or `"SIM"`) before proceeding

### Phase 2 — Execution (step 7)

7. **Executar tarefa** — implement step by step, communicate progress at milestones, stay in scope

### Phase 3 — Human validation (step 8 — CRITICAL)

8. **Testes principais — listar para humano** — never run automated tests automatically.
   Instead: list manual tests (URLs, inputs, expectations) and test commands for the user.
   **STOP and wait for user validation** before continuing.

### Phase 4 — Wrap-up (steps 9-14)

9. **Resumir com detalhes** — explain what was done, decisions, learnings
10. **Concluir** — list modified/created files, confirm scope delivered
11. **Refinar** — polish code, remove console.log, optimize Tailwind classes
12. **Feedback para memory** — record validated work in `progress.md`
13. **Atualizar workflow** — update workflow files only when the process actually changes
14. **Atualizar índices** — review main files and numbered continuations

### Golden rules

- ✅ Always list tests for human validation after implementation (step 8)
- ✅ Wait for explicit user confirmation before proceeding
- ✅ Preserve history through numbered continuation files
- ❌ **Never** run automated tests automatically (only if user asks)
- ❌ **Never** continue past step 8 without human validation
- ❌ **Never** assume it works — human feedback is critical

## Existing instruction files

- `.opencode/projeto.md` — project plan, API docs, directory tree
- `.opencode/backend-api.md` — detailed API spec with curl examples
- `opencode/summary.md` — historical fix notes (MissingGreenlet, port conflicts)
