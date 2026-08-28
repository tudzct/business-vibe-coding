# Prompt template notes

## Full prompt variant (Prompts A-F)
- A: backend/API and domain logic (references Prompt E).
- B: frontend UI from the applicable frozen design.
- C: frontend state and API integration.
- D: validation, loading and error behavior (references Prompt E).
- E: every frozen Business Rule with ID, representation, exact expression/text, context, enforcement layer, failure behavior and traceability.
- F: project/database/source context, priority and source-only/no-tests limits.

## RQ3 ablation variant (Prompts A-D)
- A: backend/API and domain logic without Prompt E references.
- B: frontend UI from the applicable frozen design.
- C: frontend state and API integration without Prompt E references.
- D: validation, loading and error behavior from basic flows.
- E: omitted.
- F: omitted.

OCL is preserved verbatim in the frozen BR baseline and in Prompt E for Full runs. A rule that cannot be expressed adequately in OCL stays in natural language. Missing information is recorded as unresolved, never guessed. In both variants, evaluation against the frozen BR baseline remains identical.
