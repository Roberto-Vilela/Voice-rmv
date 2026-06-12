# Workflow — Voice-rmv

**Start here.** This is the official execution sequence and reference index.

## Pipeline

```
POST /api/narrate/{text,upload,video-url}
  → Task (pending)
  → Celery task.delay()
  → ffmpeg convert
  → faster-whisper transcribe
  → edge-tts synthesize
  → Task (completed)
```

Optionally: translation via local LLM server (POST `/api/translate`).

## Execution sequence (14 steps)

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

## Continuations

| Main file | Detail file |
|-----------|-------------|
| `progress.md` | [`progress_01.md`](./progress_01.md) (até 2026-06-10) |
| `Workflow.md` | [`Workflow_01.md`](./Workflow_01.md) |
| `workflow_rules.md` | [`workflow_rules_01.md`](./workflow_rules_01.md) |
| `designer_rules.md` | [`designer_rules_01.md`](./designer_rules_01.md) |

## Reference index

| File | Content |
|------|---------|
| `progress.md` | Current state and index of validated project history |
| `workflow_rules.md` | Normative rules, mandatory plan format, approval and validation gates |
| `designer_rules.md` | Current visual rules, tokens and UI patterns |
| `techContext.md` | Stack versions, constraints, dependencies |
| `REPORTO_BACKEND_ANALISE_INDEX.md` | Backend API endpoints, services, tests |
| `FRONTEND_ANALYSIS_INDEX.md` | Frontend pages, components, routes, hooks |
