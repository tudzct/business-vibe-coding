# Research sources and authority

1. The canonical Google Sheet is authoritative for use-case fields, UML, Business Rules, UI/API references and notes.
2. The canonical prompt-template Google Doc is authoritative for Prompt A-F organization.
3. The reference thesis is authoritative for retaining the original two phases: prompt generation, then source generation with bounded self-correction.
4. Existing source/database/Figma/API artifacts provide implementation context.

When sources conflict, record the exact discrepancy and ask the researcher. Do not silently normalize business meaning. The project-wide API response envelope may be applied mechanically because it changes transport shape, not domain semantics.

## Local materials and boundaries

- `resource/BUSINESS_PROMPT_TEMPLATE.docx`: non-canonical prompt-template reference.
- `resource/TrucDTT_21020414-4889_baoveee.pdf`: two-phase pipeline from use case/design/API/templates to coding prompt, then code generation and self-correction.
- `resource/TechnicalReport.pdf`: supporting reference for use cases and Prompts A-D.
- `resource/VC-AWG-Demo_FinalCode-main`: architectural reference for React/Vite and NestJS/TypeORM.
