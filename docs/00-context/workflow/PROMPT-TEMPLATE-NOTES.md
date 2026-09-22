# Prompt template notes

## Full prompt variant (Prompts A-F)
- A: backend/API and domain logic.
- B: frontend UI from the applicable frozen design.
- C: frontend state and API integration.
- D: validation, loading and error behavior.
- E-F: included from the configured Full template.

## RQ3 ablation variant (Prompts A-D)
- A: backend/API and domain logic without Prompt E references.
- B: frontend UI from the applicable frozen design.
- C: frontend state and API integration without Prompt E references.
- D: validation, loading and error behavior from all applicable Basic/Main, Alternative and Exception Flows and functional/UI/API specifications.
- E: omitted.
- F: omitted.

OCL is preserved verbatim in the frozen BR baseline. A rule that cannot be expressed adequately in OCL stays in natural language. Missing information is recorded as unresolved, never guessed.

Validate prompt structure and provenance using the existing prompt contract. Evaluation against the frozen BR baseline remains identical in both variants.
