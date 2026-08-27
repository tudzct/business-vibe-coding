---
name: gen-coding-prompt
description: Generate a complete Business Coding Prompt A-F from one frozen Sheet-derived use-case file and its Business Rules, without asking the user to paste source content; never generate tests.
---

# Generate Business Coding Prompt

Accept one readable `docs/01-inception/use-cases/uc-*.md` path. Treat it as immutable and verify its Sheet provenance.

1. Read `PROJECT_CONTEXT.md`, source/workflow rules and `templates/construction/coding-prompt.template.md`.
2. Resolve referenced API/Figma sources without guessing. For Figma-backed UCs, use `resolve-figma-design-dataset` and the mapping authority in `FIGMA-LINK-REVIEW.md`.
3. Invoke `gen-business-rule-resource`; require exact equality between source-order BR IDs, the frozen resource and baseline receipt.
4. Fill Prompts A-D from UC/API/Figma inputs. Apply the standard response envelope without changing domain status, fields or message semantics.
5. Insert the deterministic Prompt E projection verbatim. Fill Prompt F with source priority and implementation boundaries.
6. If information is missing, record it; stop for the researcher when it changes business meaning, API, ownership, schema or destructive behavior.
7. Write `docs/02-construction/coding-prompts/<UC-ID>-business-coding-prompt.md`, report its status and do not paste the full prompt unless requested.

Do not edit frozen UCs or create/run tests.
