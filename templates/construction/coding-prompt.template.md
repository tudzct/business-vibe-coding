---
artifact_type: business-coding-prompt
status: Draft | Approved
uc_id: <UC-ID>
uc_name: <Use case name>
generated_at: <ISO-8601 timestamp>
---

# <UC-ID> Business Coding Prompt - <Use case name>

## Source Scope: Prompts A-D

Read the following materials before populating Prompts A-D:

- Active Use Case file: `docs/01-inception/use-cases/<ACTIVE-UC-FILE>.md`;
- API contract files: `docs/01-inception/api-contracts/<RELATED-API-CONTRACT>.md` (if the UC explicitly declares no related API, treat API inventory as empty);
- Database schema: `docs/00-context/engineering/schema.dbml`;
- Live database: the configured live database;
- Figma design dataset: `resource/figma-design-dataset/<DATASET-VERSION>/<SNAPSHOT-DIR>/`
- Existing source code: `finalsource/`;
- Technical and control sources: the `Technical and Control-Plane Material` defined in `.codex/skills/gen-coding-prompt/SKILL.md`.

Use the information obtained from these sources to follow every instruction below and complete every placeholder in the YAML frontmatter, title, and Prompts A-D:

1. Replace 100% of `<...>` and `[...]` placeholders with concrete, source-backed values. Never fabricate undocumented requirements, thresholds, endpoints, or rules.
2. **Prompts A, C, D (API vs. client-local):**
   - If the active use case has related API contract(s), fill all endpoint, auth, Request Format, Logic, Success Response, Error Handling, Request Payload, Loading State, API Error, and Client-Side Validation sections concretely grounded in the UC, API contracts, DBML, and existing `finalsource/` conventions.
   - If the active use case explicitly declares no related API (`api_contracts: []`), adapt Prompts A, C, and D to specify the client-local boundary and local/browser state behavior instead of leaving REST/HTTP placeholders (`[HTTP METHOD] [API PATH]`, `[API PATH FROM PROMPT A]`), and remove unused API sub-blocks.
3. **Prompt B (Figma reading & inline embedding):**
   - Inspect the checksum-valid frozen Figma dataset (`manifest.json`, `design-context.md`, `native-design.json`, `asset-map.json`, and `assets/*.svg`) to identify all frames relevant to the active use case using the UC name, purpose, application-user actions, screen titles, visible UI text, and semantically related terms.
   - If relevant frames cannot be identified unambiguously, stop during prompt generation and report the matching candidates instead of selecting/inventing a frame or emitting an incomplete prompt.
   - Extract and embed all target frame metadata (frame names, node IDs, native-design SHA-256 hashes), viewport scope (desktop-only vs. responsive per UC), layout dimensions, design tokens, component/modal/menu/fallback states, exact copy, and inline `<svg>...</svg>` markup (or CSS/HTML equivalents) directly into Prompt B. Never instruct downstream source generation to read or copy files from `resource/figma-design-dataset/...`.
4. **Cleanup when completing the coding prompt (MANDATORY):**
   - Delete ALL prompt-filling instructions once the coding prompt is completed, including:
     - this entire `## Source Scope: Prompts A-D` section;
     - any template meta-instructions or conditional generation directives (e.g., "Read the following materials...", "Use the information obtained...", "If relevant frames cannot be identified unambiguously, stop...", "Replace 100% of placeholders...").

## Prompt A: Backend API

### Objective: Build the API endpoint, business logic, validation, and server-side error handling.

Create the `[HTTP METHOD] [API PATH]` endpoint in `[BACKEND ENTRY POINT]`.

This endpoint MUST be `[PUBLIC / PROTECTED]`. If protected, use `[AUTHENTICATION MECHANISM]`.

### Request Format

`[REQUEST BODY / QUERY PARAMS / PATH PARAMS]`

Implement the main logic in `[BUSINESS LOGIC LOCATION]`.

### Logic

Implement the backend flow for `[USE CASE / API ID]`.

Enforce all applicable backend and database rules, including normalization, validation, authorization, persistence, transaction, concurrency, and sensitive-data handling.

### Success Response

`[SUCCESS RESPONSE]`

Wrap the domain payload in `{ "success": true, "message": "[MESSAGE]", "data": [DOMAIN PAYLOAD] }` without changing source-defined fields or message semantics.

### Error Handling

If `[ERROR CONDITION]`, return or throw `[ERROR TYPE / HTTP STATUS]` with `[ERROR RESPONSE]`.

Preserve the source status and message through `{ "success": false, "statusCode": [STATUS], "message": "[MESSAGE]", "timestamp": "[ISO-8601]", "path": "[API PATH]" }`.

Follow the existing project architecture. Do not introduce new architectural layers or dependencies.

Handle relevant ownership, transaction, concurrency, idempotency, date/timezone, and numeric precision and rounding rules. Use existing ORM mappings and migration conventions. Do not alter the schema without an explicit source requirement and researcher-approved schema proposal.

## Prompt B: Frontend UI

### Objective: Build the user interface according to the Figma design.

Create `[COMPONENT NAME]` using `[FRONTEND TECHNOLOGIES]`.

The component MUST display:

- `[UI ELEMENT 1]`
- `[UI ELEMENT 2]`
- `[UI ELEMENT 3]`

**Target Frames & Design Provenance:** `[IDENTIFIED FIGMA FRAME NAMES, NODE IDS, AND NATIVE-DESIGN SHA-256 HASHES]`

**Layout & Dimensions:** `[VIEWPORT SCOPE (DESKTOP-ONLY / RESPONSIVE), CONTAINER SIZES, PADDING, GAPS, ALIGNMENT, POSITIONING]`

**Design Tokens (Colors, Typography, Radii, Borders):** `[HEX/ALPHA COLORS, FONT FAMILY/SIZES/WEIGHTS/LINE-HEIGHTS/LETTER-SPACING, BORDER RADII, BORDERS, SCRIMS]`

**Component & State Specifications:** `[EXACT COPY, PLACEHOLDERS, ENABLED/DISABLED/MUTED/ACTIVE/LOADING/MODAL/MENU STATES, AND FALLBACK TREATMENTS]`

**Embedded Inline SVG Assets:** `[INLINE <svg>...</svg> MARKUP FOR EVERY ICON/GRAPHIC EXTRACTED FROM ASSET-MAP / ASSETS, OR PURE CSS EQUIVALENTS]`

### Implementation Requirements

STRICTLY implement the embedded UI specification and inline SVG assets above.

Ensure the layout, spacing, typography, colors, components, states, and responsive scope match the embedded specification.

Use the project's existing styling system and component conventions. UC-backed controls are functional; design-only controls remain visual unless a source defines behavior. If a UC-required control is absent, add the smallest design-consistent element and state the mapping decision explicitly.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect the frontend component to `[THE API / LOCAL STATE & BROWSER INTEGRATION]` and implement the successful flow.

Continue working on `[COMPONENT NAME]`.

Add the required state using `[STATE / FORM MANAGEMENT APPROACH]`.

Implement the asynchronous function `[FUNCTION NAME]` to `[SEND HTTP REQUEST TO API PATH FROM PROMPT A / EXECUTE LOCAL FLOW]`.

### Request Payload

`[REQUEST PAYLOAD OR LOCAL COMMAND STATE]`

Use the project's existing API client or request approach.

### Success Response

`[SUCCESS RESPONSE FROM PROMPT A OR LOCAL STATE OUTCOME]`

Read the domain payload from the normalized response data.

When successful:

1. `[SUCCESS ACTION 1]`
2. `[SUCCESS ACTION 2]`
3. `[UPDATE STATE / SESSION]`
4. `[NAVIGATE / REFRESH DATA]`

Preserve API request idempotency where applicable.

Normalize date/timezone and precision-sensitive numeric values according to the API contract and existing project conventions.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, loading state, and error handling.

Refine `[FUNCTION NAME]` in `[COMPONENT NAME]`.

### Loading State

When `[LOADING STATE]` is true:

- Disable `[SUBMIT / ACTION BUTTON]`.
- Display `[SPINNER / LOADING TEXT]`.
- Prevent duplicate submissions.

### API Error

If `[THE API RETURNS ERROR CONDITION / BROWSER OR LOCAL OPERATION FAILS]`:

- Display `[ERROR MESSAGE]`.
- Display the message at `[ERROR DISPLAY LOCATION]`.

### Client-Side Validation

Before calling `[THE API / OPERATION]`, enforce all applicable client-side validation rules for `[USE CASE / API ID]`.

Display validation messages at `[VALIDATION MESSAGE LOCATION]`.

Backend validation remains authoritative where backend endpoints apply.

Do not proceed with `[API CALL / OPERATION]` when client-side validation fails.
