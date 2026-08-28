---
artifact_type: business-coding-prompt
prompt_variant: rq3-ad
status: Draft | Approved
uc_id: <UC-ID>
uc_name: <Use case name>
source_use_case: docs/01-inception/use-cases/<use-case-file>.md
business_rule_baseline: docs/02-construction/implementation/<UC-ID>/business-rule-baseline.json
generated_at: <ISO-8601 timestamp>
---

# <UC-ID> Business Coding Prompt (RQ3) - <Use case name>

## Prompt A: Backend API

Build `[HTTP METHOD] [API PATH]` in `[BACKEND LOCATION]` for `[UC/API ID]`.

- Access: `[PUBLIC / AUTHENTICATED]`
- Request: `[BODY / QUERY / PATH PARAMS]`
- Main logic: `[SERVICE / USE-CASE LOCATION]`
- Success payload: `[UC DOMAIN PAYLOAD]`
- Normalized success: `{ "success": true, "message": "[MESSAGE]", "data": [DOMAIN PAYLOAD] }`
- Errors: preserve the UC status/message through the standard error envelope.

Implement backend/database behaviors derived strictly from the use-case functional specification, UML model, and API contract. Do not invent behavior, dependencies or schema changes.

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
- Implement frontend behaviors derived strictly from the use-case functional specification, basic flows, and UI/API interactions. Do not implement unsupported behavior.

## Prompt D: Validation and Error Handling

- Client validation: `[SOURCE-BACKED CONSTRAINTS]`
- Loading/duplicate prevention: `[CONTROLS AND INDICATOR]`
- Error mapping: `[STATUS/CONDITION -> MESSAGE/LOCATION]`
- Backend enforcement remains authoritative where a rule cannot be guaranteed by the client.
