---
name: bug-fixing-sub-prompt
description: Repair one evidenced source/build/runtime or Business Rule implementation defect using a bounded sub-prompt, smallest correction and non-test verification while preserving first-pass evidence.
---

# Bug-fixing Sub-prompt

Use only after the initial audit is persisted. For both Full and RQ3, require the first-pass hold, closed `source_generation` metrics and explicit researcher repair authorization with its actual turn ID after source measurement. Never initiate repairs from source generation or from the Measure turn. Read the repair template, contract and [phase/timestamp protocol](../measure-uc-workflow-tokens/references/phase-ledger-schema.md).

1. Select one evidenced defect and fingerprint it; do not repair speculation or add a feature.
2. Create one numbered repair artifact with allowed files, affected BR IDs and permitted non-test checks under `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/repairs/`.
3. After planning, required resolution and authorization, capture `repair` START immediately before executing the correction. Pass the unique canonical `--repair-id` on both endpoints. Apply the smallest correction and collect permitted verification evidence, then immediately capture END before the repair audit is appended. Record model and exact turn/segment IDs per repair. End before any blocker resolution, researcher wait or response; resume execution with a fresh segment for the same repair ID. Never finalize tokens in this turn.
4. Reassess affected BRs and append the repair without mutating initial results. The repair timer has already ended; audit appending and separate audit/runtime/approval/resolution work are outside execution time. Tokens follow actual primary work under the shared selection-schema.md: a correction with checks is one repair turn; an approval-only, audit-only, dataset-only or runtime-only turn is auxiliary and contributes tokens only to workflow. Failed correction attempts still count as repair; do not classify by outcome. When the researcher requests closure, end work and let a subsequent Measure turn close `repair`; no Audit call is needed just to save token/time. A separately requested final audit after closure contributes tokens only to workflow, not execution seconds.
5. Stop for the researcher if the correction needs a business/API/schema/ownership/destructive decision, or after the same fingerprint remains for three attempts.

Do not create or run tests.
