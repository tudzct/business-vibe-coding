# Project context

This file describes the repository environment only. It does not define operation order, prompt content, evaluation criteria or the internal behavior of any skill.

## Repository areas

- `docs/00-context/`: shared technical context and immutable environment policies.
- `docs/01-inception/use-cases/`: frozen local use-case specifications.
- `docs/01-inception/api-contracts/`: frozen local API specifications.
- `docs/02-construction/`: active-run construction artifacts.
- `docs/04-experiments/`: active-run configuration and result artifacts.
- `finalsource/`: cumulative application source.
- `resource/figma-design-dataset/`: immutable offline Figma datasets.
- `.codex/skills/`: operation-owned instructions and deterministic helpers.

## Input integrity

An active run is selected by exact identity and pinned paths/checksums. Never choose an artifact by newest timestamp, filename similarity or largest contents. Configuration and baseline inputs are prepared before an operation uses them and remain read-only during that run.

Use-case and API specifications are repository-local Markdown inputs. Figma mappings come from `docs/00-context/FIGMA-LINK-REVIEW.md`; an operation that needs design evidence uses an explicitly selected immutable dataset version. Database structure comes from the configured DBML, migration history and live fingerprint.

## Source environment

`finalsource` contains the active cumulative application source. Source provenance must identify the exact predecessor or clean baseline before mutation. Do not silently restore, reset or inherit source from another run.

Frontend, backend and MySQL run through Docker Compose v2. Database structure is immutable within an active run. Missing or conflicting structure is a blocker rather than permission to edit schema inputs.

## Context boundary

Shared context provides technical locations and integrity rules only. Operation semantics belong to the invoked skill. Prompt templates, evaluation rubrics and correction templates remain private to their owning operations.

Skills exchange only validated active-run artifacts. An artifact consumer may read the artifact fields required by its contract without reading the producer skill's instructions.
