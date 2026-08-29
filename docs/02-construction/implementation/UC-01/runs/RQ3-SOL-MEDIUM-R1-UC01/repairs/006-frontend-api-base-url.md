---
artifact_type: bug-fixing-sub-prompt
uc_id: UC-01
run_id: RQ3-SOL-MEDIUM-R1-UC01
repair_index: 6
affected_br_ids: [BR-REG-11]
---

# Repair 6 — Route browser registration requests through the frontend proxy

## Evidence

The browser API client defaulted to `http://localhost:8000/api`, while the active Compose configuration exposes the frontend on port 8081, the backend on port 3001, and already defines an Nginx `/api/` proxy to backend port 3000. Browser registration therefore targeted a host port with no service.

## Required correction

Use the same-origin `/api` path as the default Axios base URL so Docker-hosted browser requests reach the existing Nginx proxy. Preserve explicit `VITE_API_BASE_URL` overrides and all request/response behavior.

## Scope

- Allowed files: `finalsource/fe/src/api/axiosInstance.ts`
- Affected BRs: BR-REG-11
- Permitted non-test verification: Docker Compose frontend production build, current-image restart, frontend reachability and bounded proxy observation
- Prohibited: endpoint changes, new dependencies/features, backend/schema/ownership changes, and all test creation/execution.

## Completion

Record the changed file, Docker/runtime evidence, automatic time/tokens and reassessment without overwriting first-pass evidence.
