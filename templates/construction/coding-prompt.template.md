---
artifact_type: security-coding-prompt
status: Draft | Approved
uc_id: <UC-ID>
uc_name: <Use case name>
source_use_case: docs/01-inception/use-cases/<use-case-file>.md
security_resource: docs/02-construction/security-resources/<UC-ID>-security.json
security_point_selection_mode: researcher_selected | all_catalog
security_scope_activation: docs/02-construction/implementation/<UC-ID>/security-scope-activation.json
experiment_configuration_artifact: docs/05-experiments/configurations/<CONFIG-ID>.json
experiment_configuration_checksum: sha256:<checksum>
generated_at: <ISO-8601 timestamp>
figma_source: <file/frame/node or not-applicable>
google_sheets_source: <spreadsheet/tab/range or not-applicable>
---

# <UC-ID> Security Coding Prompt - <Use case name>

## Prompt A: Backend API

**Objective:** Build the API endpoint, business logic, validation, and server-side error handling.

Create the `[HTTP METHOD] [API PATH]` endpoint in `[BACKEND ENTRY POINT]`.

This endpoint MUST be `[PUBLIC / PROTECTED]`. If protected, use `[AUTHENTICATION MECHANISM]`.

**REQUEST FORMAT:**

`[REQUEST BODY / QUERY PARAMS / PATH PARAMS]`

Implement the main logic in `[BUSINESS LOGIC LOCATION]`.

Implement the backend flow for `[USE CASE / API ID]`. Enforce all backend and database Security Requirements in Prompt E. Follow existing architecture; do not add layers, dependencies, schema changes or unrelated behavior unless explicitly required.

**DOMAIN SUCCESS PAYLOAD FROM UC:** `[RAW UC SUCCESS OBJECT / PAYLOAD]`

**NORMALIZED HTTP SUCCESS RESPONSE:** `{ "success": true, "message": "[UC SAFE BUSINESS MESSAGE OR PROJECT DEFAULT]", "data": [DOMAIN PAYLOAD] }`

**ERROR HANDLING:** If `[ERROR CONDITION]`, throw `[ERROR TYPE / HTTP STATUS]` with the UC's safe message. Let the centralized filter produce `{ "success": false, "statusCode": [STATUS], "message": "[SAFE MESSAGE]", "timestamp": "...", "path": "..." }`. Do not bypass the global interceptor/filter to imitate a raw UC example.

Handle only applicable ownership, transaction, concurrency, idempotency, date/timezone and monetary rules already defined by the use case/project.

## Prompt B: Frontend UI

**Objective:** Build the UI for exactly one use case according to the specified Figma design.

- Use Case: `[USE CASE ID] - [USE CASE NAME]`
- Component: `[COMPONENT NAME]`
- Technologies: `[FRONTEND TECHNOLOGIES]`
- Target Figma frame/link: `[FIGMA FRAME NAME / LINK / SELECTION ID]`
- Frozen Figma dataset/node/checksum: `[DATASET ID / NODE ID / MANIFEST CHECKSUM]`
- Detailed UI mapping (only for inference/mismatch/reviewer request): `[path or N/A]`
- Required UI elements: `[UI ELEMENTS]`

Treat the frozen dataset as the complete visual contract. Autonomously reconstruct every visible node/group and preserve every UC flow checkpoint. UC-backed controls are functional; Figma-only controls remain visual-only without invented navigation/API. If a UC-required control is absent from the frame, add the smallest token-consistent visual inference and record it. Do not copy the full component tree into this prompt or silently omit design nodes. The FE skill must complete its runtime visual gate with 100% visible-node coverage and `>= 0.90` deterministic perceptual similarity. Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

**Objective:** Connect the frontend component to the API and implement the successful flow.

Continue `[COMPONENT NAME]`; use `[STATE / FORM APPROACH]`; implement `[FUNCTION NAME]` calling `[HTTP METHOD] [API PATH]` through the existing API client.

- Request payload: `[REQUEST PAYLOAD]`
- Success response: consume the normalized envelope from Prompt A; read the UC domain payload from `response.data.data` (or the equivalent typed API-client result).
- Success actions, in order: `[SUCCESS ACTIONS / STATE / NAVIGATION]`

Implement no extra business behavior. Preserve applicable idempotency, date/timezone and monetary conventions already specified.

## Prompt D: Validation and Error Handling

**Objective:** Complete client validation, loading state and API error handling.

Refine `[FUNCTION NAME]` in `[COMPONENT NAME]`.

- Loading: disable `[CONTROLS]`, show `[INDICATOR]`, prevent duplicate submissions.
- API error: for `[STATUS / CONDITION]`, display `[SAFE MESSAGE]` at `[LOCATION]`.
- Client validation: enforce only client-applicable requirements explicitly defined by the use case or Prompt E; backend remains authoritative.

Do not call the API on invalid client input. Do not add validation or behavior not supported by source requirements.

## Prompt E: Security Requirements

**Objective:** Apply the approved security coding resource as the single source of truth for security controls for `[USE CASE / API ID]`.

Generate this section with `.codex/skills/gen-security-coding-resource/scripts/render_prompt_e.py` and insert the catalog projection verbatim. Every selected SR field must be copied from `docs/00-context/security/OWASP-2025-SECURITY-CATALOG.json`. Do not paraphrase, translate, contextualize, shorten or extend catalog content. Only when a required field is empty or explicitly not specified/not populated, append the security resource's separately recorded source supplement. That supplement may use only the same SEC record's `primary_source_url`, must retain provenance and must contain no inferred requirement.

### Security Requirement: `[VULNERABILITY / CONTROL NAME]`

**Requirement ID:** `[SR-<UC>-NN]`

**OWASP category:** `[exact catalog value]`

**SEC ID:** `[exact catalog value]`

**Security point:** `[exact catalog value]`

**Vulnerability name:** `[exact catalog value]`

**Applicability:** `[exact catalog value]`

**Required condition:** `[exact catalog value]`

**Source mappings:** `[exact catalog value]`

**Primary source URL:** `[exact catalog value]`

**ASVS category:** `[exact catalog value]`

**ASVS requirement verbatim:** `[exact catalog value]`

**ASVS applicability:** `[exact catalog value]`

**ASVS MUST DO:** `[exact catalog value]`

**ASVS MUST NOT DO:** `[exact catalog value]`

**ASVS acceptance criteria:** `[exact catalog value]`

**Suggested SAST evidence:** `[exact catalog value]`

**Suggested DAST evidence:** `[exact catalog value]`

**ASVS PDF location:** `[exact catalog value]`

Prompt E is limited to the frozen A01–A10 records selected from the canonical JSON. The only derived field is Requirement ID, mechanically formed from UC ID and SEC ID. Prompts A-D remain the TechnicalReport-derived functional baseline and MUST implement Prompt E without weakening, duplicating or inventing controls. If a catalog requirement conflicts with that approved functional/API baseline, stop and request a decision. Do not generate a Business Requirements or Business Rules Compliance prompt.

## Prompt F: Implementation Context

Use Prompts A-E together with:

- `[AGENTS / PROJECT RULES FILE]`
- `[PROJECT_CONTEXT FILE]`
- `[DATABASE SUMMARY FILE]`
- `[USE CASE / API SPECIFICATION]`
- `[SECURITY CODING RESOURCE]`
- `[FIGMA LINK / SELECTION ID]`

External source provenance: `[Google spreadsheet ID/tab/gid/range/retrieval time; Figma file/frame/node/retrieval time]`.

Priority:

1. Approved TechnicalReport-derived use-case behavior, HTTP status, business fields and safe messages, automatically mapped to the project-wide response envelopes
2. Prompt E Security Requirements
3. Project rules and database schema
4. Figma design
5. Existing source-code conventions

Generate source code only. Do not create or run functional tests or test cases. Preserve the TechnicalReport-derived behavior, do not introduce new behavior, and do not modify unrelated files. Capture generation/repair telemetry through `$audit-generation-metrics`, finish the repair loop, and record the frozen final source hash.
