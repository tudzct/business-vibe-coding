---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-12
run_id: RQ3-SOL-MEDIUM-R1-UC12
repair_id: RQ3-SOL-MEDIUM-R1-UC12-REPAIR-005
repair_index: 5
affected_br_ids: []
category: technical
trigger: runtime
fingerprint: backend-startup-auth-module-unknown-jwt-guard-export
status: complete
started_at: 2026-09-04T20:27:12.844+07:00
source_revision_before: sha256:fa54c8ab15ca5eb8b9501b8bb12092779b26d554e3e0e4094f209be3ff930375
ended_at: 2026-09-04T20:29:57.207+07:00
duration_seconds: 164.363
source_revision_after: sha256:6fca554a282c38c8f3a3d6492f2dfe59a33df3fd22d60c41748fda92e3717736
---

# Repair 5 — Register the exported JWT guard provider

## Evidence

Fresh Compose startup repeatedly produced Nest `UnknownExportException`: `AuthModule` exports `JwtAuthGuard`, but `finalsource/be/src/modules/auth/auth.module.ts:29-30` does not include the guard in `providers`.

## Required correction

Add the existing `JwtAuthGuard` class to `AuthModule.providers`. Preserve authentication logic, exports, endpoint behavior, dependencies, and all unrelated module configuration.

## Scope

- Allowed files: `finalsource/be/src/modules/auth/auth.module.ts`
- Affected BRs: none; this is a technical runtime repair
- Permitted non-test verification: backend TypeScript/Nest production build, Compose startup/health, unauthenticated endpoint observation, and source inspection
- Prohibited: authentication redesign, new features, speculative refactors, schema/public-API/ownership decisions, dependency changes, and all test creation/execution.

## Completion

- Changed `finalsource/be/src/modules/auth/auth.module.ts` only.
- Registered the existing `JwtAuthGuard` in `AuthModule.providers`; the original `UnknownExportException` no longer occurs.
- Fresh Docker backend and frontend production builds: PASS.
- Compose startup advanced to the known `DEP-20260831-001` database-baseline blocker: the persistent database lacks the `Accounts` table required by a previously approved migration. No schema or database mutation was attempted.
- Model: `gpt-5.6-sol`, medium/standard, same as the Confirmed generation assignment.
- Tokens: per-repair attribution is unavailable because all authorized repairs share one Codex turn; aggregate repair-turn telemetry is recorded in the canonical run JSON.
- First-pass evidence remains unchanged.
