---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-03
run_id: UC03-RQ3-SOL-MEDIUM-R1
repair_index: 1
repair_id: UC03-RQ3-SOL-MEDIUM-R1-REPAIR-001
category: technical
trigger: compile
fingerprint: backend-build-passport-jwt-missing-typescript-declaration
affected_br_ids: []
status: Complete
started_at: 2026-08-31T22:41:00.184+07:00
started_epoch_ms: 1788190860184
source_revision_before: sha256:f0fd0965a7fcb07de003b5d7f7acc755e745d8f9499fb76513726a8134ca77a4
requested_model_id: gpt-5.6-sol
requested_reasoning_effort: medium
requested_reasoning_mode: standard
effective_model_id: null
effective_model_unavailable_reason: The active tool context does not expose an authoritative effective model or snapshot identifier.
---

# Repair 001 — Supply the passport-jwt TypeScript declaration

## Evidence

- Docker backend production build fails with `TS7016` at `finalsource/be/src/modules/auth/jwt.strategy.ts:4` because `passport-jwt` has no available TypeScript declaration.
- `finalsource/be/package.json` declares the runtime package `passport-jwt@^4.0.1` but does not declare `@types/passport-jwt`.
- Incident `docs/03-audit/docker-deployment/incidents/backend-build-passport-jwt-missing-typescript-declaration.json` records the same fingerprint as `DEP-20260831-001`.
- Canonical run `docs/05-experiments/UC-03/UC03-RQ3-SOL-MEDIUM-R1.json` preserves the failed first-pass build and identifies this evidenced defect.

## Required correction

Add the matching maintained TypeScript declaration package for `passport-jwt` as a backend development dependency and update the lockfile. Do not change authentication behavior or application source.

## Scope

- Allowed files: `finalsource/be/package.json`, `finalsource/be/package-lock.json`
- Affected BRs: none; this technical repair only removes the current-source backend build blocker
- Permitted non-test verification: Docker backend production-image build
- Prohibited: application-source changes, new features, speculative refactors, schema/public-API/ownership changes, and all test creation/execution

## Completion

- Changed files: `finalsource/be/package.json`, `finalsource/be/package-lock.json`
- Verification: `docker compose --env-file finalsource/.env -f finalsource/compose.yaml build backend` exited 0; `npm ci`, `nest build`, production dependency pruning and image export all completed successfully.
- Ended at: `2026-08-31T22:45:15.524+07:00` (`1788191115524` epoch ms)
- Duration: `255.340` seconds
- Source revision after: `sha256:cf47d43bc23091e540244249d45b0a56a604e263d30de9e09ac27c4824108c71`
- Token telemetry: Codex session turn 1, `2,240,473` total tokens from final runner extraction.
- Reassessment: no BR status changed; `BR-TXN-01` remains `unmet` because the separate User-existence fingerprint is outside this repair.
