---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-09
run_id: UC09-RQ3-SOL-MEDIUM-R1
repair_id: UC09-RQ3-SOL-MEDIUM-R1-REPAIR-003
repair_index: 3
category: business_rule
trigger: business_rule_review
fingerprint: atomic-deletion-missing-queryrunner-and-500-mapping
affected_br_ids: [BR-ACC-28]
status: Completed
requested_model_id: gpt-5.6-sol
requested_reasoning_effort: medium
effective_model_id: gpt-5.6-sol
effective_snapshot: null
session_id: 01a080e9-8f30-74f1-9377-8427b1cf7a89
session_turn_id: 3
runtime_turn_id: 01a080fe-e233-7b81-8694-cd9f5af836f0
started_at: 2026-09-08T12:32:26.9078676Z
started_epoch_ms: 1788870746909
source_revision_before: sha256:a1a7f64e8347cc4369765c2eb5d464920a653652ef3e7f1a6da1108a9b16bd0d
source_revision_after: sha256:ac8e0f4369f318d728daed94fb3a732d1ee3281bb45acdaa9671bc2fe8db8017
ended_at: 2026-09-08T12:34:50.7384917Z
ended_epoch_ms: 1788870890738
duration_seconds: 143.829
session_duration_seconds: 439.586
total_tokens: 2112917
input_tokens: 33090
cache_read_tokens: 2069632
total_input_tokens: 2102722
output_tokens: 10195
reasoning_tokens: 1855
cost_usd: 1.5061
---

# Repair 3 — Use QueryRunner for atomic account deletion

## Evidence

The immutable first-pass assessment records `BR-ACC-28` as unmet because account deletion used `Repository.manager.transaction` rather than the required explicit QueryRunner lifecycle, and translated selected database deletion failures to HTTP 409 instead of the required HTTP 500 processing failure.

## Required correction

Execute the existing locked validation, related-transaction deletion, and account deletion through one explicitly managed TypeORM QueryRunner transaction. Commit only after both deletions succeed, roll back any active transaction on failure, preserve explicit HTTP 404/409 business exceptions, and map unexpected processing/database failures to the source-defined HTTP 500 response.

## Scope

- Allowed files: `finalsource/be/src/modules/account/account.service.ts`
- Affected BRs: `BR-ACC-28`
- Permitted non-test verification: targeted backend ESLint for the allowed file and the backend production build
- Prohibited: implementation of `BR-ACC-30` or `BR-ACC-31`, schema/public-API/ownership changes, speculative refactors, first-pass evidence mutation, and all test creation/execution

## Completion

`finalsource/be/src/modules/account/account.service.ts:324-394` now obtains a QueryRunner from the injected TypeORM DataSource, connects it, starts one `SERIALIZABLE` transaction, performs all validation and both deletions through the QueryRunner manager, commits only after the related Transaction rows and Account row are deleted, rolls back any active transaction on failure, and releases the runner. Explicit HTTP 404/409 business exceptions are preserved; unexpected processing, database, and rollback failures map to the source-defined safe HTTP 500 response.

Targeted backend ESLint passed for the allowed file, and the Nest production build passed. No tests were created or run. The source revision changed from `sha256:a1a7f64e8347cc4369765c2eb5d464920a653652ef3e7f1a6da1108a9b16bd0d` to `sha256:ac8e0f4369f318d728daed94fb3a732d1ee3281bb45acdaa9671bc2fe8db8017`. `BR-ACC-28` is reassessed as `met`; Repair 002's `BR-ACC-29` enforcement remains intact. Closed session turn 3 consumed 2,112,917 tokens over 439.586 seconds; the bounded repair operation itself took 143.829 seconds.
