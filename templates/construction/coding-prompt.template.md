---
artifact_type: coding-prompt
status: Draft | Approved
uc_id: <UC-ID>
uc_name: <Use case name>
generated_at: <ISO-8601 timestamp>
---

# <UC-ID> Coding Prompt - <Use case name>

## Authoring and Synthesis Instructions


1. **Self-Contained Implementation Handoff**: Treat the completed Coding Prompt as a self-contained implementation specification. Inline the concrete details requested by every placeholder directly into its responsible section so downstream implementation never reopens the original project inputs. Never fill a placeholder with only a file path, identifier, or instruction to reopen an input later. Do not copy unrelated source content merely because it is available.
2. **Completeness, `N/A` Policy, and Input Gaps**: Leave no placeholder unresolved (`<...>` or `[...]`). Set frontmatter `status: Draft` when generating the draft. Use `N/A` only when the validated inputs explicitly establish that the item is not applicable. If a required value is missing, contradictory, or ambiguous across inputs, stop and report the exact input gap; never fabricate, assume, or generalize a missing API, screen, database structure, threshold, status, message, or constraint.
3. **Section Structure and Flow Distribution**: Preserve the exact heading order and each section's responsibility boundary without unnecessary duplication across sections. Distribute Use Case behaviors so every Basic/Main, Alternative, and Exception Flow and its terminal outcome is covered in its responsible prompt section without altering frozen scope.

Use-case context (extract from Input `(2)` active Use Case `uc-*.md`):

- Actors and roles: `[ACTORS, ROLES, AND RELEVANT PERMISSIONS]`
- Preconditions: `[PRECONDITIONS / N/A]`
- Postconditions: `[SUCCESS AND FAILURE POSTCONDITIONS / N/A]`
- Flow inventory: `[ORDERED BASIC/MAIN, ALTERNATIVE, AND EXCEPTION FLOW IDS WITH TERMINAL OUTCOMES]`

## Prompt A: Backend API

### Objective: Build the API endpoint, logic, validation, and server-side error handling.

Synthesize from Input `(2)` Use Case (server-side Flow steps), Input `(4)` ordered API contracts, Input `(5)` `schema.dbml`, Input `(6)` read-only live database, and Input `(8)` `finalsource/be`. Populate Prompt A using strictly and only these authorized inputs; do not import, infer, or invent information from any other source.

### Backend Scope

- Domain classes and attributes: `[RELEVANT CLASSES; ATTRIBUTE NAMES, TYPES, AND REQUIRED/OPTIONAL STATUS / N/A]`
- Domain operations and enums: `[RELEVANT OPERATIONS, SIGNATURES, ENUMS, AND VALUES / N/A]`
- Domain relationships and types: `[RELEVANT RELATIONSHIPS, CARDINALITIES, AND TYPE DEFINITIONS / N/A]`
- Backend module and entry point: `[MODULE; CONTROLLER/HANDLER; ROUTE REGISTRATION / N/A]`
- Backend logic locations: `[SERVICE, DOMAIN, REPOSITORY, AND SUPPORTING FILES / N/A]`
- Backend Flow steps: `[FLOW IDS AND EXACT STEPS REQUIRING SERVER-SIDE PROCESSING / N/A]`

If `Related API IDs` is `None.` and no backend API is required, write `N/A` and do not create a placeholder endpoint or backend implementation.

Repeat this block for each related API in the exact order declared in `Related API IDs`:

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

Verify every table, column, type, key, and constraint against Input `(5)` `docs/00-context/engineering/schema.dbml` and Input `(6)` live database:

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

Transport envelope normalization (must not alter source-defined field names or message semantics):
- Wrap raw UC/API success fields in `{ "success": true, "message": "[MESSAGE]", "data": [DOMAIN PAYLOAD] }`.
- Format UC/API error status and message as `{ "success": false, "statusCode": [STATUS], "message": "[MESSAGE]", "timestamp": "[ISO-8601]", "path": "[API PATH]" }`.

Handle relevant transaction, concurrency, idempotency, date/timezone, and data-precision behavior. Map entities/queries strictly to existing tables and exact column/key definitions. Allow authorized DML only; never change schema/DBML/migration files, generate/run migrations or enable synchronization (`synchronize: false`, `migrationsRun: false`). Missing required database structure is an input blocker.

## Prompt B: Frontend UI

### Objective: Build the user interface according to the Figma design.

Synthesize from Input `(2)` Use Case screen flows, Input `(7)` resolved Figma snapshot JSON/node data, and Input `(8)` `finalsource/fe`. Keep this section strictly visual and structural. Populate Prompt B using strictly and only these authorized inputs; do not import, infer, or invent information from any other source.

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

Use the existing styling system and component conventions in `finalsource/fe` without adding interaction, validation or error behavior to this prompt.

## Prompt C: Frontend Logic and API Integration

### Objective: Implement successful frontend interaction logic and API integration when applicable.

Synthesize from Input `(2)` Use Case (Basic/Main Flow and successful Alternative Flows), Input `(4)` ordered API contracts, and Input `(8)` `finalsource/fe`. Populate Prompt C using strictly and only these authorized inputs; do not import, infer, or invent information from any other source.

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

Synthesize from Input `(2)` Use Case (Alternative and Exception Flows), Input `(4)` API error responses, and Input `(8)` `finalsource/fe`. Populate Prompt D using strictly and only these authorized inputs; do not import, infer, or invent information from any other source.

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


## Prompt E: Business Rules Compliance

### Objective: Implement the complete frozen Business Rule set for this use case without changing its meaning.

Synthesize from Input `(3)` active frozen Business Rule specification (`business_rule_path`), cross-referenced with Input `(2)` Use Case, Input `(4)` API contracts, Input `(5)` `schema.dbml`, and Input `(8)` `finalsource/` for enforcement layer and traceability.

### OCL Utility Definitions

~~~text
[VERBATIM OCL UTILITY DEFINITIONS, OR None]
~~~

Repeat the following block for every Business Rule in its exact frozen order from `business_rule_path`. One implementation control may enforce multiple rules when appropriate.

### Business Rule: `[BR-ID]`

- **Name:** `[RULE NAME]`
- **Representation:** `[OCL invariant | OCL precondition | OCL postcondition | natural language]`
- **Authoritative definition:**

~~~text
[VERBATIM COMPLETE RULE DEFINITION: context + inv/pre/post name + complete expression, or complete natural-language text]
~~~

- **Context:** `[OCL CONTEXT/CLASS/OPERATION OR BUSINESS SCOPE]`
- **Enforcement layer:** `[FRONTEND | BACKEND | DATABASE | MULTIPLE]`
- **Failure behavior:** `[SOURCE-BACKED STATUS/MESSAGE/STATE, OR UNRESOLVED]`
- **Traceability:** `[FLOW STEP/API/UI/SOURCE RANGE]`

Preserve all IDs, names, utility definitions, contexts, constraint names, expressions and authoritative natural-language text exactly.

Trace every Rule ID to its implementing controls without redefining the rule. Backend/database enforcement remains authoritative across trust boundaries; frontend enforcement is an additional user-experience control.

Do not invent missing thresholds, statuses, ownership, schema, enforcement layers or failure behavior.

## Prompt F: Implementation Context

### Objective: Apply the technical implementation context without changing the functional scope.

Synthesize from Input `(8)` `finalsource/` (manifests, lockfiles, configs, shared modules, and scripts) and Input `(5)` `schema.dbml`. Use only the implementation context embedded below and the current source under `finalsource/`. Do not reopen the original project inputs.

- Technical stack and versions: `[STACK, FRAMEWORKS, RUNTIMES, AND VERSIONS]`
- Project architecture: `[PROJECT-WIDE ARCHITECTURE AND MODULE BOUNDARIES]`
- Reusable infrastructure: `[SHARED CLIENTS, MODULES, COMPONENTS, UTILITIES, AND SERVICES]`
- Naming conventions: `[FILES, TYPES, VARIABLES, ROUTES, AND DATABASE MAPPINGS]`
- Style conventions: `[FORMATTING AND IMPLEMENTATION STYLE]`
- Manifests and package manager: `[MANIFEST FILES, LOCKFILES, AND PACKAGE MANAGER]`
- Build command: `[BUILD COMMAND]`
- Lint command: `[LINT COMMAND / N/A]`
- Typecheck command: `[TYPECHECK COMMAND / N/A]`
- Immutable technical boundaries: `[CROSS-CUTTING SOURCE AND RUNTIME BOUNDARIES]`

Priority:

1. Approved functional requirements.
2. Technical constraints embedded in this section.
3. Current source conventions where they do not conflict with the approved requirements.
