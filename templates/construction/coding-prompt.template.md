---
artifact_type: coding-prompt
status: Draft | Approved
uc_id: <UC-ID>
uc_name: <Use case name>
generated_at: <ISO-8601 timestamp>
---

# <UC-ID> Coding Prompt - <Use case name>

Complete every placeholder with concrete information from the active project inputs. Use `N/A` only when an input explicitly establishes that the item is not applicable; do not invent a missing API, screen, database structure, behavior, message, or constraint.

The completed Coding Prompt must contain the implementation details needed without reopening the original project inputs. Backend and frontend together must cover every specified Basic/Main, Alternative and Exception Flow and its terminal outcome; distribute each behavior to its responsible section without changing scope or duplicating it unnecessarily.

Implementation context:

- Actors and roles: `[ACTORS, ROLES, AND RELEVANT PERMISSIONS]`
- Preconditions: `[PRECONDITIONS / N/A]`
- Postconditions: `[SUCCESS AND FAILURE POSTCONDITIONS / N/A]`
- Flow inventory: `[ORDERED BASIC/MAIN, ALTERNATIVE, AND EXCEPTION FLOW IDS WITH TERMINAL OUTCOMES]`

## Prompt A: Backend API

### Objective: Build the API endpoint, logic, validation, and server-side error handling.

### Backend Scope

- API inventory: `[ORDERED API IDS, HTTP METHODS, AND PATHS / N/A]`
- Endpoint being specified: `[API ID / N/A]` — `[HTTP METHOD] [API PATH / N/A]`
- Entry point: `[BACKEND MODULE / CONTROLLER / HANDLER / N/A]`
- Logic location: `[SERVICE / USE-CASE / DOMAIN LOCATION / N/A]`
- Existing source constraints: `[RELEVANT EXISTING FILES, TYPES, PATTERNS, AND COMPATIBILITY REQUIREMENTS]`
- Responsible Flow steps: `[FLOW IDS AND EXACT STEPS IMPLEMENTED BY THE BACKEND / N/A]`

If no backend API is required, write `N/A`, preserve the input-defined client-only behavior, and do not create a placeholder endpoint.

Repeat the request, logic, response, and error details below for every related API when more than one endpoint is required.

This endpoint MUST be `[PUBLIC / PROTECTED]`. If protected, use `[AUTHENTICATION MECHANISM]`.

Required headers, identity and authorization context: `[HEADERS / CURRENT USER OR ROLE CONTEXT / N/A]`.

### Request Format

- Path parameters: `[NAME, TYPE, REQUIRED/OPTIONAL, VALIDATION / N/A]`
- Query parameters: `[NAME, TYPE, REQUIRED/OPTIONAL, VALIDATION / N/A]`
- Request body: `[EXACT DTO FIELDS, TYPES, REQUIRED/OPTIONAL STATUS, VALIDATION / N/A]`

### Logic and Persistence

Implement the backend behavior in this order:

1. `[BACKEND BEHAVIOR / STATE TRANSITION / FLOW OUTCOME 1]`
2. `[BACKEND BEHAVIOR / STATE TRANSITION / FLOW OUTCOME 2]`
3. `[...]`

Use the existing database structure exactly:

- Tables and aliases: `[TABLES / N/A]`
- Columns, types and keys used: `[COLUMNS, TYPES, PRIMARY/FOREIGN KEYS / N/A]`
- Relationships and query conditions: `[RELATIONSHIPS / FILTERS / ORDERING / N/A]`
- Existing constraints relevant to the implementation: `[CONSTRAINTS / N/A]`
- Required existing records or read-only database facts: `[RELEVANT INITIAL DATA / N/A]`
- Authorized writes and transaction boundary: `[INSERT/UPDATE/DELETE AND TRANSACTION SCOPE / N/A]`

### Success Response

- HTTP status: `[SUCCESS STATUS / N/A]`
- Domain payload: `[EXACT RESPONSE FIELDS AND TYPES / N/A]`
- Message: `[SOURCE-DEFINED SUCCESS MESSAGE / N/A]`

Wrap the domain payload in `{ "success": true, "message": "[MESSAGE]", "data": [DOMAIN PAYLOAD] }` without changing source-defined fields or message semantics.

### Error Handling

Handle every backend error and exceptional terminal outcome:

- `[ERROR CONDITION]` -> `[ERROR TYPE / HTTP STATUS]` -> `[SOURCE-DEFINED MESSAGE AND RESPONSE]`
- `[ERROR CONDITION]` -> `[ERROR TYPE / HTTP STATUS]` -> `[SOURCE-DEFINED MESSAGE AND RESPONSE]`
- `[...]`

Preserve the source status and message through `{ "success": false, "statusCode": [STATUS], "message": "[MESSAGE]", "timestamp": "[ISO-8601]", "path": "[API PATH]" }`.

Follow the existing project architecture.

Handle relevant ownership, transaction, concurrency, idempotency, date/timezone, and data-precision rules. Map entities/queries to existing tables and exact column/key definitions. Allow authorized DML only; never change schema/DBML/migration files, generate/run migrations or enable synchronization. Missing required structure is an input blocker.

## Prompt B: Frontend UI

### Objective: Build the user interface according to the Figma design.

### UI Scope

- Route or placement: `[ROUTE / PARENT VIEW / N/A]`
- Component: `[COMPONENT NAME]`
- Source location: `[FRONTEND FILE / MODULE / N/A]`
- Technologies and existing conventions: `[FRONTEND TECHNOLOGIES, COMPONENTS, STYLING SYSTEM]`
- Responsible Flow steps: `[FLOW IDS AND EXACT STEPS REPRESENTED BY THE UI]`

The component MUST display:

- `[UI ELEMENT: CONTENT, CONTROL, INITIAL VALUE, ENABLED/VISIBLE CONDITION]`
- `[UI ELEMENT: CONTENT, CONTROL, INITIAL VALUE, ENABLED/VISIBLE CONDITION]`
- `[UI ELEMENT: CONTENT, CONTROL, INITIAL VALUE, ENABLED/VISIBLE CONDITION]`
- `[...]`

### Figma Design Scope

Frozen Figma dataset and target: `[DATASET / FRAME / NODE / CHECKSUM or N/A]`

Record the exact names and node IDs of all identified target frames:

- `[IDENTIFIED FIGMA FRAME NAME AND NODE ID 1]`
- `[IDENTIFIED FIGMA FRAME NAME AND NODE ID 2]`
- `[...]`

### Visual Specification

- Layout and hierarchy: `[CONTAINERS, ORDER, ALIGNMENT, DIMENSIONS]`
- Spacing and sizing: `[EXACT TOKENS OR MEASUREMENTS]`
- Typography and colors: `[EXACT STYLES OR TOKENS]`
- Assets and icons: `[ASSET REFERENCES AND DISPLAY RULES / N/A]`
- Responsive behavior: `[BREAKPOINT OR RESIZING BEHAVIOR / N/A]`

### UI States

- Default: `[VISIBLE CONTENT AND ENABLED CONTROLS]`
- Loading: `[VISIBLE CONTENT AND DISABLED CONTROLS]`
- Empty: `[EMPTY STATE / N/A]`
- Error: `[ERROR STATE]`
- Success or completed: `[SUCCESS STATE / TERMINAL UI OUTCOME]`
- Role, permission or availability variants: `[VARIANTS / N/A]`

### Implementation Requirements

Ensure the layout, spacing, typography, colors, components, states, and responsive behavior match the design.

Use the project's existing styling system and component conventions.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect the frontend component to the API and implement the successful flow.

Continue working on `[COMPONENT NAME]` in `[FRONTEND SOURCE LOCATION]`.

Add the required state using `[STATE / FORM MANAGEMENT APPROACH]`.

State model: `[STATE FIELD, TYPE, INITIAL VALUE, AND UPDATE CONDITION]`.

Implement the asynchronous function `[FUNCTION NAME]` to send a `[HTTP METHOD]` request to `[API PATH FROM PROMPT A]`.

Use `[EXISTING API CLIENT / SERVICE / REQUEST APPROACH]` with `[AUTH/HEADERS / N/A]`.

### Request Payload

- Path/query mapping: `[UI OR STATE VALUE -> API PARAMETER / N/A]`
- Body mapping: `[UI OR STATE VALUE -> REQUEST FIELD / N/A]`

Use the project's existing API client or request approach.

### Success Response

`[EXACT SUCCESS RESPONSE FROM PROMPT A / N/A]`

Read the domain payload from the normalized response data.

### Ordered Interaction Flow

Implement the client behavior in Flow order:

1. `[FLOW STEP ID: USER/SYSTEM TRIGGER -> STATE OR REQUEST ACTION -> OUTCOME]`
2. `[FLOW STEP ID: USER/SYSTEM TRIGGER -> STATE OR REQUEST ACTION -> OUTCOME]`
3. `[...]`

When successful:

1. `[SUCCESS ACTION 1]`
2. `[SUCCESS ACTION 2]`
3. `[UPDATE STATE / SESSION]`
4. `[NAVIGATE / REFRESH DATA]`

If the active inputs define no API call, write `N/A` for the request fields and implement only the specified local interaction; do not invent an integration.

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

Implement every specified client validation:

- `[FIELD / CONDITION]` -> `[EXACT MESSAGE]` -> `[DISPLAY LOCATION AND TRIGGER TIME]`
- `[FIELD / CONDITION]` -> `[EXACT MESSAGE]` -> `[DISPLAY LOCATION AND TRIGGER TIME]`
- `[...]`

### Error and Recovery Matrix

- `[STATUS / ERROR CONDITION]` -> `[UI MESSAGE]` -> `[STATE CHANGE]` -> `[RETRY/NAVIGATION/TERMINAL OUTCOME]`
- `[STATUS / ERROR CONDITION]` -> `[UI MESSAGE]` -> `[STATE CHANGE]` -> `[RETRY/NAVIGATION/TERMINAL OUTCOME]`
- `[...]`

Cover every Alternative and Exception Flow assigned to the frontend, including its exact terminal outcome.

Backend validation remains authoritative.

Do not call the API when client-side validation fails.
