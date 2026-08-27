---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-01
run_id: UC01-SOL-MEDIUM-R1
repair_index: 3
affected_br_ids: [BR-REG-03, BR-REG-08, BR-REG-09, BR-REG-10, BR-REG-11]
---

# Repair 3 — MySQL AUTO_INCREMENT key ordering

## Evidence

Fresh Compose runtime failed migration with MySQL `ER_WRONG_AUTO_KEY` because `users.id` was created as `AUTO_INCREMENT` before a later statement added the primary key.

## Required correction

Declare `users.id` as primary in the table-creation operation and remove the later primary-key ALTER, preserving the approved column and primary-key semantics.

## Scope

- Allowed files: `finalsource/be/src/database/migrations/20260827113000-CreateUsersTable.ts`
- Affected BRs: BR-REG-03, BR-REG-08, BR-REG-09, BR-REG-10, BR-REG-11
- Permitted non-test verification: Docker Compose rebuild, service health and bounded registration observation
- Prohibited: new features, speculative refactors, schema/public-API/ownership changes, destructive volume reset, and all test creation/execution.

## Completion

Record changed file, runtime evidence, automatic time/tokens and reassessment without overwriting first-pass evidence.
