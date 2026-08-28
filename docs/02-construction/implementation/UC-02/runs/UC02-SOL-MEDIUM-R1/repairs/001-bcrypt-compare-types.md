---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-02
run_id: UC02-SOL-MEDIUM-R1
repair_index: 1
affected_br_ids: [BR-LOG-04, BR-LOG-05, BR-LOG-06]
---

# Repair 1 — Declare the existing bcrypt compare API

## Evidence

`Docker Compose first-pass backend build failed with TS2339 at auth.service.ts: bcrypt.compare is absent from finalsource/be/src/types/bcrypt.d.ts.`

## Required correction

Add the smallest TypeScript declaration for the already-installed `bcrypt.compare(data: string, encrypted: string): Promise<boolean>` API. Do not change authentication behavior or dependencies.

## Scope

- Allowed files: `finalsource/be/src/types/bcrypt.d.ts`
- Affected BRs: `BR-LOG-04`, `BR-LOG-05`, `BR-LOG-06`
- Permitted non-test verification: Docker Compose backend/frontend production build
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions without researcher approval, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and reassessment of affected BRs. Do not overwrite first-pass evidence.
