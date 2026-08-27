# Security baseline

Read `docs/00-context/security/OWASP-2025-SECURITY-CATALOG.json` completely. It is the sole machine-readable and AI-authoritative catalog of 50 A01–A10 SEC (5 per category), applicability rules, source mappings, source URLs, ASVS detail and one-point scoring method. Do not read or derive generation data from `OWASP-2025-SECURITY-SCORING.md`; that file is a researcher-facing projection only. IDs outside A01–A10 are not selectable.

Project selected catalog records exactly with `scripts/render_prompt_e.py`. Do not contextualize catalog prose or create additional controls. For a required field that is empty or explicitly not specified/not populated, use only the same record's `primary_source_url`; capture explicit source text and provenance separately, or stop unresolved. UC analysis may add traceability metadata only and must not change the projected SR.

New-run research scope covers OWASP Top 10:2025 A01–A10. If another risk is observed, note it as an unscored observation without expanding Prompt E.

Require a code/configuration/lockfile/build/runtime/SCA evidence location for each selected atomic requirement. Do not generate test cases.
