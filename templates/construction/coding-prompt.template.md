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

Build `[HTTP METHOD] [API PATH]` in `[BACKEND LOCATION]` for `[UC/API ID]`.

- Access: `[PUBLIC / AUTHENTICATED]`
- Request: `[BODY / QUERY / PATH PARAMS]`
- Main logic: `[SERVICE / USE-CASE LOCATION]`
- Success payload: `[UC DOMAIN PAYLOAD]`
- Normalized success: `{ "success": true, "message": "[MESSAGE]", "data": [DOMAIN PAYLOAD] }`
- Errors: preserve the UC status/message through the standard error envelope.

Implement every backend/database-applicable rule in Prompt E. Do not invent behavior, dependencies or schema changes.

## Prompt B: Frontend UI

Build `[COMPONENT]` for `[UC-ID]` from the frozen Figma dataset `[DATASET/NODE/CHECKSUM or N/A]`.

- Required elements: `[ELEMENTS]`
- Required states: `[STATES]`
- UC-backed controls are functional; design-only controls remain visual unless a source defines behavior.
- If a UC-required control is absent, add the smallest design-consistent element and record the mapping decision.

Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

Connect `[COMPONENT]` to `[HTTP METHOD] [API PATH]` using the existing API client.

- Request: `[PAYLOAD]`
- Success: read the domain payload from the normalized response data.
- Ordered success actions: `[STATE / NAVIGATION / MESSAGE]`
- Implement every frontend-applicable rule in Prompt E and no unsupported behavior.

## Prompt D: Validation and Error Handling

- Client validation: `[SOURCE-BACKED CONSTRAINTS]`
- Loading/duplicate prevention: `[CONTROLS AND INDICATOR]`
- Error mapping: `[STATUS/CONDITION -> MESSAGE/LOCATION]`
- Backend enforcement remains authoritative where a rule cannot be guaranteed by the client.

## Prompt E: Business Rules Compliance

Insert the ordered rule projection generated from the frozen Business Rule resource without changing its semantics.

### Business Rule: `[BR-ID]`

- **Name:** `[rule name]`
- **Representation:** `OCL invariant | OCL precondition | OCL postcondition | natural language`
- **Expression / authoritative text:** `[verbatim Sheet-derived content]`
- **Context:** `[OCL context/class/operation or business scope]`
- **Enforcement layer:** `[frontend | backend | database | multiple]`
- **Failure behavior:** `[source-backed status/message/state, or unresolved]`
- **Traceability:** `[UC step/API/UI/source range]`

Preserve OCL exactly. Natural-language rules remain authoritative when OCL cannot express them. Do not infer missing thresholds, statuses, ownership, schema, or failure behavior; record an unresolved item and stop for the researcher when it changes implementation.

## Prompt F: Implementation Context

Use Prompts A-E with the project rules, database summary, frozen UC/UML/BR specification, Business Rule resource and applicable Figma/API sources.

Priority:

1. Canonical Sheet-derived UC, UML and Business Rules
2. Prompt E exact Business Rules
3. Approved API contract and database/project rules
4. Frozen Figma design
5. Existing source conventions

Generate source only. Do not create or run tests or test cases. Modify only files required by the UC, record generation/repair telemetry, assess every frozen BR, and freeze the final source hash.
