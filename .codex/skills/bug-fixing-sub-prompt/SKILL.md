---
name: bug-fixing-sub-prompt
description: Repair one evidenced source/build/runtime or Business Rule implementation defect using a bounded sub-prompt, smallest correction and non-test verification while preserving first-pass evidence.
---

# Bug-fixing Sub-prompt

Use only after the initial BR/flow audit is persisted. Require closed Source Gate telemetry and explicit Repair Decision Gate authorization with its actual turn ID. Never initiate repair from source generation or a telemetry gate-close turn.

1. Select one evidenced defect and fingerprint it; do not repair speculation or add a feature.
2. Create one numbered repair artifact with allowed files, affected BR IDs and permitted non-test checks under `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/repairs/`.
3. After planning, required resolution and authorization, capture `repair` START immediately before executing the correction. Pass the unique canonical `--repair-id` on both endpoints. Apply the smallest correction and collect permitted verification evidence, then immediately capture END before the repair audit is appended. Record model and exact turn/segment IDs per repair. End before any blocker resolution, researcher wait or response; resume execution with a fresh segment for the same repair ID. Never finalize tokens in this turn.
4. Reassess affected BRs/flows without mutating initial results. End repair work and show Repair Gate; its later confirmation closes telemetry internally. Final Audit Gate is separate and contributes no execution seconds.
5. Stop for the researcher if the correction needs a business/API/schema/ownership/destructive decision, or after the same fingerprint remains for three attempts.

Do not create or run tests.
