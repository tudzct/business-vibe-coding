---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-15
run_id: UC15-RQ3-SOL-MEDIUM-R1
repair_index: 4
status: Completed
category: business_rule
trigger: business_rule_review
fingerprint: br-goal-13-existence-active-period-incomplete
affected_br_ids: [BR-GOAL-13]
---

# Repair 4 — Enforce goal existence and active period

## Evidence

The update service rejects an unknown goal with HTTP 404 but uses the wrong message, and it does not reject an expired goal.

## Required correction

Preserve the frozen HTTP statuses and exact Vietnamese messages for missing and expired goals. Compare the stored end date with the current UTC calendar date before mutation.

## Scope

- Allowed file: backend goal service.
- Permitted non-test verification: targeted lint and backend production build.
- Prohibited: unrelated rule changes, schema changes, and all test creation/execution.

## Completion

- Status: Completed
- Started: 2026-09-03T13:31:06.3241854Z
- Ended: 2026-09-03T13:31:55.3891685Z
- Duration: 49.065 seconds
- Model: `gpt-5.6-sol`, medium reasoning
- Source revision before: `sha256:b11113d82e0fa82e0c2b24039a742e538fcf056aaa6a16fb8666132cba6fb48e`
- Source revision after: `sha256:271aabb07369a10e645c9694cb7f4a9a147b2df27424676147989f53a7bfce29`
- Verification: targeted backend ESLint and Nest production build passed.
- Result: BR-GOAL-13 is met by source and build evidence.
- Tests: none created or run.
