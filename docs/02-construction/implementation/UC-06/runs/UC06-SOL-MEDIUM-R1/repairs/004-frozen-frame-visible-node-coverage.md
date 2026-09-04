---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-06
run_id: UC06-SOL-MEDIUM-R1
repair_index: 4
affected_br_ids: []
---

# Repair 4 — Frozen-frame visible-node coverage

## Evidence

Visual inspection of frozen dataset `2026-08-29-005`, node `4795:3`, shows a Settings row below Goals and a circular avatar indicator to the right of Search. The first-pass `AddAccountPage` omitted both visible design-only nodes.

## Required correction

Add an inert Settings row matching the sidebar presentation and a decorative avatar indicator matching the top bar. Do not invent navigation, settings behavior, data loading, or profile behavior.

## Scope

- Allowed files: `finalsource/fe/src/pages/AddAccount/AddAccountPage.tsx`
- Affected BRs: none; this is a frozen-frame UI coverage repair
- Permitted non-test verification: targeted ESLint, TypeScript compilation, frontend production build and frozen-source visual inspection
- Prohibited: new functional behavior, speculative refactors, schema/public-API/ownership decisions, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and updated UI coverage. Do not overwrite first-pass Business Rule evidence.
