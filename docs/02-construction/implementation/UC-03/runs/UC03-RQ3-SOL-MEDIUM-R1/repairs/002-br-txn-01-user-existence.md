---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-03
run_id: UC03-RQ3-SOL-MEDIUM-R1
repair_index: 2
repair_id: UC03-RQ3-SOL-MEDIUM-R1-REPAIR-002
category: business_rule
trigger: business_rule_review
fingerprint: br-txn-01-user-existence-not-verified
affected_br_ids: [BR-TXN-01]
status: Complete
started_at: 2026-08-31T22:54:02.911+07:00
started_epoch_ms: 1788191642911
source_revision_before: sha256:cf47d43bc23091e540244249d45b0a56a604e263d30de9e09ac27c4824108c71
requested_model_id: gpt-5.6-sol
requested_reasoning_effort: medium
requested_reasoning_mode: standard
effective_model_id: null
effective_model_unavailable_reason: The active tool context does not expose an authoritative effective model or snapshot identifier.
---

# Repair 002 — Reject JWT identities whose User no longer exists

## Evidence

- Immutable first-pass audit records `BR-TXN-01=unmet`.
- `finalsource/be/src/modules/auth/jwt.strategy.ts:31-33` returns JWT claims as the authenticated principal without querying the User repository.
- `finalsource/be/src/modules/transaction/transaction.service.ts:25-28` scopes Transactions through the authenticated user's Accounts, but an empty ownership result does not satisfy the `BR_TXN_01_UserExists` precondition.
- `finalsource/be/src/modules/auth/auth.module.ts:12-14` already registers the User repository for authentication providers.

## Required correction

During JWT validation, query the existing User repository by the token subject. Return the existing authenticated-principal shape only when that User exists; otherwise reject authentication with HTTP 401 semantics. Preserve JWT verification, ownership filtering, public API shape and unrelated authentication behavior.

## Scope

- Allowed files: `finalsource/be/src/modules/auth/jwt.strategy.ts`
- Affected BRs: `BR-TXN-01`
- Permitted non-test verification: source inspection; Docker backend production-image build; bounded Compose authentication/runtime observation
- Prohibited: schema changes, request/response shape changes, ownership-query changes, new features, unrelated refactors, and all test creation/execution

## Completion

- Changed files: `finalsource/be/src/modules/auth/jwt.strategy.ts`
- Verification: both frontend and backend production images built; database, backend and frontend became healthy; a signed JWT whose subject does not exist in `users` returned HTTP 401, while an existing User subject passed authentication and reached the transaction service.
- Additional runtime evidence: unauthenticated request returned 401; invalid and undeclared query parameters returned 400. The valid list path exposed a separate table-name mapping fingerprint and returned 500, which is assigned to Repair 003.
- Ended at: `2026-08-31T23:01:16.852+07:00` (`1788192076852` epoch ms)
- Duration: `433.941` seconds
- Source revision after: `sha256:b3dbf2353632907beeaaa6f686d2fcd66ba76a5edb1d993f173ead15612cc0a0`
- Token telemetry: Repairs 002-006 share Codex session turn 2 (`8,011,480` total tokens); the shared aggregate is retained in the canonical run and is not attributed to this repair alone.
- Reassessment: `BR-TXN-01=met` for User existence and ownership enforcement from source plus bounded 401 observation; end-to-end list success remains blocked by the distinct table-case fingerprint.
