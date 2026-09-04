---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-16
run_id: UC16-RQ3-SOL-LIGHT-R1
repair_index: 1
repair_id: UC16-RQ3-SOL-LIGHT-R1-REPAIR-001
category: technical
trigger: compile
fingerprint: frontend-recharts-tooltip-content-props-ts2739
affected_br_ids: [BR-SAV-09]
status: completed
requested_model_id: gpt-5.6-sol
requested_reasoning_effort: low
effective_model_id: null
effective_model_unavailable_reason: The runtime did not expose an effective provider model identifier.
started_at: 2026-09-04T10:24:27.7676910Z
started_epoch_ms: 1788517467781
ended_at: 2026-09-04T10:28:29.0479878Z
ended_epoch_ms: 1788517709047
duration_seconds: 241.266
source_revision_before: sha256:f71cd05b00b9a89046d5c1503bcdf407c895a7a88579f1da9fc9c7f8544cdee1
source_revision_after: sha256:9fe295ab0170c24e09cca5bc1465dc39cf3ab9e6469eb87e7818627b68a3b252
---

# Repair 1 — Recharts tooltip content type mismatch

## Evidence

Frontend production build reports TypeScript `TS2739` at `finalsource/fe/src/components/Goals/SavingsSummaryChart.tsx:222`: the JSX element supplied to the Recharts `Tooltip` `content` prop does not satisfy `TooltipContentProps<number, string>`.

## Required correction

Pass the existing `SavingsTooltip` renderer to Recharts in the supported callback/component form instead of eagerly constructing it without the props that Recharts supplies. Preserve its rendering and all unrelated behavior.

## Scope

- Allowed files: `finalsource/fe/src/components/Goals/SavingsSummaryChart.tsx`
- Affected BRs: `BR-SAV-09`
- Permitted non-test verification: targeted ESLint for the allowed file and frontend production build
- Prohibited: new features, speculative refactors, schema/public-API/ownership decisions without researcher approval, and all test creation/execution.

## Completion

- Changed file: `finalsource/fe/src/components/Goals/SavingsSummaryChart.tsx`
- Correction: use Recharts' default `TooltipContentProps` generic domain and pass `SavingsTooltip` as the `content` renderer so Recharts supplies runtime tooltip props.
- Targeted ESLint: PASS with zero diagnostics.
- Frontend production build: PASS; TypeScript project build and Vite production bundle completed, transforming 679 modules.
- BR-SAV-09 reassessment: `met` from the inspectable tooltip renderer, supported Recharts integration, and passing production build. The immutable first-pass `unmet` result remains unchanged.
- Token telemetry: 1,389,290 total tokens from finalized repair turn 1.
- Tests created or run: none.
