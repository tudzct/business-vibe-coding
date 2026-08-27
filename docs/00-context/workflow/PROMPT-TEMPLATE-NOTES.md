# Prompt template adaptation

The canonical project template at `templates/construction/coding-prompt.template.md` is adapted from the external reference `resource/BUSINESS_PROMPT_TEMPLATE.docx`. That reference focuses on business compliance; this research does not adopt that focus.

## Research baseline and deliberate removal

- The implementation baseline is `resource/TechnicalReport.pdf`: its use-case, API, UI, flow, validation and error-handling content supplies Prompts A-D.
- This research adds one experimental prompt dimension only: `SECURITY_REQUIREMENT` in Prompt E.
- `Prompt E: Business Rules Compliance` from `BUSINESS_PROMPT_TEMPLATE.docx` is deliberately excluded. The project must not recreate, rename or invoke a separate business-requirement prompt/component.
- Business correctness metrics are outside the study. TechnicalReport-derived UC/AC/BR content is used only as source-generation context and traceability, not as a scored result.

- Prompts A-D retain backend, UI, integration, validation and error-handling responsibilities.
- Original `Prompt E: Business Rules Compliance` is replaced by `Prompt E: Security Requirements`.
- Prompt E is restricted to active A01–A10 SEC selected through `gates/SECURITY-POINT-SELECTION-GATE.md`: either the researcher's explicit list or all 50 active catalog items. Each instantiated SR is one point. AI must use only `../security/OWASP-2025-SECURITY-CATALOG.json` for IDs, sources, URLs, ASVS detail and scoring. `OWASP-2025-SECURITY-SCORING.md` is human-readable documentation only; do not parse it for generation. Do not select IDs outside A01–A10.
- Each Prompt E item follows `resource/format_security.md` as an exact selected-record projection from the canonical JSON. AI must not rewrite or add SR content. Only a required field that is empty or explicitly not specified/not populated may receive a separately labeled supplement from that same record's declared primary source URL, with provenance.
- Prompt F retains implementation context and explicitly prohibits generating/running tests or test cases.
- TechnicalReport-derived functional/API requirements remain authoritative baseline inputs and are audited separately; they are not regenerated or redefined inside Prompt E.
- Every initial generation and bug-fixing sub-prompt must invoke the audit skill.
