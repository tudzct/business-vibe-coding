---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-05
run_id: UC05-SOL-MEDIUM-R1
repair_id: UC05-SOL-MEDIUM-R1-REPAIR-003
repair_index: 3
status: Complete
category: technical
trigger: compile
fingerprint: docker-backend-passport-jwt-types-undeclared
affected_br_ids: []
source_revision_before: sha256:c4339b1fbabef41db42e3039db018793ce0cfefa1444c2891c09cce2072ff8d8
started_at: 2026-09-02T21:07:32.2022457+07:00
started_epoch_ms: 1788358052202
ended_at: 2026-09-02T21:10:30.6557005+07:00
ended_epoch_ms: 1788358230655
duration_seconds: 178.453
source_revision_after: sha256:5656344d953d9f840e80da21ce897006631cef202ed05f482c07f432c06ab7e6
---

# Repair 003 — Declare the passport-jwt TypeScript definitions

## Evidence

The Docker backend build reports `src/modules/auth/jwt.strategy.ts:4:38 - error TS7016: Could not find a declaration file for module 'passport-jwt'`. The host installation contains `@types/passport-jwt@4.0.1` as an extraneous package, but neither `finalsource/be/package.json` nor `package-lock.json` declares it, so Docker's clean `npm ci` omits the definitions.

## Required correction

Add `@types/passport-jwt@4.0.1` as a backend development dependency and update the backend lockfile consistently. Preserve runtime dependencies and `jwt.strategy.ts` behavior.

## Scope

- Allowed files: `finalsource/be/package.json`, `finalsource/be/package-lock.json`
- Affected BRs: none
- Permitted non-test verification: clean dependency lock inspection, backend TypeScript/Nest production build, and Docker backend build observation when available
- Prohibited: source declaration shims, authentication behavior changes, dependency upgrades outside this type package and its lockfile-required transitive entries, schema/public-API/ownership changes, unrelated lint repairs, and all test creation/execution

## Completion

- Changed files: `finalsource/be/package.json`, `finalsource/be/package-lock.json`
- Dependency evidence: `@types/passport-jwt@4.0.1` is declared in devDependencies and locked with its required type dependencies.
- Clean-install evidence: `npm ci --ignore-scripts --dry-run` completed successfully from the updated lockfile.
- Backend TypeScript/Nest production build: passed.
- Business Rule reassessment: no frozen BR status changed; all six remain met.
- Repair duration: 178.453 seconds. Token telemetry is recorded in the canonical run JSON.
- Docker rebuild: unavailable because Docker CLI/Compose remains inaccessible from the current execution environment.
