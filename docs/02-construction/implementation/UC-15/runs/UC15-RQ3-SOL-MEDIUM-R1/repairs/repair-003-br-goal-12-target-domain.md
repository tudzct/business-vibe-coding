---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-15
run_id: UC15-RQ3-SOL-MEDIUM-R1
repair_index: 3
status: Completed
category: business_rule
trigger: business_rule_review
fingerprint: br-goal-12-target-domain-incomplete
affected_br_ids: [BR-GOAL-12]
---

# Repair 3 — Enforce the target amount domain

## Evidence

The update DTO and adjustment modal accept any finite positive value. They do not enforce the frozen 100,000–1,000,000,000 VND range, 10,000 VND increment, or requirement that the new target differ from the stored target.

## Required correction

Enforce the complete target domain at the authoritative backend boundary and mirror it in preliminary modal validation. Reject an unchanged stored value before persistence.

## Scope

- Allowed files: backend update DTO and goal service; frontend AdjustGoalModal.
- Permitted non-test verification: targeted lint and production builds.
- Prohibited: unrelated rule changes, schema changes, and all test creation/execution.

## Completion

- Status: Completed
- Started: 2026-09-03T13:30:10.1877981Z
- Ended: 2026-09-03T13:31:06.3241854Z
- Duration: 56.136 seconds
- Model: `gpt-5.6-sol`, medium reasoning
- Source revision before: `sha256:8ef2a10277348449ae27eccb2299b3b03f2cc3fbb36767e0b215974ef2045b48`
- Source revision after: `sha256:b11113d82e0fa82e0c2b24039a742e538fcf056aaa6a16fb8666132cba6fb48e`
- Verification: targeted backend/frontend ESLint and both production builds passed.
- Result: BR-GOAL-12 is met by source and build evidence.
- Tests: none created or run.
