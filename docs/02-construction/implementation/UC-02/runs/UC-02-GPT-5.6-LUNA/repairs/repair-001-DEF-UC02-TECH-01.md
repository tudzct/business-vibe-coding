---
artifact_type: bug-fixing-sub-prompt
uc_id: "UC-02"
run_id: "UC-02-GPT-5.6-LUNA"
repair_index: 1
defect_id: "DEF-UC02-TECH-01"
defect_fingerprint: "sha256:f1fa0cfbbbf407c63698d5aab859c85b9cb2a98a5674fe4c5465b6ac1979970f"
source_revision: "sha256:5610c8c9c08a3f2bf34e3e485790b84c67b69a0e151b30895045d9b551713298"
---

# Repair 1 — Frontend TypeScript build fails due to unused state setters in App.tsx

## Evidence

### Defect Summary

- Category: technical
- Description: In `finalsource/fe/src/App.tsx`, `setCameraRequested` and `setMicrophoneRequested` are declared by `useState` but never read. With `noUnusedLocals` enabled, the frontend Docker build fails with TS6133.
- Reproduction steps: Run `docker compose -f finalsource/compose.yaml up -d --build --no-deps backend frontend`; observe `npm run build` fail at `src/App.tsx(30,27)` and `src/App.tsx(31,31)`.

### Evidence 1

- Source file: `docs/02-construction/implementation/UC-02/runs/UC-02-GPT-5.6-LUNA/flow-accuracy/evidence/initial-audit-01/_runtime/docker-compose-build-failure.txt`
- Lines: 1-10
- Locator: frontend `npm run build` TS6133 output
- Defect finding: Docker frontend build exited with code 2 because `setCameraRequested` and `setMicrophoneRequested` are unused.
- Content: `tsc -b && vite build` reports TS6133 for both setters and the frontend build exits with code 2.

### Evidence 2

- Source file: `finalsource/fe/src/App.tsx`
- Lines: 25-31
- Locator: the two `useState` declarations
- Defect finding: `const [cameraRequested, setCameraRequested] = useState(true);` and `const [microphoneRequested, setMicrophoneRequested] = useState(true);` declare setters that are never read.
- Content: the state values are used for media preparation, but the setter identifiers have no call sites.

## Required correction

Modify only the smallest necessary frontend source so `setCameraRequested` and `setMicrophoneRequested` are no longer unused while preserving the existing preview behavior and the UC-02 join flow. Prefer removing the unused setter bindings if the requested-state values remain intentionally fixed; if state setters are required by the existing behavior, use them in the corresponding preview-control path without changing API, UX, or business-rule semantics. Keep the display-name validation, media controls, join request, idempotency header, recovery-state preservation, and effective media handling intact. Do not modify the database schema, migrations, API contracts, or unrelated files.

## Scope

- Known affected files: `finalsource/fe/src/App.tsx`
- Affected targets: BR-JS-01, BR-JS-02, BR-JS-03, BR-JS-04, BR-JS-05, BR-JS-06, BR-JS-07, BR-JS-08, BR-JS-09, BR-JS-10, BR-JS-11, BR-JS-12, BR-JS-13, BR-JS-14, BR-JS-15, BR-JS-16, BR-JS-17, BR-JS-18, BR-JS-19; BF-1, AF-1, EF-1; BF-1.1, BF-1.2, BF-1.3, BF-1.4, AF-1.1a, AF-1.1b, EF-1.3a, EF-1.3b; API-SESSION-JOIN; API-SESSION-STATE; Preview and Join Session UI (App.tsx)

## Completion

Report the changed file, the TypeScript/build verification result, and reassessment of the affected business rules, flows, APIs, and UI target. Preserve all first-pass source and audit evidence.
