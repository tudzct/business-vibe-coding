# Two-phase Business Vibe Coding method

## Phase 1 — Generate Business Coding Prompt

Inputs: frozen UC/UML/BR projection, OCL utilities, applicable API/Figma source, existing project context and Prompt A-F template.

1. Verify provenance and checksum of the UC projection.
2. Extract every Business Rule in source order; preserve OCL and authoritative natural language verbatim.
3. Validate the existing Business Rule resource, BR/flow baselines and Canonical Run JSON prepared by the researcher's chosen tool before invocation. Missing or invalid inputs stop generation; no creation skill is mandatory and preflight never creates them.
4. Produce Prompts A-D from functional/UI/API inputs, Prompt E from the frozen BR resource, and Prompt F from implementation context and source priority.
5. Stop for researcher resolution if an ambiguity changes rule semantics, public API, ownership, schema or destructive behavior.
6. Researcher approves the prompt.

## Phase 2 — Generate Source Code

Inputs: approved prompt, existing codebase, database summary and project rules.

1. Validate the existing activation receipt for exactly one configured run, regardless of its preparation tool, then capture model/time metadata.
2. Generate only the source needed for the UC.
3. Preserve first-pass evidence, then assess every frozen BR from inspectable source/build/runtime evidence.
4. For an evidenced defect, create one bounded repair sub-prompt, apply the smallest fix and reassess affected BRs.
5. Complete permitted lint/typecheck/build and Docker runtime observations; do not create or run tests.
6. Freeze the final source hash and finalize the run record.

This is a two-phase research workflow, not an enterprise AI-DLC process.
