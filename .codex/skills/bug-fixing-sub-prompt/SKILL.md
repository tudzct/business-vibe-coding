---
name: bug-fixing-sub-prompt
description: Repair one evidenced source/build/runtime or Business Rule implementation defect using a bounded sub-prompt, smallest correction and non-test verification while preserving first-pass evidence.
---

# Bug-fixing Sub-prompt

Use only after the initial audit is persisted. For RQ3 runs, never initiate sub-prompts automatically; require explicit researcher authorization after the first-pass hold point. Read the repair template and contract.

1. Select one evidenced defect and fingerprint it; do not repair speculation or add a feature.
2. Create one numbered repair artifact with allowed files, affected BR IDs and permitted non-test checks under `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/repairs/`.
3. Capture repair model/time metadata and the exact session/turn ID, apply the smallest correction and rerun only relevant permitted checks. Do not read token totals from the active repair turn.
4. Invoke `audit-generation-metrics` to append the repair and reassess affected BRs. Never mutate initial results.
5. Stop for the researcher if the correction needs a business/API/schema/ownership/destructive decision, or after the same fingerprint remains for three attempts.
6. When all authorized repairs are terminal, end the assistant turn at the repair telemetry-finalization gate. In the next researcher-triggered turn, extract all explicit closed repair turn IDs as one repair-stage aggregate. Attribute tokens to an individual repair only when that repair occupied its own closed turn; otherwise retain per-repair `tokens: null` with a shared-turn note.

Do not create or run tests.
