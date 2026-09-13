---
name: bug-fixing-sub-prompt
description: Repair one evidenced source/build/runtime or Business Rule implementation defect using a bounded sub-prompt, smallest correction and non-test verification while preserving first-pass evidence.
---

# Bug-fixing Sub-prompt

Use only after the initial BR/flow audit is persisted. Require closed Source Gate telemetry and explicit Repair Decision Gate authorization with its actual turn ID. Never initiate repair from source generation or a telemetry gate-close turn.

1. Select one evidenced defect and fingerprint it; do not repair speculation or add a feature.
2. Create one numbered repair artifact with allowed files, affected BR IDs and permitted non-test checks under `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/repairs/`.
3. After planning, required resolution and authorization, capture `repair` START immediately before executing the correction. Pass the unique canonical `--repair-id` on both endpoints. Apply the smallest correction and collect permitted verification evidence, then immediately capture END before the repair audit is appended. Record model and exact turn/segment IDs per repair. End before any blocker resolution, researcher wait or response; resume execution with a fresh segment for the same repair ID. Never finalize tokens in this turn.
4. After every correction, automatically invoke `audit-generation-metrics` in the same repair work turn to reassess affected BRs/flows and check integration using permitted typecheck/lint/build and bounded Docker runtime observation. Before the repair phase ends, assess every frozen BR and flow on the final source, persist final results and freeze `business_rules.source_revision`. Use fresh final-stage flow evidence under the configured rubric; preserve immutable initial results. Complete this work before showing Repair Gate, never defer it to another researcher-requested audit turn. The repair execution timer ends before audit appending; integrated audit does not extend execution seconds. Tokens follow the turn's actual primary label.
5. Report successful repair only when the correction is verified. Persist unresolved defects, unknown behavior and runtime blockers honestly; use `blocked`, `stopped` or `repair_declined` when appropriate, never fabricate `met` or `correct`. Persist terminal `run_status` when no further authorized correction remains. After a later `close-phase --phase repair`, allow `finalize-workflow` immediately in the next measurement turn; no separate final-audit confirmation is required.
6. Stop for the researcher if the correction needs a business/API/schema/ownership/destructive decision, or after the same fingerprint remains for three attempts.

Do not create or run tests.
