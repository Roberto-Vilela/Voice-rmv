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

### Next planned

- Replace placeholder `assets/workflow-diagram.png` with real diagram
- Add screenshots/GIF demo to release
- Create Notion case study (Problem, Workflow, My Role, Governance, Evidence, Learning, Next Steps)
- Planar refactor: remove `app/services/*` and `app/tasks/*` compatibility layer
- Preserve `erro_implementacao.md` as reusable failure template; clear task-specific incident content after validation
- Keep `botao_clear.md` updated as the canonical guide for this regression pattern
- Keep CI dependency documentation in dedicated reference docs when the failure root cause is environment-specific
