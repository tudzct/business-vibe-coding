---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-15
run_id: UC15-RQ3-SOL-MEDIUM-R1
repair_index: 6
status: Completed
category: business_rule
trigger: business_rule_review
fingerprint: br-goal-17-atomicity-concurrency-failure-semantics
affected_br_ids: [BR-GOAL-17]
---

# Repair 6 — Make goal adjustment atomic and concurrency-safe

## Evidence

The update path reads and saves outside a transaction and without a database lock. Unexpected persistence failures also return a message different from the frozen requirement.

## Required correction

Execute the already validated update in a SERIALIZABLE transaction, acquire a pessimistic write lock before rule checks and mutation, preserve HTTP exceptions, and map unexpected persistence failures to the exact required HTTP 500 message.

## Scope

- Allowed file: backend goal service.
- Permitted non-test verification: targeted lint, backend production build, and bounded Docker runtime observation.
- Prohibited: unrelated behavior, schema changes, and all test creation/execution.

## Completion

- Status: Completed
- Started: 2026-09-03T13:32:32.5835252Z
- Ended: 2026-09-03T13:33:31.4952673Z
- Duration: 58.912 seconds
- Model: `gpt-5.6-sol`, medium reasoning
- Source revision before: `sha256:72c2f8911ed2db986521ed7f951d77d8a96da9927fdc246a345d3998883a330c`
- Source revision after: `sha256:d28db3ad68b644ed0f1adb5865bec1eb179b3f23532e67b96aa464e52ffa8015`
- Verification: targeted backend ESLint, Nest production build, and frontend production build passed; Docker verification is recorded in the run evidence.
- Result: BR-GOAL-17 is met by source and build evidence.
- Tests: none created or run.
