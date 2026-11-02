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

- Domain/UML model: `[RELEVANT CLASSES, ATTRIBUTES, OPERATIONS, ENUMS, RELATIONSHIPS, AND TYPE DEFINITIONS / N/A]`
- Backend locations: `[MODULE / CONTROLLER / HANDLER / SERVICE / DOMAIN FILES / N/A]`
- Backend Flow steps: `[FLOW IDS AND EXACT STEPS REQUIRING SERVER-SIDE PROCESSING / N/A]`

If no backend API is required, write `N/A` and do not create a placeholder endpoint or backend implementation.

Repeat this block for each related API in declared order:

### API: `[API ID]` - `[HTTP METHOD] [API PATH]`

- Access: `[PUBLIC / PROTECTED; AUTHENTICATION, HEADERS, IDENTITY, AND AUTHORIZATION CONTEXT]`
- Request: `[PATH/QUERY/BODY DTO NAMES AND FIELDS WITH TYPES, REQUIRED/OPTIONAL STATUS, AND SERVER VALIDATION]`
- Processing: `[ORDERED BACKEND ACTIONS, STATE TRANSITIONS, AND FLOW OUTCOMES]`
- Database mapping: `[TABLES, COLUMNS, TYPES, KEYS, RELATIONSHIPS, CONSTRAINTS, FILTERS, AND ORDERING / N/A]`
- Database use: `[REQUIRED EXISTING DATA; AUTHORIZED WRITES; TRANSACTION BOUNDARY / N/A]`
- Success: `[HTTP STATUS, SOURCE-DEFINED MESSAGE, AND EXACT RESPONSE DTO/DOMAIN PAYLOAD FIELDS/TYPES]`
- Errors: `[CONDITION -> ERROR TYPE/HTTP STATUS -> SOURCE-DEFINED MESSAGE/PAYLOAD]`

Wrap the domain payload in `{ "success": true, "message": "[MESSAGE]", "data": [DOMAIN PAYLOAD] }` without changing source-defined fields or message semantics.

Preserve the source status and message through `{ "success": false, "statusCode": [STATUS], "message": "[MESSAGE]", "timestamp": "[ISO-8601]", "path": "[API PATH]" }`.

Handle relevant transaction, concurrency, idempotency, date/timezone, and data-precision behavior. Map entities/queries to existing tables and exact column/key definitions. Allow authorized DML only; never change schema/DBML/migration files, generate/run migrations or enable synchronization. Missing required structure is an input blocker.

## Prompt B: Frontend UI

### Objective: Build the user interface according to the Figma design.

### UI Scope

- Route, component and source location: `[ROUTE / PARENT VIEW; COMPONENT; FRONTEND FILE / N/A]`
- Screen coverage: `[FLOW STEP ID -> FIGMA FRAME/NODE OR VISUAL VIEW]`

### Figma and Visual Specification

- Targets: `[DATASET; FRAME/NODE NAMES AND IDS; CHECKSUM / N/A]`
- Elements and hierarchy: `[CONTENT, CONTROLS, CONTAINERS, ORDER, AND VISUAL PLACEMENT]`
- Visual tokens: `[DIMENSIONS, SPACING, TYPOGRAPHY, COLORS, ASSETS, AND ICONS]`
- Visual variants: `[FIGMA FRAME/NODE AND VISUAL TOKENS FOR DEFAULT, EMPTY, LOADING, ERROR, AND SUCCESS APPEARANCE / N/A]`
- Responsive behavior: `[BREAKPOINT OR RESIZING BEHAVIOR / N/A]`

Use the existing styling system and component conventions without adding interaction, validation or error behavior to this prompt.

## Prompt C: Frontend Logic and API Integration

### Objective: Implement successful frontend interaction logic and API integration when applicable.

- Frontend target: `[COMPONENT, SOURCE LOCATION, AND INTERACTION ENTRY POINT]`
- State approach and model: `[APPROACH; DATA/SESSION FIELD, TYPE, INITIAL VALUE, AND SUCCESSFUL UPDATE]`
- API integration: `[FUNCTION; API ID; HTTP METHOD; API PATH; EXISTING CLIENT/SERVICE; AUTHENTICATION ATTACHMENT APPROACH / N/A]`
- Request mapping: `[UI/STATE VALUE -> PATH/QUERY/BODY FIELD / N/A]`
- Success mapping: `[SUCCESS STATUS AND RESPONSE FIELDS -> STATE/SESSION/NAVIGATION/REFRESH ACTION]`

Repeat the API integration and mappings for every endpoint invoked by the frontend. If no API call is defined, write `N/A` and implement only the specified local interaction.

### Successful Interaction Sequence

Implement the Basic/Main and successful Alternative client behavior in Flow order:

1. `[BASIC/MAIN OR SUCCESSFUL ALTERNATIVE FLOW STEP ID: USER/SYSTEM TRIGGER -> STATE OR REQUEST ACTION -> SUCCESS OUTCOME]`
2. `[BASIC/MAIN OR SUCCESSFUL ALTERNATIVE FLOW STEP ID: USER/SYSTEM TRIGGER -> STATE OR REQUEST ACTION -> SUCCESS OUTCOME]`
3. `[...]`

Preserve API request idempotency where applicable.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, loading state, and API error handling.

Refine `[FUNCTION NAME]` in `[COMPONENT NAME]`.

### Loading State

- `[LOADING CONDITION -> DISABLED CONTROLS, LOADING VISUAL, AND DUPLICATE-PREVENTION BEHAVIOR]`

### Client-Side Validation

Implement every specified client validation:

- `[FIELD/CONDITION -> EXACT MESSAGE -> DISPLAY LOCATION AND TRIGGER TIME]`

### Error and Recovery Matrix

- `[API/CLIENT/RUNTIME FAILURE CONDITION -> UI MESSAGE -> STATE CHANGE -> RETRY/NAVIGATION/TERMINAL OUTCOME]`

Cover every Alternative and Exception Flow assigned to client-side validation, failed requests, error presentation or recovery, including its exact terminal outcome.

Backend validation remains authoritative.

Do not call the API when client-side validation fails.

## Prompt E: Business Rules Compliance

### Objective: Implement the complete frozen Business Rule set for this use case without changing its meaning.

### OCL Utility Definitions

~~~text
[VERBATIM OCL UTILITY DEFINITIONS, OR None]
~~~

Repeat the following block for every Business Rule in frozen order. One implementation control may enforce multiple rules when appropriate.

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

Use only the implementation context embedded below and the current source under `finalsource/`. Do not reopen the original project inputs.

- Technical stack and versions: `[STACK, FRAMEWORKS, RUNTIMES, AND VERSIONS]`
- Project rules and architecture: `[PROJECT-WIDE ARCHITECTURE, REUSABLE INFRASTRUCTURE, NAMING, AND STYLE CONVENTIONS]`
- Relevant manifests and commands: `[MANIFESTS, PACKAGE MANAGER, BUILD, LINT, AND TYPECHECK COMMANDS]`
- Immutable technical boundaries: `[CROSS-CUTTING SOURCE AND RUNTIME BOUNDARIES]`

Priority:

1. Approved functional requirements.
2. Technical constraints embedded in this section.
3. Current source conventions where they do not conflict with the approved requirements.
