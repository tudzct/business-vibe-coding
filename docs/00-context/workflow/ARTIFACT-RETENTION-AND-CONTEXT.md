# Artifact retention and context policy

## Principle

For new runs, persist structured evidence once as canonical JSON. Markdown is reserved for immutable use cases, the exact prompts sent to a model, and researcher-facing reports rendered on demand. A file being retained as evidence does not authorize loading it into model context.

## Core evidence

Retain the immutable UC, Confirmed experiment configuration, resolved security coding prompt, every executed repair prompt, final source and hash, canonical source-based run JSON, referenced Figma manifest/checksums/reference image, and approved schema record when applicable.

## Canonical new-run artifacts

- `docs/05-experiments/configurations/<CONFIG-ID>.json`
- `docs/02-construction/implementation/<UC-ID>/security-scope-activation.json`
- `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/run-activation.json`
- `docs/02-construction/security-resources/<UC-ID>-security.json`
- `docs/02-construction/implementation/<UC-ID>/schema.json` when schema approval is required
- `docs/02-construction/coding-prompts/<UC-ID>-security-coding-prompt.md`
- `docs/02-construction/implementation/<UC-ID>/sub-prompts/repair-NNN.md`
- `docs/05-experiments/<UC-ID>/<RUN-ID>.json`

Activation JSON files are receipts, not projections. They contain only identity, source path/checksum, activation timestamp and status. Resolve the selected scope/model tuple from the referenced Confirmed configuration with deterministic tooling; do not duplicate it in the receipt.

`schema.json` begins as Draft and is updated in place to Approved with approval provenance. Preserve the approved contract in the same file; do not create a second full copy.

## On-demand artifacts

- Render `docs/05-experiments/<UC-ID>/<RUN-ID>.md` only when the researcher or reviewer requests a report. It is not a run-finalization requirement and never becomes a second source of truth.
- Create detailed UI mapping only when there is a visual inference, mismatch, omission dispute, or reviewer request. Otherwise record dataset/node/checksum, structural coverage, similarity and retained screenshot paths in the canonical run JSON.
- Retain runtime screenshots only when referenced by a repair or canonical evidence record. Do not retain unreferenced intermediate screenshots.

## Context routing

Read the smallest artifact slice needed for the active step. Prefer validators/query scripts that return selected JSON fields. Do not load retained evidence merely because it exists.

- Generation must not read unrelated Docker history.
- Docker run reads current environment state, not the complete history.
- Troubleshooting reads an incident index first, then only a matching incident.
- Audit reads the active SR entries and run assignment, not duplicated Markdown projections.
- Figma resolution uses an explicitly referenced dataset. Unreferenced versions are cold evidence and must not be selected automatically.

## Figma and logs

Within a dataset, identical assets may share one checksum-addressed canonical file; manifests and asset maps must reference it. Never deduplicate a frozen dataset in a way that invalidates its recorded checksum. Move an unreferenced dataset to cold storage only after a reference scan proves no configuration, prompt, audit or source manifest uses it.

Persist bounded command evidence: command identifier, exit code, timestamp, tool version, source hash and the smallest relevant error excerpt. Do not persist successful raw terminal transcripts or complete build logs.

Historical Markdown artifacts remain read-only evidence. New policy does not rewrite or delete them.
