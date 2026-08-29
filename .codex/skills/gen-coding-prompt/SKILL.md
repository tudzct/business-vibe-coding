---
name: gen-coding-prompt
description: Generate a Full Prompt A-F or RQ3 Prompt A-D from one frozen Sheet-derived use case, without asking the user to paste source content; never generate tests.
---

# Generate Business Coding Prompt

Accept one readable `docs/01-inception/use-cases/uc-*.md` path and optional `--variant [full|rq3]` (defaults to `full`). Treat UC as immutable and verify its Sheet provenance.

1. Read `PROJECT_CONTEXT.md`, source/workflow rules and corresponding template: `templates/construction/coding-prompt.template.md` for `full`, or `templates/construction/coding-prompt-rq3.template.md` for `rq3`.
2. Resolve referenced API/Figma sources without guessing. For API definitions, read the corresponding detailed API contract from `docs/01-inception/api-contracts/<API-ID>.md` if it exists. For Figma-backed UCs, use `resolve-figma-design-dataset` and the mapping authority in `FIGMA-LINK-REVIEW.md`.
3. Invoke `gen-business-rule-resource`; require exact equality between source-order BR IDs, the frozen resource and baseline receipt (always required so Phase 2 evaluation has the identical ground truth baseline).
4. Fill Prompts A-D from UC/API/Figma inputs. Apply the standard response envelope without changing domain status, fields or message semantics. For `rq3`, ensure the artifact contains only Prompts A-D and does not reference or reveal Prompt E, Prompt F, the Business Rule resource or baseline.
5. If `full`, insert the deterministic Prompt E projection verbatim and fill Prompt F with source priority and implementation boundaries. If `rq3`, omit Prompts E and F together.
6. If information is missing, record it; stop for the researcher when it changes business meaning, API, ownership, schema or destructive behavior.
7. Write target prompt: `docs/02-construction/coding-prompts/<UC-ID>-business-coding-prompt.md` (for `full`) or `docs/02-construction/coding-prompts/<UC-ID>-rq3-coding-prompt.md` (for `rq3`). Report its status and do not paste the full prompt unless requested.

Do not edit frozen UCs or create/run tests.
