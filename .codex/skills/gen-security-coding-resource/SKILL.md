---
name: gen-security-coding-resource
description: Generate a use-case-specific, one-point-per-requirement security coding resource for OWASP Top 10:2025 A01–A10. Use before coding-prompt generation to freeze Prompt E requirements; do not generate functional test cases.
---

# Generate Security Coding Resource

Read `PROJECT_CONTEXT.md`, the approved use case, the experiment/security gates, `templates/research/security-scope-activation.template.json`, `templates/construction/security-resource.template.json` and `references/security-baseline.md`. Inspect affected code/dependencies.

1. Resolve the UC and Confirmed configuration. Create compact `security-scope-activation.json`, then resolve and validate the exact scope directly from the configuration. Never infer/default or duplicate scope fields in the receipt.
2. Identify assets, actors, trust boundaries, entry points, data classes, object ownership, configuration and dependency changes only as separate UC traceability metadata. Never use that analysis to rewrite, extend or specialize a catalog SR.
3. Read the 50 active A01–A10 SEC records only from `docs/00-context/security/OWASP-2025-SECURITY-CATALOG.json`; it is the sole AI-authoritative catalog. Never parse `OWASP-2025-SECURITY-SCORING.md` or search arbitrary external sources. Follow the recorded gate exactly. For `researcher_selected`, project only the explicit IDs. For `all_catalog`, project all 50 and freeze 5 SEC per category, overall=50. Reject IDs outside A01–A10 for new runs.
4. Run `scripts/render_prompt_e.py --uc-id <UC-ID> --selected <exact SEC IDs>` (or `--all`) to perform the deterministic projection. The only permitted derived security field is `Requirement ID`, mechanically formed as `SR-<UC-ID>-<category-and-ordinal-from-SEC-ID>`.
5. Copy every selected catalog record exactly. Do not paraphrase, translate, reinterpret, specialize, merge, split or shorten its fields. If and only if a required field is empty or explicitly states that it is not specified/not populated, open only that record's `primary_source_url`. Extract only text explicitly stated there and store it as a separate `source_supplements` entry with target field, URL, retrieval time, source location and extracted text. Never overwrite `catalog_entry`, follow another URL, use a different source or infer missing content. If the declared URL does not resolve the field explicitly, mark it unresolved and stop for researcher review.
6. Keep source supplements, AC/BR IDs, affected layers and evidence locations separate from the exact `catalog_entry`. Neither supplements nor traceability may change or create an SR. Freeze the selected SEC/SR list and totals before source generation.
7. Write canonical `docs/02-construction/security-resources/<UC-ID>-security.json`. Store each selected requirement as a mechanical `sr_id` plus an exact `catalog_entry` snapshot and separate traceability metadata.
8. Return the security-resource path and continue to coding-prompt generation.

Do not create or run tests/test cases. Acceptance criteria are used by `$audit-generation-metrics` for review.
