---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-01
run_id: RQ3-SOL-MEDIUM-R1-UC01
repair_index: 7
repair_id: RQ3-SOL-MEDIUM-R1-UC01-REPAIR-007
category: technical
trigger: runtime
fingerprint: migration-target-users-table-absent
affected_br_ids: [BR-REG-03, BR-REG-09, BR-REG-10, BR-REG-11]
status: Complete
started_at: 2026-08-31T10:22:40.297+07:00
started_epoch_ms: 1788146560297
source_revision_before: sha256:ff89b5889de3562d0b181b273b55d580b595593b068c220afd13df9307839ea9
model_id: gpt-5.6-sol
reasoning_effort: medium
---

# Repair 007 — Align restored User mappings with the approved physical table

## Evidence

- Rebuilt frontend and backend production images compile successfully.
- Backend startup repeatedly fails in `MakeUsersUsernameNullable20260831095333.up` with `TypeORMError: Table "Users" does not exist`.
- Read-only metadata inspection confirms the approved physical table is lowercase `users`, with `id`, `full_name`, `email`, `username`, `password_hash` and `total_balance`.
- Existing incident `DEP-20260829-005` records this same case-sensitive restored-source mismatch and its non-schema resolution.
- Backend remains unhealthy and the dependent frontend is not started, so rebuilt `/register` and registration runtime observation cannot proceed.
- The approved schema contract permits making the existing username nullable; no table creation is needed.

## Required correction

Align the entity and migration with the approved lowercase `users` table and its existing column names/types. Apply only the already-approved nullable-username alteration. Rebuild Compose and observe health, UI reachability and bounded registration behavior.

## Scope

- Allowed files: `finalsource/be/src/modules/user/user.entity.ts`, `finalsource/be/src/database/migrations/20260831095333-make-users-username-nullable.ts`, `docs/02-construction/implementation/UC-01/schema.json`
- Affected BRs: `BR-REG-03`, `BR-REG-09`, `BR-REG-10`, `BR-REG-11`
- Permitted non-test verification: backend build, Docker Compose rebuild/health, bounded API/UI runtime observation
- Prohibited: database reset/deletion, unrelated table creation, public API changes and all test creation/execution

## Completion

- Changed files: `finalsource/be/src/modules/user/user.entity.ts`, `finalsource/be/src/database/migrations/20260831095333-make-users-username-nullable.ts`, `docs/02-construction/implementation/UC-01/schema.json`
- Verification: current frontend/backend production images built; database, backend and frontend are healthy; `/api/health` and `/register` return 200; registration returns 201 with token presence and only `email,fullName,id`; duplicate returns 409; invalid input returns 400 with the normalized error-envelope fields.
- Database evidence: `users.username` is nullable; one bounded created user has NULL username and a bcrypt cost-10 hash. No sensitive values were retained.
- Ended at: `2026-08-31T10:30:22.330+07:00` (`1788147022331` epoch ms); duration `462.034` seconds.
- Source revision after: `sha256:6e59c386050dd601c036d3e4e50046dd203332a29efd235a5fc2f4cc311d04f7`
- Token telemetry: unavailable per repair because repairs 002–007 share Codex session turn 5; the shared turn is retained in the canonical run.
- Reassessment: `BR-REG-03=met`, `BR-REG-09=met`, `BR-REG-10=met`, `BR-REG-11=met`.
