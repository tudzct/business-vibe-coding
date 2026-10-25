---
artifact_type: bug-fixing-sub-prompt
uc_id: "UC-01"
run_id: "UC-01-GPT-5.6-TERRA"
repair_index: 4
defect_id: "DEF-UC01-04"
defect_fingerprint: "sha256:2d87403d145169517c9003f4d4a42cc79073d22d12ea06c69221d3a037079c5c"
category: "flow"
trigger: "Xac minh tren trinh duyet thuc te luong preview hoat dong dung khi duoc cap quyen"
source_revision: "sha256:c62958e7190a714e05249ab1084942bb30170c146d441bcee17cd6650c960759"
affected_br_ids: []
affected_flow_ids: ["BF-1"]
---

# Repair 4 — Restore granted-permission media enablement

## Evidence

- `docs/02-construction/implementation/UC-01/runs/UC-01-GPT-5.6-TERRA/flow-accuracy/evidence/initial-audit/researcher-statement-bf1.md@sha256:8049462db9d8166efe95509fb3bb6411fa43184088e0606111dc8bb5c788f20c: the accepted researcher follow-up marks BF-1 incorrect and reports that, after browser permission is granted, the user still cannot turn on microphone or camera.`

## Required correction

In `PreJoinPreview`, correct the local granted-permission path so a user who grants browser media permission can enable the camera and microphone controls and receive the corresponding preview/control state. Preserve the denied-permission dialog and the local-only, no-API/no-persistence boundary.

Read this completed sub-prompt in full and perform its required correction. Use the canonical evidence, validated project inputs and current source as facts and technical constraints. Preserve the approved coding prompt and unrelated behavior. If this instruction conflicts with a pinned input or immutable technical boundary, report the exact conflict and stop instead of silently deviating.

## Scope

- Allowed files: `finalsource/fe/src/components/PreJoinPreview.tsx`
- Affected BRs: None.
- Affected Flows: `BF-1`
- Permitted non-test verification: frontend lint, TypeScript compilation, production build, and bounded browser runtime observation of the granted-permission path.
- Prohibited: new features, speculative refactors, any database schema/DBML/migration-file change or migration, public-API/ownership decisions without researcher approval, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and reassessment of affected BRs. Do not overwrite first-pass evidence.
