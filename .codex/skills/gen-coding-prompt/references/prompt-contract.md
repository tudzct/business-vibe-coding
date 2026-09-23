# Prompts contract

## Full prompt variant (Prompts A-F)
- A: backend endpoint, DTO, domain logic, persistence impact and response/error behavior.
- B: source-backed UI and visual states.
- C: typed client integration, state and success flow.
- D: validation, loading, exceptions and recovery.
- E-F: included from the configured Full template.

Raw UC success fields become the domain payload in the standard success envelope; UC error status/message use the standard error envelope. This transport normalization must not change business meaning.

The configured DBML is shared technical input in A/D for Full. Apply the [shared operational constitution](../../../../AGENTS.md#shared-operational-constitution) and existing database preflight.
