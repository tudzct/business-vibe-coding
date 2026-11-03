---
artifact_type: coding-prompt
status: Draft | Approved
uc_id: <UC-ID>
uc_name: <Use case name>
generated_at: <ISO-8601 timestamp>
---

# <UC-ID> Coding Prompt - <Use case name>

Complete every placeholder with concrete information from the active project inputs. Use `N/A` only when an input explicitly establishes that the item is not applicable; do not invent a missing API, screen, database structure, behavior, message, or constraint.

The completed Coding Prompt must contain the implementation details needed without reopening the original project inputs. Cover every Basic/Main, Alternative and Exception Flow and terminal outcome once in its responsible prompt without changing scope.

Use-case context:

- Actors and roles: `[ACTORS, ROLES, AND RELEVANT PERMISSIONS]`
- Preconditions: `[PRECONDITIONS / N/A]`
- Postconditions: `[SUCCESS AND FAILURE POSTCONDITIONS / N/A]`
- Flow inventory: `[ORDERED BASIC/MAIN, ALTERNATIVE, AND EXCEPTION FLOW IDS WITH TERMINAL OUTCOMES]`

## Prompt A: Backend API

### Objective: Build the API endpoint, logic, validation, and server-side error handling.

### Backend Scope

- Domain classes and attributes: `[RELEVANT CLASSES; ATTRIBUTE NAMES, TYPES, AND REQUIRED/OPTIONAL STATUS / N/A]`
- Domain operations and enums: `[RELEVANT OPERATIONS, SIGNATURES, ENUMS, AND VALUES / N/A]`
- Domain relationships and types: `[RELEVANT RELATIONSHIPS, CARDINALITIES, AND TYPE DEFINITIONS / N/A]`
- Backend module and entry point: `[MODULE; CONTROLLER/HANDLER; ROUTE REGISTRATION / N/A]`
- Backend logic locations: `[SERVICE, DOMAIN, REPOSITORY, AND SUPPORTING FILES / N/A]`
- Backend Flow steps: `[FLOW IDS AND EXACT STEPS REQUIRING SERVER-SIDE PROCESSING / N/A]`

If no backend API is required, write `N/A` and do not create a placeholder endpoint or backend implementation.

Repeat this block for each related API in declared order:

### API: `[API ID]` - `[HTTP METHOD] [API PATH]`

### Access

- Access level: `[PUBLIC / PROTECTED]`
- Authentication mechanism: `[AUTHENTICATION MECHANISM / N/A]`
- Required headers: `[HEADER NAMES, TYPES/FORMATS, AND REQUIRED/OPTIONAL STATUS / N/A]`
- Identity and authorization context: `[IDENTITY SOURCE, OWNERSHIP/ROLE CHECKS, AND AUTHORIZATION CONDITIONS / N/A]`

### Request

- Path parameters: `[NAME, TYPE, REQUIRED STATUS, AND SERVER VALIDATION / N/A]`
- Query parameters: `[NAME, TYPE, REQUIRED/OPTIONAL STATUS, DEFAULT, AND SERVER VALIDATION / N/A]`
- Request body: `[DTO NAME; FIELD NAMES, TYPES, REQUIRED/OPTIONAL STATUS, AND SERVER VALIDATION / N/A]`

### Processing

1. `[ORDERED BACKEND ACTION OR CHECK]`
2. `[STATE TRANSITION OR PERSISTENCE ACTION]`
3. `[TERMINAL BACKEND OUTCOME]`

### Database Mapping and Use

- Tables: `[EXACT TABLE NAMES / N/A]`
- Columns and types: `[TABLE.COLUMN -> DATABASE TYPE AND NULLABILITY / N/A]`
- Keys and relationships: `[PRIMARY/UNIQUE/FOREIGN KEYS AND RELATIONSHIPS / N/A]`
- Constraints: `[RELEVANT DATABASE CONSTRAINTS / N/A]`
- Query filters and ordering: `[FILTERS, JOINS, AND ORDERING / N/A]`
- Required existing data: `[REQUIRED ROWS/STATE / N/A]`
- Authorized writes: `[INSERT/UPDATE/DELETE EFFECTS / N/A]`
- Transaction boundary: `[ATOMIC OPERATIONS AND ROLLBACK CONDITION / N/A]`

### Success Response

- HTTP status: `[SUCCESS STATUS]`
- Message: `[SOURCE-DEFINED SUCCESS MESSAGE]`
- Domain payload: `[RESPONSE DTO; EXACT FIELD NAMES, TYPES, AND NULLABILITY]`

### Error Handling

Repeat for every specified server-side error:

- `[CONDITION -> ERROR TYPE/HTTP STATUS -> SOURCE-DEFINED MESSAGE -> ERROR PAYLOAD]`

Wrap the domain payload in `{ "success": true, "message": "[MESSAGE]", "data": [DOMAIN PAYLOAD] }` without changing source-defined fields or message semantics.

Preserve the source status and message through `{ "success": false, "statusCode": [STATUS], "message": "[MESSAGE]", "timestamp": "[ISO-8601]", "path": "[API PATH]" }`.

Handle relevant transaction, concurrency, idempotency, date/timezone, and data-precision behavior. Map entities/queries to existing tables and exact column/key definitions. Allow authorized DML only; never change schema/DBML/migration files, generate/run migrations or enable synchronization. Missing required structure is an input blocker.

## Prompt B: Frontend UI

### Objective: Build the user interface according to the Figma design.

### UI Scope

- Route and parent view: `[ROUTE AND PARENT VIEW / N/A]`
- Component: `[COMPONENT NAME]`
- Source location: `[FRONTEND FILE]`
- Screen coverage: `[FLOW STEP ID -> FIGMA FRAME/NODE OR VISUAL VIEW]`

### Figma and Visual Specification

### Design Targets

- Dataset version and checksum: `[DATASET VERSION AND CHECKSUM / N/A]`
- Frames and nodes: `[EXACT FRAME/NODE NAMES AND IDS / N/A]`

### Elements and Hierarchy

- Visible content: `[EXACT LABELS, HEADINGS, BODY TEXT, VALUES, AND PLACEHOLDERS]`
- Controls: `[BUTTONS, INPUTS, LINKS, MENUS, ICON CONTROLS, AND THEIR VISIBLE LABELS]`
- Containers and hierarchy: `[PARENT/CHILD STRUCTURE AND GROUPING]`
- Order and placement: `[VISUAL ORDER, ALIGNMENT, AND PLACEMENT]`

### Visual Tokens

- Dimensions: `[WIDTHS, HEIGHTS, MIN/MAX SIZES, AND SHAPE/RADIUS VALUES]`
- Spacing: `[PADDING, MARGINS, GAPS, AND GRID VALUES]`
- Typography: `[FONT FAMILY, SIZE, WEIGHT, LINE HEIGHT, AND ALIGNMENT]`
- Colors and effects: `[FOREGROUND/BACKGROUND/BORDER COLORS, SHADOWS, AND OPACITY]`
- Assets and icons: `[ASSET/ICON IDENTITY, SOURCE, SIZE, AND PLACEMENT / N/A]`

### Visual Variants

- Default: `[FRAME/NODE AND EXACT APPEARANCE]`
- Empty: `[FRAME/NODE AND EXACT APPEARANCE / N/A]`
- Loading: `[FRAME/NODE AND EXACT APPEARANCE / N/A]`
- Error: `[FRAME/NODE AND EXACT APPEARANCE / N/A]`
- Success: `[FRAME/NODE AND EXACT APPEARANCE / N/A]`

### Responsive Behavior

- Breakpoints: `[BREAKPOINTS / N/A]`
- Resizing and reflow: `[WIDTH/HEIGHT RULES, WRAPPING, STACKING, AND OVERFLOW / N/A]`

Use the existing styling system and component conventions without adding interaction, validation or error behavior to this prompt.

## Prompt C: Frontend Logic and API Integration

### Objective: Implement successful frontend interaction logic and API integration when applicable.

- Component: `[COMPONENT NAME]`
- Source location: `[FRONTEND FILE]`
- Interaction entry point: `[EVENT HANDLER OR USER TRIGGER]`

### State Model

- State approach: `[LOCAL STATE / FORM LIBRARY / STORE / EXISTING PROJECT APPROACH]`
- Data state: `[FIELD, TYPE, INITIAL VALUE, AND SUCCESSFUL UPDATE / N/A]`
- Session state: `[FIELD, TYPE, INITIAL VALUE, AND SUCCESSFUL UPDATE / N/A]`

### API Integration

Repeat this block for every endpoint invoked by the frontend:

- Function: `[FUNCTION NAME]`
- API identity: `[API ID / N/A]`
- Request target: `[HTTP METHOD AND API PATH / N/A]`
- Client or service: `[EXISTING CLIENT/SERVICE AND SOURCE LOCATION / N/A]`
- Authentication attachment: `[TOKEN/COOKIE/HEADER ATTACHMENT APPROACH / N/A]`

### Request Mapping

- Path mapping: `[UI/STATE VALUE -> PATH PARAMETER / N/A]`
- Query mapping: `[UI/STATE VALUE -> QUERY PARAMETER / N/A]`
- Body mapping: `[UI/STATE VALUE -> REQUEST BODY FIELD / N/A]`

### Success Mapping

- Success status and response fields: `[STATUS; EXACT RESPONSE FIELDS AND TYPES / N/A]`
- State update: `[STATE CHANGES / N/A]`
- Session update: `[SESSION CHANGES / N/A]`
- Navigation: `[DESTINATION AND CONDITION / N/A]`
- Data refresh: `[REFRESH/INVALIDATION ACTION / N/A]`

If no API call is defined, write `N/A` for the API integration and mappings and implement only the specified local interaction.

### Successful Interaction Sequence

Implement the Basic/Main and successful Alternative client behavior in Flow order:

1. `[BASIC/MAIN OR SUCCESSFUL ALTERNATIVE FLOW STEP ID: USER/SYSTEM TRIGGER -> STATE OR REQUEST ACTION -> SUCCESS OUTCOME]`
2. `[BASIC/MAIN OR SUCCESSFUL ALTERNATIVE FLOW STEP ID: USER/SYSTEM TRIGGER -> STATE OR REQUEST ACTION -> SUCCESS OUTCOME]`
3. `[...]`

Preserve API request idempotency where applicable.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, loading state, and API error handling.

- Component: `[COMPONENT NAME]`
- Source location: `[FRONTEND FILE]`
- Function or handler: `[FUNCTION NAME]`

### Loading State

- Loading condition: `[EXACT CONDITION]`
- Disabled controls: `[CONTROL NAMES / N/A]`
- Loading visual: `[SPINNER, TEXT, SKELETON, OR OTHER APPEARANCE / N/A]`
- Duplicate prevention: `[SUBMISSION/REQUEST GUARD BEHAVIOR / N/A]`

### Client-Side Validation

Repeat for every specified client validation:

- Field or input: `[FIELD/INPUT NAME]`
- Invalid condition: `[EXACT CONDITION]`
- Message: `[EXACT MESSAGE]`
- Display location: `[EXACT LOCATION]`
- Trigger time: `[ON CHANGE / ON BLUR / ON SUBMIT / OTHER]`

### Error and Recovery Matrix

Repeat for every specified API, client or runtime failure:

- Failure source and condition: `[API/CLIENT/RUNTIME CONDITION AND STATUS / N/A]`
- UI message: `[EXACT MESSAGE]`
- Display location: `[EXACT LOCATION]`
- State change: `[STATE/SESSION CHANGE / N/A]`
- Recovery: `[RETRY, NAVIGATION, RESET, OR OTHER RECOVERY / N/A]`
- Terminal outcome: `[EXACT TERMINAL OUTCOME]`

Cover every Alternative and Exception Flow assigned to client-side validation, failed requests, error presentation or recovery, including its exact terminal outcome.

Backend validation remains authoritative.

Do not call the API when client-side validation fails.

