---
name: bug-fixing-sub-prompt
description: Repair one evidenced source/build/runtime or Business Rule implementation defect using a bounded sub-prompt, smallest correction and non-test verification while preserving first-pass evidence.
---

# Bug-fixing Sub-prompt

Use only after the initial audit is persisted. For RQ3 runs, never initiate sub-prompts automatically; require explicit researcher authorization after the first-pass hold point. Read the repair template and contract.

1. Select one evidenced defect and fingerprint it; do not repair speculation or add a feature.
2. Create one numbered repair artifact with allowed files, affected BR IDs and permitted non-test checks.
3. Capture repair model/time/token metadata, apply the smallest correction and rerun only relevant permitted checks.
4. Invoke `audit-generation-metrics` to append the repair and reassess affected BRs. Never mutate initial results.
5. Stop for the researcher if the correction needs a business/API/schema/ownership/destructive decision, or after the same fingerprint remains for three attempts.

Do not create or run tests.
