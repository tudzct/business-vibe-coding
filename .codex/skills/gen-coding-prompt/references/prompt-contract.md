# Prompts A-F contract

- Prompt A: NestJS endpoint, DTO, service, repository/entity impact and response/error contract. Preserve UC status, payload fields and safe messages while automatically adapting raw examples to the approved global success/error envelopes.
- Prompt B: exact-scope Figma UI, components, accessibility and visual states.
- Prompt C: typed API service, state/data flow, routing and success behavior.
- Prompt D: client validation, loading, exceptions, recovery and safe errors.
- Prompt E: exact selected-record projection from the canonical security catalog JSON using `format_security`. Only Requirement ID is mechanically derived. A missing-field supplement may use only the same record's declared primary source URL and must retain provenance.
- Prompt F: project context and priority; source code only; no functional tests/test cases; preserve TechnicalReport-derived behavior; record generation/repair telemetry and freeze final source without invoking security tools.

Prompts A-D are the functional baseline derived from `resource/TechnicalReport.pdf` and the approved UC/API artifacts. `resource/BUSINESS_PROMPT_TEMPLATE.docx` is an external structural reference only. Prompt E is the only added experimental component and contains Security Requirements. Do not generate a separate Business Requirements/Business Rules Compliance prompt. AC/BR IDs remain only for source traceability, not scored metrics.

## Approved response normalization

- Raw UC success objects define the domain payload. Put them under `data` in `{ success: true, message, data }`, retaining any UC business message as the envelope message rather than duplicating it inside `data` when semantically equivalent.
- Raw UC errors define the HTTP status and safe message. Emit them through `{ success: false, statusCode, message, timestamp, path }` and never preserve unsafe internal details.
- Frontend prompts must consume the normalized envelope.
- This mapping is a standing project decision, not an ambiguity and not a reason to ask the user again.
- Stop only if normalization cannot preserve the UC's status, business fields or message meaning without changing the public contract.
