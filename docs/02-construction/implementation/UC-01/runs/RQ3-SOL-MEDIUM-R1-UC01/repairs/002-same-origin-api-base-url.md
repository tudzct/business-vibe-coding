---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-01
run_id: RQ3-SOL-MEDIUM-R1-UC01
repair_index: 2
repair_id: RQ3-SOL-MEDIUM-R1-UC01-REPAIR-002
category: flow
trigger: runtime
fingerprint: absolute-api-base-url-bypasses-compose-nginx-proxy
affected_br_ids: [BR-REG-11]
status: Complete
started_at: 2026-08-31T10:14:34.781+07:00
started_epoch_ms: 1788146074781
source_revision_before: sha256:57147d88c63e3af84992557c910c701d30c8acad86897b11df79e53119a984bf
model_id: gpt-5.6-sol
reasoning_effort: medium
---

# Repair 002 — Route browser API calls through the Compose proxy

## Evidence

- `finalsource/fe/src/api/axiosInstance.ts:5` falls back to `http://localhost:8000/api`.
- The active Compose backend is bound to a different host port, so the browser's fallback target is unreachable.
- `http://localhost:8080/api/health` and the direct backend health endpoint both return HTTP 200, proving that the backend and Nginx proxy are reachable.
- `finalsource/fe/nginx.conf:15-23` proxies same-origin `/api/` requests to `backend:3000`.

## Required correction

Change only the Axios default base URL to same-origin `/api`. Preserve an explicitly supplied `VITE_API_BASE_URL`, the relative auth path, interceptors and all unrelated behavior.

## Scope

- Allowed files: `finalsource/fe/src/api/axiosInstance.ts`
- Affected BRs: `BR-REG-11`
- Permitted non-test verification: source inspection and bounded health/reachability observation
- Prohibited: new features, unrelated refactors, schema/public-API/ownership changes, container reset and all test creation/execution

## Completion

- Changed file: `finalsource/fe/src/api/axiosInstance.ts`
- Verification: production frontend build passed; source now targets same-origin `/api`; Nginx `/api/health` and direct backend health returned HTTP 200 before the rebuilt backend encountered the separate missing-table blocker.
- Ended at: `2026-08-31T10:15:09.011+07:00` (`1788146109012` epoch ms); duration `34.231` seconds.
- Source revision after: `sha256:fd6248fdfff221d7381c3e38ce859f7226623fc3da0fababac248a26578734d0`
- Token telemetry: unavailable per repair because repairs 002–006 share Codex session turn 5; the shared turn is retained in the canonical run.
- Reassessment: `BR-REG-11` source flow remains met; rebuilt runtime is separately blocked by the missing `Users` table.
