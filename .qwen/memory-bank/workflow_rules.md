# Workflow Rules — Voice-rmv

Normative rules for all interactions with this project.

## 1. Plan format (mandatory fields)

Every plan presented to the user (step 5) MUST include:

| Field | Description |
|-------|-------------|
| **Objective** | What the task achieves in one sentence |
| **Scope** | Files to modify/create, boundaries of the change |
| **Strategy** | High-level approach (not implementation details) |
| **Risks** | Potential breakage, edge cases, known pitfalls |
| **Validation** | How to verify the result (tests, manual checks) |
| **Steps** | Ordered execution plan (numbered) |

## 2. Approval gate (step 6)

- User must explicitly confirm with `"OK"` or `"SIM"`
- No implicit approval — silence is NOT consent
- If the user asks for changes, revise the plan and present again

## 3. Human validation gate (step 8)

- **Never** run automated tests without user request
- Always list manual test cases: URLs, inputs, expected outputs
- Always list the exact test commands to run
- Wait for user confirmation before proceeding past step 8

## 4. Scope discipline

- Stay strictly within the agreed plan
- If new needs emerge during execution, present them as a separate follow-up plan
- Do not mix unrelated changes in a single execution

## 5. History preservation

- Use numbered continuation files for large documents (`progress_01.md`, `progress_02.md`, etc.)
- Never overwrite validated history — append or branch
- Record all validated work in `progress.md` after human confirmation

## 6. Documentation as system memory

- `progress.md` MUST stay concise and act as the validated index of work completed.
- Every validated bug or implementation pattern SHOULD have a dedicated reference document when the fix is non-trivial or likely to recur.
- The dedicated document MUST explain the problem, root cause, failed attempts, final fix, and the checks a junior developer should perform if it returns.
- `erro_implementacao.md` MUST remain as a reusable failure template for future unresolved attempts.
- Do not force detailed incident history into `progress.md`; link to the dedicated reference document instead.
- When a dedicated reference document exists, `progress.md` should summarize the outcome and point to that document.
