---
name: measure-uc-workflow-tokens
description: Close a researcher-selected measurement phase or finalize one UC workflow after completed Codex turns; record observed token breakdowns, captured time, turn and tool counts and update canonical results. Use on explicit researcher measurement requests.
---

# Measure UC Workflow Tokens

Read [selection-schema.md](references/selection-schema.md) before measurement and [phase-ledger-schema.md](references/phase-ledger-schema.md) before recording work. These are measurement phases inside the research method's existing two phases; repair is not a new research phase.

The researcher invokes this skill in a later turn after the work response ends. Never finalize token totals during the work turn. Closing metrics does not approve a prompt, authorize repair, or claim that a blocked phase succeeded.

1. Resolve the exact UC/run and canonical JSON, explicit rollout and current measurement turn ID. Never choose the latest file or largest token turn as evidence. A Draft run identity can exist before prompt generation; it is not source activation.
2. Run `scripts/measure_uc_tokens.py list --session <rollout.jsonl>` read-only. Inspect user messages locally only as needed; retain hashes/IDs, not full messages or absolute profile paths, in public evidence.
3. Prepare a cumulative selection for this UC from its first workflow turn through the last completed work turn. Include all required clarification, dataset resolution, approval and blocked turns. Each selected turn has exactly one phase and a reason. Before a core phase starts, UC-specific work belongs only to an auxiliary workflow phase. While a core phase is open, required work belongs to that phase. Other UCs/unrelated work and common setup outside this UC are excluded with reasons. Do not choose turns based on success or failure.
4. Exclude every measurement/report-only turn, including intermediate phase measurements and this current turn. A measurement turn performs measurement only; do not generate/repair/audit in it. To resume real work, end this turn first.
5. On a phase-close request run `scripts/measure_uc_tokens.py close-phase --run-json <canonical.json> --selection <selection.json> --measurement-turn-id <current-id> --phase <prompt_generation|source_generation|repair>`.
6. After terminal audit/runtime/finalization, run the same command with `finalize-workflow` and no `--phase`. An unperformed repair requires a recorded researcher skip reason; missing telemetry must never become zero. Run final workflow measurement only after the final work turn ends.
7. Print all five token fields, captured seconds, turn/tool counts for the three phases and workflow. The script updates only canonical `metrics`, writes `workflow-metrics.json`, refreshes `phase-ledger.{json,md}` and `workflow-metrics.md`. No Audit call is required to save measurements. If a final experiment Markdown report already exists, refresh its derived view with the renderer after final measurement in this excluded reporting turn.

## Evidence rules

- Adapt the Security reference cumulative `total_token_usage` delta logic, duplicate suppression and reset fallback to `last_token_usage`. Input/output/total must be available and consistent. Missing cached/reasoning counters are `null` with reasons.
- Report only input, cached input, output, reasoning output and total. Cached is a subset of input; reasoning is a subset of output. Do not export fresh-input, cache-write, monetary costs or a core-three-phase sum.
- One turn is indivisible. Phase boundaries determine membership; the AI supplies reasons and explicit exclusions, while the script validates coverage and frozen evidence. This constrains classification but does not prove semantic intent automatically.
- `workflow_turn_count` counts selected researcher-initiated turns; `tool_call_count` counts observable tool invocation records (deduplicate call IDs). Nested calls inside a shell/orchestrator are not automatically separately observable. Telemetry update counts remain diagnostics, never model/API call counts. Model-call count is `null` unless a separately validated exact request schema is implemented.
- Capture time live with the shared helper. Sum non-overlapping captured work intervals for the same selected turns. Do not substitute UI Worked-for, tool duration or whole-chat elapsed time. Missing endpoints yield `null` plus reason; never reconstruct them after completion.
- The full-file session hash changes as the task continues; completed-turn prefix hashes preserve stable evidence across later measurements. Never rewrite a closed phase's selected turns or results.
- Audit owns BR evidence/results. Measure owns `metrics`. Preserve unrelated JSON keys, historical run evidence and the read-only Security reference project.
