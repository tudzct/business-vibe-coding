---
artifact_type: business-coding-prompt
status: Draft | Approved
uc_id: <UC-ID>
uc_name: <Use case name>
source_use_case: docs/01-inception/use-cases/<use-case-file>.md
business_rule_resource: docs/02-construction/business-rules/<UC-ID>-business-rules.json
business_rule_baseline: docs/02-construction/implementation/<UC-ID>/business-rule-baseline.json
generated_at: <ISO-8601 timestamp>
---

# <UC-ID> Business Coding Prompt - <Use case name>

## Prompt A: Backend API

### Objective: Build the API endpoint, business logic, validation, and server-side error handling.

Create the `[HTTP METHOD] [API PATH]` endpoint in `[BACKEND ENTRY POINT]`.

This endpoint MUST be `[PUBLIC / PROTECTED]`. If protected, use `[AUTHENTICATION MECHANISM]`.

### Request Format

`[REQUEST BODY / QUERY PARAMS / PATH PARAMS]`

Implement the main logic in `[BUSINESS LOGIC LOCATION]`.

### Logic

Implement the backend flow for `[USE CASE / API ID]`.

Enforce all backend and database rules specified in Prompt E, including applicable normalization, validation, authorization, persistence, transaction, concurrency, and sensitive-data handling.

### Success Response

`[SUCCESS RESPONSE]`

Wrap the domain payload in `{ "success": true, "message": "[MESSAGE]", "data": [DOMAIN PAYLOAD] }` without changing source-defined fields or message semantics.

### Error Handling

If `[ERROR CONDITION]`, return or throw `[ERROR TYPE / HTTP STATUS]` with `[ERROR RESPONSE]`.

Preserve the source status and message through `{ "success": false, "statusCode": [STATUS], "message": "[MESSAGE]", "timestamp": "[ISO-8601]", "path": "[API PATH]" }`.

Follow the existing project architecture. Do not introduce new architectural layers or dependencies.

Handle relevant ownership, transaction, concurrency, idempotency, date/timezone, and monetary-rounding rules. Use existing ORM mappings and migration conventions. Do not alter the schema without an explicit source requirement and researcher-approved schema proposal.

## Prompt B: Frontend UI

### Objective: Build the user interface according to the Figma design.

Create `[COMPONENT NAME]` using `[FRONTEND TECHNOLOGIES]`.

The component MUST display:

- `[UI ELEMENT 1]`
- `[UI ELEMENT 2]`
- `[UI ELEMENT 3]`
- `[...]`

### Figma Design Scope

Frozen Figma dataset and target: `[DATASET / FRAME / NODE / CHECKSUM or N/A]`

Use the checksum-valid frozen Figma dataset to identify all frames relevant to the active use case.

Determine relevant frames using the use case name, purpose, application-user actions, screen titles, visible UI text, and semantically related terms.

Record the exact names and node IDs of all identified target frames:

- `[IDENTIFIED FIGMA FRAME NAME AND NODE ID 1]`
- `[IDENTIFIED FIGMA FRAME NAME AND NODE ID 2]`
- `[...]`

If the relevant frames cannot be identified unambiguously, stop and report the matching candidates instead of selecting or inventing a frame.

### Implementation Requirements

STRICTLY follow the frozen Figma design at `[DATASET / FRAME / NODE / CHECKSUM]`.

Ensure the layout, spacing, typography, colors, components, states, and responsive behavior match the design.

Use the project's existing styling system and component conventions. UC-backed controls are functional; design-only controls remain visual unless a source defines behavior. If a UC-required control is absent, add the smallest design-consistent element and record the mapping decision.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect the frontend component to the API and implement the successful flow.

Continue working on `[COMPONENT NAME]`.

Add the required state using `[STATE / FORM MANAGEMENT APPROACH]`.

Implement the asynchronous function `[FUNCTION NAME]` to send a `[HTTP METHOD]` request to `[API PATH FROM PROMPT A]`.

### Request Payload

`[REQUEST PAYLOAD]`

Use the project's existing API client or request approach.

### Success Response

`[SUCCESS RESPONSE FROM PROMPT A]`

Read the domain payload from the normalized response data.

When successful:

1. `[SUCCESS ACTION 1]`
2. `[SUCCESS ACTION 2]`
3. `[UPDATE STATE / SESSION]`
4. `[NAVIGATE / REFRESH DATA]`

Preserve API request idempotency where applicable.

Normalize date/timezone and monetary values according to the API contract and existing project conventions.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, loading state, and API error handling.

Refine `[FUNCTION NAME]` in `[COMPONENT NAME]`.

### Loading State

When `[LOADING STATE]` is true:

- Disable `[SUBMIT BUTTON]`.
- Display `[SPINNER / LOADING TEXT]`.
- Prevent duplicate submissions.

### API Error

If the API returns `[STATUS / ERROR CONDITION]`:

- Display `[ERROR MESSAGE]`.
- Display the message at `[ERROR DISPLAY LOCATION]`.

### Client-Side Validation

Before calling the API, enforce every client-applicable validation rule in Prompt E for `[USE CASE / API ID]`.

Display validation messages at `[VALIDATION MESSAGE LOCATION]`.

Backend validation remains authoritative.

Do not call the API when client-side validation fails.

## Prompt E: Business Rules Compliance

### Objective: Implement the complete frozen Business Rule set for this use case without changing its meaning.

The ordered Rule IDs below MUST exactly match the frozen Business Rule baseline. Every rule appears exactly once in this projection; one implementation control may enforce multiple rules when appropriate.

### Business Rule: `[BR-ID]`

- **Name:** `[rule name]`
- **Representation:** `OCL invariant | OCL precondition | OCL postcondition | natural language`
- **Expression / authoritative text:** `[verbatim Sheet-derived content]`
- **Context:** `[OCL context/class/operation or business scope]`
- **Enforcement layer:** `[frontend | backend | database | multiple]`
- **Failure behavior:** `[source-backed status/message/state, or unresolved]`
- **Traceability:** `[UC step/API/UI/source range]`

Preserve every Rule ID, OCL expression and authoritative natural-language constraint exactly.

Prompts A and D must reference applicable Rule IDs without redefining them. Backend/database enforcement remains authoritative across trust boundaries; frontend enforcement is an additional user-experience control.

Do not invent missing thresholds, statuses, ownership, schema, enforcement layers or failure behavior. Record unresolved source information and stop for the researcher when it changes implementation.

## Prompt F: Implementation Context

Use every prompt present in this approved artifact together with:

- project rules and target manifests/lockfiles;
- approved database contract;
- approved API contract;
- checksum-valid frozen Figma evidence when applicable;
- existing source-code conventions.

Priority:

1. Requirements explicitly present in this approved prompt
2. Approved API and database/project contracts
3. Frozen Figma evidence
4. Existing source-code conventions

Generate source only. Modify only files required by the use case. Do not create or run tests or test cases. Do not introduce unapproved schema, public API, ownership, dependency or destructive changes.
