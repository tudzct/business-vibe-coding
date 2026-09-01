---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-03
run_id: UC03-RQ3-SOL-MEDIUM-R1
repair_index: 3
repair_id: UC03-RQ3-SOL-MEDIUM-R1-REPAIR-003
category: technical
trigger: runtime
fingerprint: backend-runtime-transaction-account-table-case-mismatch
affected_br_ids: [BR-TXN-01, BR-TXN-02, BR-TXN-03, BR-TXN-05, BR-TXN-06]
status: Complete
started_at: 2026-08-31T23:02:45.911+07:00
started_epoch_ms: 1788192165911
source_revision_before: sha256:b3dbf2353632907beeaaa6f686d2fcd66ba76a5edb1d993f173ead15612cc0a0
requested_model_id: gpt-5.6-sol
requested_reasoning_effort: medium
requested_reasoning_mode: standard
effective_model_id: null
effective_model_unavailable_reason: The active tool context does not expose an authoritative effective model or snapshot identifier.
---

# Repair 003 — Align transaction and account mappings with physical table names

## Evidence

- Valid authenticated `All`, `Revenue`, `Expense`, and paginated requests return HTTP 500.
- Bounded backend logs show `Table 'vibe_business.Transactions' doesn't exist` and generated SQL joins `Accounts`.
- Read-only `INFORMATION_SCHEMA.TABLES` inspection reports the physical tables as lowercase `transactions`, `accounts`, and `categories`.
- The current entity annotations specify `@Entity('Transactions')` and `@Entity('Accounts')`; the Category mapping already uses the physical lowercase name.

## Required correction

Change only the Transaction and Account entity table-name annotations to the existing lowercase physical table names. Do not create or alter tables, columns, constraints, migrations, queries, or public APIs.

## Scope

- Allowed files: `finalsource/be/src/modules/transaction/transaction.entity.ts`, `finalsource/be/src/modules/account/account.entity.ts`
- Affected BRs: `BR-TXN-01`, `BR-TXN-02`, `BR-TXN-03`, `BR-TXN-05`, `BR-TXN-06`
- Permitted non-test verification: source inspection; Docker Compose rebuild/health; bounded transaction-list runtime observation; read-only database metadata and before/after aggregate observation
- Prohibited: schema/migration/data changes, public API changes, new features, unrelated refactors, and all test creation/execution

## Completion

- Changed files: `finalsource/be/src/modules/transaction/transaction.entity.ts`, `finalsource/be/src/modules/account/account.entity.ts`
- Verification: current backend production image built and started healthy; all three Compose services are healthy; frontend `/transactions` and backend health return 200.
- Runtime evidence: authenticated All/Revenue/Expense and limit-1 pagination requests return 200 with the normalized success envelope; absent/invalid identity returns 401; invalid and undeclared query parameters return 400; current backend logs contain no query failure/error lines.
- Data evidence: current database has no Transactions, so the successful empty result is `data=[]`, `total=0`, `hasMore=false`; source/SQL inspection supplies nonempty filter/order/mapping evidence without inventing data.
- Read-only evidence: aggregate Transaction/Account count-and-ID snapshots are identical before and after all bounded list requests.
- Ended at: `2026-08-31T23:07:40.710+07:00` (`1788192460710` epoch ms)
- Duration: `294.799` seconds
- Source revision after: `sha256:86e396b998156bfcec63c5129d7725544230753c250b650f0120fcae8d942f05`
- Token telemetry: shared Codex session turn 2 for Repairs 002-006; per-repair allocation is unavailable.
- Reassessment: affected BRs remain `met`; the runtime blocker is resolved and empty/success/exception flow evidence is now available.
