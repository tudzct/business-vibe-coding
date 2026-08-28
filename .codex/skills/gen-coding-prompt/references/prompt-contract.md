# Prompts contract

## Full prompt variant (Prompts A-F)
- A: backend endpoint, DTO, domain logic, persistence impact and response/error behavior (references Prompt E).
- B: source-backed UI and visual states.
- C: typed client integration, state and success flow.
- D: validation, loading, exceptions and recovery (references Prompt E).
- E: exact ordered projection of all frozen Business Rules.
- F: project/database/source context, priority, source-only and no-tests limits.

## RQ3 ablation variant (Prompts A-D)
- A: backend endpoint, DTO, domain logic and API response envelope derived directly from functional specification and UML (no Prompt E references).
- B: source-backed UI and visual states.
- C: typed client integration, state and success flow (no Prompt E references).
- D: validation, loading, exceptions and recovery derived from basic flows.
- E: omitted.
- F: omitted.

Raw UC success fields become the domain payload in the standard success envelope; UC error status/message use the standard error envelope. This transport normalization must not change business meaning.
