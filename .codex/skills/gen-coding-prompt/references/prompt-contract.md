# Prompts contract

## Configured prompt template

Follow the [configured template](../../../../templates/construction/coding-prompt.template.md) for the complete prompt. Its sections, order and instructions define the prompt structure.

## Synthesis contract

- **Template responsibilities**: Preserve the responsibility boundary defined by each section of the configured template and avoid unnecessary duplication across sections.
- **Standard response envelopes**:
  - Raw UC success fields become the domain payload in the standard success envelope (`{ "success": true, "message": "...", "data": ... }`).
  - UC error status/message use the standard error envelope (`{ "success": false, "statusCode": ..., "message": "...", "timestamp": "...", "path": "..." }`).
  - This transport normalization must not change source meaning.

## Database contract input

The configured DBML (`docs/00-context/engineering/schema.dbml`) is shared technical input read once after preflight PASS. Map entities and queries strictly to existing tables and column definitions. Apply the [shared operational constitution](../../../../AGENTS.md#shared-operational-constitution) and database baseline policy.
