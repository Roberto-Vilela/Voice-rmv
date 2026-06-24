# Botao Clear - Remove Source Regression

## Summary

The `Clear` button in `frontend/src/pages/EditorPage.tsx` had two different goals that were easy to mix up:

1. Remove the source from the Editor so the transcript does not come back after route navigation or refresh.
2. Keep the task entry usable in the Library so it does not lose its identity and fall back to `Untitled`.

The first implementation tried to solve the problem by clearing source fields directly in the task record. That made the Editor look empty, but it also removed the metadata that the Library uses to name the item. The result was a broken task entry.

The final fix separates those concerns:

- The task keeps its identifying metadata.
- The Editor stops rebuilding segments when the task has `extra_data.source_removed = true`.
- The Library still shows the original task identity.

This file documents the full reasoning so another model or a junior developer can repeat the fix if the bug returns.
It also serves as the pattern for how this project should document non-trivial fixes: short validated summary in `progress.md`, detailed guide in a dedicated reference file, and a reusable failure template in `erro_implementacao.md`.

---

## Problem

After clicking `Clear` in the Editor:

- The editor content disappeared on the current page.
- After navigating away and coming back, the transcript could reappear.
- After the first attempt to fix it, the Library entry sometimes became `Untitled`.

That meant the app had two separate problems:

- A persistence/rebuild problem in the Editor.
- An identity problem in the Library.

---

## Root Cause

The Editor rebuilds content from several fallbacks in `buildSegments()`:

1. `extra_data.narration_segments`
2. `extra_data.editor_segments`
3. `extra_data.transcription_segments`
4. `task.transcription`
5. `draftText`
6. `task.input_text`

Earlier attempts only cleared some of those sources.

The biggest mistake was clearing task identity fields such as:

- `input_file`
- `input_url`
- `input_text`
- `transcription`
- `audio_path`

That removed the data needed by the Library to display a valid name.

---

## Failed Attempts

### Attempt 1

Clear `transcription_segments` and related arrays in `extra_data`.

Why it failed:

- It removed only part of the data used by the Editor.
- The Editor could still rebuild from other fields.

### Attempt 2

Add `flag_modified` in the PATCH handler.

Why it failed:

- The JSON update was not the real issue.
- The backend was already persisting the update.
- The bug was caused by incomplete cleanup and frontend fallback behavior.

### Attempt 3

Clear `input_text` too.

Why it was risky:

- It fixed one fallback path.
- But it still treated identity fields like disposable source data.
- That caused the Library to lose the title and show `Untitled`.

---

## Final Fix

The final fix uses a dedicated flag:

- `extra_data.source_removed = true`

That flag means:

- The Editor should not rebuild the transcript from fallback data.
- The Library entry keeps its identity metadata.
- The task is visually cleared without destroying the record.

### Files changed

- `frontend/src/pages/EditorPage.tsx`
- `frontend/src/api/client.ts`
- `frontend/src/types.ts`

### Important behavior

- The Clear action updates the task cache with the returned PATCH result.
- The task remains present in the Library.
- `buildSegments()` returns an empty list when `source_removed` is true.
- The waveform player is hidden in the Editor after removal.

---

## What a junior developer should check

If this bug comes back, inspect these points in order:

1. Is the task marked with `extra_data.source_removed = true`?
2. Does `buildSegments()` return early when that flag exists?
3. Is the Library still reading task identity from `display_name`, `input_file`, `input_text`, or `input_url`?
4. Is the PATCH response being written back into the React Query cache with `setQueryData`?
5. Are we avoiding deletion of identity fields that the Library still needs?

---

## Safe Rule

When the goal is "clear the Editor", do not delete the task identity.

Use a state flag for the Editor behavior and keep the Library metadata intact.

---

## Human Validation

Confirmed by the user:

- The Editor clears correctly.
- The content does not come back after navigation or refresh.
- The Library entry does not turn into `Untitled`.

---

## Notes for Future Reuse

If this bug appears again in another model session:

- Start from this file.
- Do not reintroduce field clearing that breaks Library identity.
- Prefer a state flag to control Editor rendering behavior.
- Update `progress.md` with a short summary and link back to this guide.
