# Metrics artifact contract

This file documents shared storage and integrity rules only. It does not define operation order, evaluation criteria, correction behavior or the private instructions of any skill.

## Canonical authority

The active Canonical Run JSON is the authority for stored results and telemetry. Select it by exact UC/run identity and repository-relative path, never by recency or filename similarity. Preserve its pinned configuration identity and checksum.

`metrics_schema_version` is `3`. The `metrics` field is `null` before telemetry is recorded and otherwise contains the schema-valid object written by the authorized telemetry operation. Consumers validate stored data and do not recompute, reinterpret or silently fill missing values.

## Integrity

- Preserve immutable input, source, timestamp, receipt and evidence hashes.
- Keep recorded observations append-only where the owning schema requires history.
- Never replace an unavailable value with an invented zero or inferred result.
- Never rewrite an earlier record to make a later validation pass.
- Keep UI fields operator-managed and optional as defined by the Canonical Run schema.
- Keep secrets and unrelated payloads out of metrics, evidence and reports.

## Ownership

Only the explicitly authorized operation may write fields it owns. Reporting and export operations are read-only consumers of canonical values. Operation-specific field meanings, calculations, statuses and transition rules remain in that operation's private skill references and scripts.
