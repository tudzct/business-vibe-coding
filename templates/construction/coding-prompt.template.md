---
artifact_type: coding-prompt
status: Draft | Approved
uc_id: <UC-ID>
uc_name: <Use case name>
generated_at: <ISO-8601 timestamp>
---

# <UC-ID> Coding Prompt - <Use case name>

Both backend and frontend together must cover every specified Basic/Main, Alternative and Exception Flow and its terminal outcome; distribute these behaviors across Prompts A-D without changing the frozen functional scope.

## Prompt A: Backend API

### Objective: Build the API endpoint, logic, validation, and server-side error handling.

Create the `[HTTP METHOD] [API PATH]` endpoint in `[BACKEND ENTRY POINT]`.

This endpoint MUST be `[PUBLIC / PROTECTED]`. If protected, use `[AUTHENTICATION MECHANISM]`.

### Request Format

`[REQUEST BODY / QUERY PARAMS / PATH PARAMS]`

Implement the main logic in `[LOGIC LOCATION]`.

### Logic

Implement the backend flow for `[USE CASE / API ID]`.

### Success Response

`[SUCCESS RESPONSE]`

Wrap the domain payload in `{ "success": true, "message": "[MESSAGE]", "data": [DOMAIN PAYLOAD] }` without changing source-defined fields or message semantics.

### Error Handling

If `[ERROR CONDITION]`, return or throw `[ERROR TYPE / HTTP STATUS]` with `[ERROR RESPONSE]`.

Preserve the source status and message through `{ "success": false, "statusCode": [STATUS], "message": "[MESSAGE]", "timestamp": "[ISO-8601]", "path": "[API PATH]" }`.

Follow the existing project architecture.

Handle relevant ownership, transaction, concurrency, idempotency, date/timezone, and data-precision rules. Map entities/queries to existing tables and exact column/key definitions. Allow authorized DML only; never change schema/DBML/migration files, generate/run migrations or enable synchronization. Missing required structure is an input blocker.

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

Record the exact names and node IDs of all identified target frames:

- `[IDENTIFIED FIGMA FRAME NAME AND NODE ID 1]`
- `[IDENTIFIED FIGMA FRAME NAME AND NODE ID 2]`
- `[...]`

### Implementation Requirements

Ensure the layout, spacing, typography, colors, components, states, and responsive behavior match the design.

Use the project's existing styling system and component conventions.

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

Display validation messages at `[VALIDATION MESSAGE LOCATION]`.

Backend validation remains authoritative.

Do not call the API when client-side validation fails.
