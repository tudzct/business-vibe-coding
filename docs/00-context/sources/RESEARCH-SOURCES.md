# Research sources and authority

1. The canonical Google Sheet is authoritative for use-case fields, UML, Business Rules, UI/API references and notes.
2. The canonical prompt-template Google Doc is authoritative for Prompt A-F organization.
3. The reference thesis is authoritative for retaining the original two phases: prompt generation, then source generation with bounded self-correction.
4. Existing source/database/Figma/API artifacts provide implementation context; they cannot override explicit Sheet-derived behavior without researcher approval.

When sources conflict, record the exact discrepancy and ask the researcher. Do not silently normalize business meaning. The project-wide API response envelope may be applied mechanically because it changes transport shape, not domain semantics.

## Local materials and boundaries

- `resource/Draft paper_VibeCoding-security.docx`: comparative material for a separate security-focused project. Do not use it to define this research product's Prompt E, requirements, evaluation baseline or metrics.
- `resource/BUSINESS_PROMPT_TEMPLATE.docx`: non-canonical business-focused prompt-template reference. It cannot override the canonical Google Doc, repository templates or the frozen Business Rule resource; Prompt E remains Business Rules Compliance for Full runs.
- `resource/TrucDTT_21020414-4889_baoveee.pdf`: two-phase pipeline from use case/design/API/templates to coding prompt, then code generation and self-correction.
- `resource/TechnicalReport.pdf`: supporting reference for use cases and Prompts A-D; it cannot override the canonical Sheet-derived UC/BR projection.
- `resource/VC-AWG-Demo_FinalCode-main`: architectural reference for React/Vite and NestJS/TypeORM. Target manifests/lockfiles and explicit UC/BR/API requirements take precedence.
