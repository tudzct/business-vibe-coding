# Prompts A-F contract

- A: backend endpoint, DTO, domain logic, persistence impact and response/error behavior.
- B: source-backed UI and visual states.
- C: typed client integration, state and success flow.
- D: validation, loading, exceptions and recovery.
- E: exact ordered projection of all frozen Business Rules.
- F: project/database/source context, priority, source-only and no-tests limits.

Raw UC success fields become the domain payload in the standard success envelope; UC error status/message use the standard error envelope. This transport normalization must not change business meaning.
