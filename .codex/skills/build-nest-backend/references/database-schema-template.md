# Existing database mapping reference

Follow `docs/00-context/engineering/DATABASE-SCHEMA.md`. The configured DBML is the researcher-provided structure. Preserve its exact names and definitions.

Map required TypeScript properties to existing table/column names, types, null/default behavior, keys and FK actions. Implement compatible behavior in application code. Keep ownership, sensitive-field selection and API exposure explicit.

Keep `synchronize: false` and automatic migrations disabled. Do not generate DDL/migrations or change the baseline. Report incompatible requirements with the exact table/column/constraint involved; do not invent a replacement schema.
