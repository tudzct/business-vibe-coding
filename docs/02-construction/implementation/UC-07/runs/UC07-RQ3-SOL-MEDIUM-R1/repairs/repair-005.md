---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-07
run_id: UC07-RQ3-SOL-MEDIUM-R1
repair_index: 5
repair_id: UC07-RQ3-SOL-MEDIUM-R1-REPAIR-005
category: technical
trigger: runtime
fingerprint: backend-startup-fresh-database-missing-core-tables-and-foreign-key-signedness
affected_br_ids: []
status: implementation_complete_runtime_blocked
requested_model_id: gpt-5.6-sol
requested_reasoning_effort: medium
effective_model_id: gpt-5.6-sol
started_at: 2026-09-05T09:01:54.7410698Z
started_epoch_ms: 1788598914741
source_revision_before: sha256:00c6561a49a798dbc57f2e973dc5e0cb095d0b2c07c455b03cbcbf87f1ad5b4f
schema_proposal: docs/02-construction/implementation/UC-07/schema.json
schema_approved_at: 2026-09-05T09:21:31.3449676Z
ended_at: 2026-09-05T09:27:19.9777330Z
duration_seconds: 348.633
source_revision_after: sha256:ab860acde6edda0ac92e1a3f9c5aa87069ecfb43a476b8c29060da46b349a6e7
---

# Repair 5 — Fresh-database TypeORM initialization

## Evidence

The researcher supplied two bounded backend startup errors from a fresh MySQL volume:

1. `MakeTransactionsReceiptIdNullable20260901101931` fails because `transactions` does not exist.
2. MySQL rejects `FK_3e8568527418a0d71b12031870c` because `Goals.category_id` and `categories.category_id` have incompatible integer signedness.

Source inspection confirms `migrationsRun: true` with `synchronize: false`, no core-table initialization migration, and signed/unsigned foreign-key drift in the registered entity metadata.

## Required correction

After approval of `docs/02-construction/implementation/UC-07/schema.json`, add the smallest complete initial migration for the already-registered core entities, align foreign-key signedness and receipt persistence metadata, and preserve the existing approved later migrations.

## Scope

- Allowed files: `docs/02-construction/implementation/UC-07/schema.json`, one new core initialization migration, affected Account/Bill/Category/Transaction entity files, and only the receipt DTO mapping lines required for type compatibility
- Affected BRs: none; technical Docker/database startup repair
- Permitted non-test verification: backend targeted/repository ESLint, backend production build, Docker Compose configuration/build/start, bounded backend/database logs, container health, `/api/health` reachability, and read-only information-schema inspection
- Prohibited: tests, seed data, synchronize=true, volume deletion/reset, table renames, speculative refactors, public-API/ownership changes, and destructive data migration.

## Completion

The researcher explicitly approved the exact schema proposal at
`2026-09-05T09:21:31.3449676Z`.

Implemented the approved earlier idempotent core-table migration, aligned the
affected foreign-key signedness, changed receipt persistence metadata to the
approved nullable unsigned integer type, and retained string receipt IDs at the
public DTO boundaries.

Verification evidence:

- Targeted backend ESLint: PASS
- Repository backend ESLint: PASS
- Nest production build: PASS; compiled migration emitted under `dist`
- Docker Compose runtime: BLOCKED because the Windows environment has no Docker
  CLI and the available WSL distro also reports that `docker` is not installed
- Tests created or run: no

No Docker volume was deleted or reset, and no native-host backend/database
fallback was used. Runtime migration, container health, and `/api/health` remain
to be observed once Docker is available.
