---
artifact_type: business-coding-prompt
prompt_variant: rq3-ad
status: Draft | Approved
uc_id: <UC-ID>
uc_name: <Use case name>
source_use_case: docs/01-inception/use-cases/<use-case-file>.md
generated_at: <ISO-8601 timestamp>
---

# <UC-ID> Business Coding Prompt (RQ3) - <Use case name>

## Prompt A: Backend API

### Objective: Build the API endpoint, business logic, validation, and server-side error handling.

Create the `[HTTP METHOD] [API PATH]` endpoint in `[BACKEND ENTRY POINT]`.

This endpoint MUST be `[PUBLIC / PROTECTED]`. If protected, use `[AUTHENTICATION MECHANISM]`.

### Request Format

`[REQUEST BODY / QUERY PARAMS / PATH PARAMS]`

Implement the main logic in `[BUSINESS LOGIC LOCATION]`.

### Logic

Implement the backend flow for `[USE CASE / API ID]`.

Implement backend and database behaviors derived strictly from the use-case functional specification, UML model, API contract, and required project controls. Do not infer unsupported behavior.

### Success Response

`[SUCCESS RESPONSE]`

Wrap the domain payload in `{ "success": true, "message": "[MESSAGE]", "data": [DOMAIN PAYLOAD] }` without changing source-defined fields or message semantics.

### Error Handling

If `[ERROR CONDITION]`, return or throw `[ERROR TYPE / HTTP STATUS]` with `[ERROR RESPONSE]`.

Preserve the source status and message through `{ "success": false, "statusCode": [STATUS], "message": "[MESSAGE]", "timestamp": "[ISO-8601]", "path": "[API PATH]" }`.

Follow the existing project architecture. Do not introduce new architectural layers or dependencies.

Handle ownership, transaction, concurrency, idempotency, date/timezone, and monetary-rounding behavior only when required by the functional specification, UML model, API contract, or project technical baseline. Use existing ORM mappings and migration conventions. Do not alter the schema without an explicit source requirement and researcher-approved schema proposal.

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

Before calling the API, enforce client-applicable validation explicitly stated in the use-case functional specification, basic or exception flows, UI specification, and API contract for `[USE CASE / API ID]`. Do not infer additional validation.

Display validation messages at `[VALIDATION MESSAGE LOCATION]`.

Backend validation remains authoritative.

Do not call the API when client-side validation fails.
