# Active-run contract

This contract defines shared integrity and handoff boundaries. It does not define operation order or disclose operation-owned instructions.

## Input boundaries

The active configuration pins one UC/run identity, project dependencies and database baseline. Consumers validate exact paths, identities and raw-byte checksums. An empty API inventory is valid only when the frozen use case explicitly declares no related API.

The configured DBML, migration history and live database fingerprint form one immutable run input. Active operations map to existing structure and may perform authorized business DML. They do not execute migrations, DDL or schema synchronization.

## Prompt identity

A coding-prompt artifact is selected by exact active-run identity, path and checksum. Variant metadata is an opaque identity. Validation checks configured identity and artifact structure without interpreting a variant name as behavioral instruction.

The coding-prompt template is private to its owning operation. Shared context must not restate its sections or responsibilities.

## Artifact handoff

An operation may consume only the validated fields it requires from an active-run artifact. This permission does not extend to the producer skill's `SKILL.md`, references, scripts or private templates.

Typical handoff data includes:

- identity and checksum references;
- source revision and immutable evidence;
- validated result and defect records;
- timestamps, turn identifiers and telemetry receipts.

Do not add inferred fields, rewrite prior evidence or use artifacts from another run.

## Source provenance

Before source mutation, record the active configuration reference, prompt reference, model tuple, replicate/order, current input source hash and expected predecessor or clean-baseline hash. Do not silently restore between cumulative units or inherit another condition's source.

An unresolved source identity is a blocker. Preserve current source and evidence while the operator resolves provenance.

## Operation isolation

Each top-level command authorizes only its owning skill. Subordinate skills require explicit authorization in that skill's contract. Deterministic helpers may validate state transitions without exposing the whole state machine to the model.

Shared context never supplies prompt semantics, evaluation rubrics or correction instructions.
