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

### Test results (current)

- **Backend**: 35/35 pytest passed (0.12s)
- **Frontend**: `npm run build` (tsc + vite) clean, 163 modules, 404.98 KB gzip: 124.99 KB

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
