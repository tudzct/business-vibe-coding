---
name: bug-fixing-sub-prompt
description: Repair one evidenced source/build/runtime or Business Rule implementation defect using a bounded sub-prompt, smallest correction and non-test verification while preserving first-pass evidence.
---

# Bug-fixing Sub-prompt

Read [FILE-DRIVEN-WORKFLOW.md](../../../docs/00-context/workflow/FILE-DRIVEN-WORKFLOW.md). Invoking `$bug-fixing-sub-prompt` authorizes repair. Resolve exact UC/run with source telemetry closed, saved initial BR/flow audit, conclusive accepted verdicts for every frozen flow and an evidenced defect. Run `advance-experiment-gate/scripts/record_command.py --run-json <canonical.json> --action repair --turn-id <actual-id>` (dry-run first), then begin correction in this same work turn without another confirmation. Retain an existing historical authorization if already recorded; never reopen terminal runs.

Saving either researcher or LLM follow-up results alone does not authorize repair. Acknowledge saved results and wait for this subsequent command. Unknown accepted flows block new repair authorization; accept attributed researcher verdicts without requiring a second LLM runtime proof. Activation is optional; concrete source/schema/runtime prerequisites remain.

1. Select one evidenced defect and fingerprint it; do not repair speculation or add a feature.
2. Create one numbered repair artifact with allowed files, affected BR IDs and permitted non-test checks under `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/repairs/`.
3. After planning, required resolution and authorization, capture `repair` START immediately before executing the correction. Pass the unique canonical `--repair-id` on both endpoints. Apply the smallest correction and collect permitted verification evidence, then immediately capture END before the repair audit is appended. Record model and exact turn/segment IDs per repair. End before any blocker resolution, researcher wait or response; resume execution with a fresh segment for the same repair ID. Never finalize tokens in this turn.
4. After every correction, automatically invoke `audit-generation-metrics` in the same repair work turn to reassess affected BRs/flows and check integration using permitted typecheck/lint/build and bounded Docker runtime observation. Before the repair phase ends, assess every frozen BR and flow on the final source, persist final results and freeze `business_rules.source_revision`. Use fresh final-stage flow evidence under the configured rubric; preserve immutable initial results. Complete this work before returning the next close command; never defer it to another audit turn. The repair execution timer ends before audit appending; integrated audit does not extend execution seconds. Tokens follow the turn's actual primary label.
5. Report successful repair only when the correction is verified. Persist unresolved defects, unknown behavior and runtime blockers honestly; use `blocked`, `stopped` or `repair_declined` when appropriate, never fabricate `met` or `correct`. Persist terminal `run_status` when no further authorized correction remains. After a later `close-phase --phase repair`, allow `finalize-workflow` immediately in the next measurement turn; no separate final-audit confirmation is required.
6. Stop for the researcher if the correction needs a business/API/schema/ownership/destructive decision, or after the same fingerprint remains for three attempts.

Do not create or run tests.
