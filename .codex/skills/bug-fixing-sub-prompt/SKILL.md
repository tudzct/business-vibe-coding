---
name: bug-fixing-sub-prompt
description: Repair one evidenced source/build/runtime or Business Rule implementation defect using a bounded sub-prompt, smallest correction and non-test verification while preserving first-pass evidence.
---

# Bug-fixing Sub-prompt

Use only after the initial audit is persisted. For both Full and RQ3, require the first-pass hold, closed `source_generation` metrics and explicit researcher repair authorization with its actual turn ID after source measurement. Never initiate repairs from source generation or from the Measure turn. Read the repair template, contract and [phase/timestamp protocol](../measure-uc-workflow-tokens/references/phase-ledger-schema.md).

1. Select one evidenced defect and fingerprint it; do not repair speculation or add a feature.
2. Create one numbered repair artifact with allowed files, affected BR IDs and permitted non-test checks under `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/repairs/`.
3. Open/capture `repair` immediately before repair work (including planning/required resolution). Apply the smallest correction and rerun relevant permitted checks. Record model and exact turn/segment IDs per repair. End the live segment before each response or researcher wait; resume with a fresh segment in the same open repair bucket. Never finalize token telemetry inside the repair turn.
4. Reassess affected BRs and append the repair without mutating initial results. Any required audit/check/approval performed inside this open repair bucket belongs to repair. When the researcher requests closure, end work and let a subsequent Measure turn close `repair`; no Audit call is needed just to save token/time. A separately requested final audit after closure belongs only to workflow.
5. Stop for the researcher if the correction needs a business/API/schema/ownership/destructive decision, or after the same fingerprint remains for three attempts.

Do not create or run tests.
