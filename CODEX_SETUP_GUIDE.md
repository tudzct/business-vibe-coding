# Repository setup guide

Use this guide only for an explicit setup or repository-review request. It is not run-operation context.

## Read-only checks

Confirm:

- repository root and active branch;
- clean or intentionally modified working tree;
- Docker Engine and Docker Compose v2 availability;
- required project-input directories;
- `finalsource/be`, `finalsource/fe` and `finalsource/compose.yaml`;
- configured local environment files without printing secrets;
- database and Figma inputs required by the project.

Do not enumerate or preload skill instructions during setup.

## Project input locations

- Use cases: `docs/01-inception/use-cases/`
- API contracts: `docs/01-inception/api-contracts/`
- Figma mapping: `docs/00-context/FIGMA-LINK-REVIEW.md`
- Figma datasets: `resource/figma-design-dataset/`
- DBML: `docs/00-context/engineering/schema.dbml`
- Application source: `finalsource/`
- Clean source archive and checksum: `.codex/skills/restore-source-baseline/assets/`

## Runtime preparation

Runtime configuration belongs under `finalsource/`. Verify service names, ports, commands, volumes, build paths and database credentials against the active project. Keep secrets local and ignored.

The database is initialized only during operator-managed setup. Active run operations must not execute migrations, reset volumes or change schema. Use Docker Compose v2; native host Node.js/MySQL execution is unsupported.

## Setup report

Report only technical readiness:

- Repository: PASS | WARN | BLOCKED
- Project inputs: PASS | WARN | BLOCKED
- Source baseline: PASS | WARN | BLOCKED
- Docker/Compose: PASS | WARN | BLOCKED
- Database: PASS | WARN | BLOCKED
- Figma dataset: PASS | NOT_APPLICABLE | WARN | BLOCKED

List concrete blockers and one technical next action. Do not inspect operation-owned prompts, rubrics, results or repair instructions during setup.
