---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-13
run_id: RQ3-SOL-MEDIUM-R1-UC13
repair_id: RQ3-SOL-MEDIUM-R1-UC13-REPAIR-007
repair_index: 7
affected_br_ids: []
category: technical
trigger: compile
fingerprint: bills-page-imports-nonexported-authcontext-useauth
status: complete
started_at: 2026-09-05T15:59:54.163+07:00
ended_at: 2026-09-05T16:00:20.692+07:00
duration_seconds: 26.529
source_revision_before: sha256:7ecb037e81527edb265d18e3469ddf7a180d0436507229ae26476a9ac7c1aa1b
source_revision_after: sha256:67cb2da43f7fc890d57309db479a446854cd3f292363cd07925e1870818ff06b
---

# Repair 7 — Use the established authentication hook import

## Evidence

The fresh frontend build fails at `finalsource/fe/src/pages/Bills/Bills.tsx:7`: `AuthContext` has no exported `useAuth` member, while the established hook is exported from `finalsource/fe/src/hooks/useAuth.ts`.

## Required correction

Change only the Bills page import to use the existing `useAuth` hook module. Preserve Bills behavior and all unrelated files.

## Scope

- Allowed files: `finalsource/fe/src/pages/Bills/Bills.tsx`
- Affected BRs: none; this is a cumulative technical build repair
- Permitted non-test verification: frontend TypeScript/Vite production build and source inspection
- Prohibited: authentication redesign, new features, speculative refactors, schema/public-API/ownership decisions, dependency changes, and all test creation/execution.

## Completion

Changed only `finalsource/fe/src/pages/Bills/Bills.tsx` to import the established `useAuth` hook from `../../hooks/useAuth`. The fresh frontend Docker production build passed. No Business Rule is affected. Model: `gpt-5.6-sol`, medium/standard. Per-repair tokens are unavailable because all authorized repairs share one aggregate runner turn.
