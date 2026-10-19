---
artifact_type: coding-prompt
status: Draft | Approved
uc_id: <UC-ID>
uc_name: <Use case name>
source_use_case: docs/01-inception/use-cases/<use-case-file>.md
source_api_contracts: <semicolon-separated ordered configured API paths, or None.>
business_rule_baseline: docs/02-construction/implementation/<UC-ID>/business-rule-baseline.json
generated_at: <ISO-8601 timestamp>
---

# <UC-ID> Coding Prompt - <Use case name>

Construct the technical implementation across Prompts A-D, where each prompt addresses a distinct architectural scope: backend endpoint contract (Prompt A), frontend visual structure (Prompt B), client interaction and state wiring (Prompt C), and visual feedback with request handling (Prompt D).

## Prompt A: Backend API

### Objective: Build the API endpoint routing, request parsing, and response envelope.

Create the `[HTTP METHOD] [API PATH]` endpoint in `[BACKEND ENTRY POINT]`.

This endpoint MUST be `[PUBLIC / PROTECTED]`. If protected, use `[AUTHENTICATION MECHANISM]`.

### Request Format

`[REQUEST BODY / QUERY PARAMS / PATH PARAMS]`

Define the request DTO and route handler in `[LOGIC LOCATION]`.

### Endpoint Handler

Define the controller handler for `[USE CASE / API ID]`.

Map incoming request parameters and body fields to the endpoint handler according to the applicable API contract. Read the configured checksum-pinned DBML as the database contract to map entities to existing tables and exact column definitions. Allow authorized DML only; never change schema/DBML/migration files, generate/run migrations or enable synchronization. Missing required structure is an input blocker.

### Success Response

`[SUCCESS RESPONSE]`

Wrap the response payload in `{ "success": true, "message": "[MESSAGE]", "data": [DOMAIN PAYLOAD] }` adhering to the configured API contract format without altering source-defined field names.

### Error Handling

If request parsing fails or the handler encounters an unhandled exception, return `{ "success": false, "statusCode": [STATUS], "message": "[MESSAGE]", "timestamp": "[ISO-8601]", "path": "[API PATH]" }`.

Follow the existing project architecture. Do not introduce new architectural layers or dependencies.

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

Use the project's existing styling system and component conventions.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect interactive UI controls to local component state and dispatch service calls.

Continue working on `[COMPONENT NAME]`.

Initialize component state using `[STATE / FORM MANAGEMENT APPROACH]`.

Implement the event handler `[FUNCTION NAME]` to collect current state and dispatch the request to `[API PATH FROM PROMPT A OR LOCAL SERVICE]`.

### State and Event Binding

Bind interactive elements from Prompt B to component state:

- Attach event listeners (`onChange`, `onClick`) to update local state values: `[INPUT CONTROL / STATE BINDINGS]`.
- Trigger `[FUNCTION NAME]` upon primary user action.

### Request Payload

`[REQUEST PAYLOAD]`

Use the project's existing API client or service utility to dispatch the payload.

### Response Handling

Upon receiving successful service resolution:

1. Store returned payload data in local component state.
2. Update visual state indicators (`[UPDATE STATE / SESSION]`).
3. Execute post-action transition or view update (`[NAVIGATE / REFRESH DATA]`).

## Prompt D: Validation and Error Handling

### Objective: Implement UI loading indicators, request error feedback, and form field presence guards.

Refine `[FUNCTION NAME]` in `[COMPONENT NAME]`.

### Loading Feedback

Manage asynchronous request in-flight status:

- When request is in flight: disable `[SUBMIT / ACTION BUTTON]`, display `[SPINNER / LOADING TEXT]`, and prevent duplicate invocations.
- When request completes: restore button active status and remove loading indicators.

### Service and Network Error Display

Render transport failure and error responses:

- When the service returns an error status or network failure occurs: display `[ERROR MESSAGE]` at `[ERROR DISPLAY LOCATION]`.
- Provide dialog dismissal or recovery button matching Figma design components.

### Form Input Presence Guard

Provide basic form completion feedback before submission:

- Verify that required form fields are not empty before dispatching `[FUNCTION NAME]`.
- Display inline format/presence alert at `[VALIDATION MESSAGE LOCATION]` when required fields are missing.

