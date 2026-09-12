---
name: gen-coding-prompt
description: Generate a Full Prompt A-F or RQ3 Prompt A-D from one frozen Sheet-derived use case, without asking the user to paste source content; never generate tests.
---

# Generate Business Coding Prompt

Accept one readable `docs/01-inception/use-cases/uc-*.md` path and optional `--variant [full|rq3]`. Resolve the variant from the configured UC/run; an explicit argument must match it, and a configured RQ3 run must never silently default to Full. Treat UC as immutable and verify its Sheet provenance.

Read [shared Full/RQ3 contract](../../../docs/00-context/workflow/FULL-RQ3-CONTRACT.md) and the shared timing protocol. Resolve the configured UC/run identity and initialize Draft bookkeeping without activation. Complete input/configuration/BR-resource/flow-baseline/Figma preflight before START. Capture prompt START immediately before generation and END after persistence. Show Prompt Gate; when confirmed, `advance-experiment-gate` approves the Draft and closes telemetry internally in a later turn. Do not start source in either turn.

1. Read `PROJECT_CONTEXT.md`, source/workflow rules and corresponding template: `templates/construction/coding-prompt.template.md` for `full`, or `templates/construction/coding-prompt-rq3.template.md` for `rq3`.
2. Resolve referenced API/Figma sources without guessing. For API definitions, read the corresponding detailed API contract from `docs/01-inception/api-contracts/<API-ID>.md` if it exists. For Figma-backed UCs, use `resolve-figma-design-dataset` and the mapping authority in `FIGMA-LINK-REVIEW.md`.
3. Invoke `gen-business-rule-resource`; require exact equality between source-order BR IDs, resource and BR baseline. Freeze the complete Main/Alternative/Exception Flow denominator under `flow-baseline.json` using `audit-flow-accuracy` guidance before prompt generation.
4. Capture the live prompt START now that required inputs and gates are ready. Fill Prompts A-D from functional UC/UML/API/Figma inputs, covering every frozen Basic/Main, Alternative and Exception Flow, including branch-specific terminal outcomes. Baseline preparation is evaluation bookkeeping; for RQ3, do not copy, paraphrase or infer additional requirements from excluded BR/OCL resources into A-D. Apply the standard response envelope without changing domain status, fields or message semantics. For `rq3`, ensure the artifact contains only Prompts A-D and does not reference or reveal Prompt E, Prompt F, the Business Rule resource or baseline.
5. If `full`, insert the deterministic Prompt E projection verbatim and fill Prompt F with source priority and implementation boundaries. If `rq3`, omit Prompts E and F together.
6. If information is missing, record it; stop for the researcher when it changes business meaning, API, ownership, schema or destructive behavior.
7. Write target prompt: `docs/02-construction/coding-prompts/<UC-ID>-business-coding-prompt.md` (for `full`) or `docs/02-construction/coding-prompts/<UC-ID>-rq3-coding-prompt.md` (for `rq3`). Immediately capture END after the complete Draft is persisted, before researcher review. Validate the Draft with `scripts/validate_prompt_contract.py --configuration <config.json> --uc-id <UC-ID> --run-id <RUN-ID> --prompt <prompt.md> --allow-draft`. Review flow coverage and input provenance separately: structural validation cannot detect semantic leakage. Report its status and do not paste the full prompt unless requested. At confirmed Prompt Gate, persist approval, then store the approved artifact path/SHA-256 in canonical `coding_prompt` before closing that gate.

Do not edit frozen UCs or create/run tests.
