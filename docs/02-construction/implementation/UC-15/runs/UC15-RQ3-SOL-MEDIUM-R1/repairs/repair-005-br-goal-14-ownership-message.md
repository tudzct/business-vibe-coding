---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-15
run_id: UC15-RQ3-SOL-MEDIUM-R1
repair_index: 5
status: Completed
category: business_rule
trigger: business_rule_review
fingerprint: br-goal-14-ownership-message-mismatch
affected_br_ids: [BR-GOAL-14]
---

# Repair 5 — Preserve ownership failure semantics

## Evidence

The JWT-protected update path compares the persisted owner with the authenticated user and returns HTTP 403, but its message is `Forbidden resource` instead of the frozen exact Vietnamese message.

## Required correction

Replace only the ownership rejection message while retaining JWT-derived identity and backend ownership enforcement.

## Scope

- Allowed file: backend goal service.
- Permitted non-test verification: targeted lint and backend production build.
- Prohibited: unrelated behavior, schema changes, and all test creation/execution.

## Completion

- Status: Completed
- Started: 2026-09-03T13:31:55.3891685Z
- Ended: 2026-09-03T13:32:32.5835252Z
- Duration: 37.194 seconds
- Model: `gpt-5.6-sol`, medium reasoning
- Source revision before: `sha256:271aabb07369a10e645c9694cb7f4a9a147b2df27424676147989f53a7bfce29`
- Source revision after: `sha256:72c2f8911ed2db986521ed7f951d77d8a96da9927fdc246a345d3998883a330c`
- Verification: targeted backend ESLint and Nest production build passed.
- Result: BR-GOAL-14 is met by source and build evidence.
- Tests: none created or run.
