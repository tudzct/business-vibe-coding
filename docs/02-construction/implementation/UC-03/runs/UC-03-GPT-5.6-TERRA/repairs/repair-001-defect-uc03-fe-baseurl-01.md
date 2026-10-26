---
artifact_type: bug-fixing-sub-prompt
uc_id: "UC-03"
run_id: "UC-03-GPT-5.6-TERRA"
repair_index: 1
defect_id: "defect-uc03-fe-baseurl-01"
defect_fingerprint: "sha256:f33509349453d53e119596ef42f2c94da45cb77244629817f7ad122ada871aca"
category: "flow"
trigger: "Host loads broadcaster preview and attempts to start live stream"
source_revision: "sha256:5cc859a5bc0edd0b40c70edcc3d7a078a10576bd58562c3b9e96c9c862bfb41b"
affected_br_ids: []
affected_flow_ids: ["BF-1"]
---

# Repair 1 — Restore reachable frontend session API routing

## Evidence

- `docs/02-construction/implementation/UC-03/runs/UC-03-GPT-5.6-TERRA/flow-accuracy/evidence/flow-assessment-initial-01/_source/client-baseurl-defect.json@sha256:6f1d294747a58eacfbdfeba6ab8c00dea90c7d0177139d089c88a61f465e9044: apiClient defaults to http://localhost:3000, a closed browser target rather than the published backend port or reverse-proxy /api path.`

## Required correction

Replace the unreachable frontend API-client fallback with the deployed/reverse-proxy-compatible base path required for the existing session-state and stream-command requests. Preserve the configured `VITE_API_BASE_URL` override, request paths, headers, and normalized error behavior. The broadcaster view must be able to load session state and submit the documented stream-control request rather than leaving Go Live permanently disabled due to connection refusal.

Read this completed sub-prompt in full and perform its required correction. Use the canonical evidence, validated project inputs and current source as facts and technical constraints. Preserve the approved coding prompt and unrelated behavior. If this instruction conflicts with a pinned input or immutable technical boundary, report the exact conflict and stop instead of silently deviating.

## Scope

- Allowed files: `finalsource/fe/src/api/client.ts`; `finalsource/fe/src/api/session.ts`; `finalsource/fe/src/components/BroadcasterLivePreview.tsx` only if needed to retain existing typed error/loading behavior.
- Affected BRs: None.
- Affected Flows: BF-1.
- Permitted non-test verification: frontend lint, TypeScript production build, and bounded browser/runtime observation of the session-state request target.
- Prohibited: new features, speculative refactors, any database schema/DBML/migration-file change or migration, public-API/ownership decisions without researcher approval, and all test creation/execution.

## Completion

Record changed files, verification evidence, time/tokens and reassessment of affected BRs. Do not overwrite first-pass evidence.
