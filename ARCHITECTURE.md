# Repository architecture

This document describes technical structure only. It does not define prompt semantics, evaluation criteria, operation order or the internal contract of any skill.

## Application runtime

`finalsource/` contains:

- `be/`: backend application source;
- `fe/`: frontend application source;
- `compose.yaml`: Docker Compose v2 services;
- runtime environment files prepared locally and excluded from version control.

The configured database schema is external run input. Application source maps to the existing DBML and live schema; active operations do not create or migrate schema.

## Specification and design inputs

- Frozen use-case Markdown: `docs/01-inception/use-cases/`
- Frozen API Markdown: `docs/01-inception/api-contracts/`
- Database description: `docs/00-context/engineering/schema.dbml`
- Figma mapping: `docs/00-context/FIGMA-LINK-REVIEW.md`
- Immutable Figma datasets: `resource/figma-design-dataset/<version>/`

## Run artifacts

Run-specific configuration and result artifacts live under `docs/04-experiments/`. Construction artifacts live under `docs/02-construction/`. Exact identities, paths and checksums select the active run; directory order or timestamps never select it implicitly.

Deterministic validators enforce identity, checksum, state and schema contracts. Validators may read the exact files needed for their action but do not grant the AI permission to read another skill's instructions.

## Operation boundaries

Each skill owns its instructions, private references and operation-specific templates. A skill consumes validated project inputs or handoff artifacts and produces only its declared outputs. A consumer reads the validated output contract, not the producer's internal instructions.

Shared Markdown remains technical environment documentation and must not restate operation-owned prompts, rubrics or correction instructions.
