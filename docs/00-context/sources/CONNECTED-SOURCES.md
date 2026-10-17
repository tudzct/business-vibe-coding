# Project source locations

This file records technical source locations only. It does not interpret their contents or direct an operation toward particular requirement categories.

## Local specifications

- Use cases: `docs/01-inception/use-cases/uc-*.md`
- API contracts: `docs/01-inception/api-contracts/*.md`

These files are frozen, read-only project inputs. Select them only through explicit active-run references and validate required identity/path/checksum fields.

## Design input

- Approved capture mapping: `docs/00-context/FIGMA-LINK-REVIEW.md`
- Immutable datasets: `resource/figma-design-dataset/<version>/`

Use one explicitly selected dataset version. Never choose the newest directory automatically or overwrite a version already referenced by a run.

## Database input

- DBML: `docs/00-context/engineering/schema.dbml`
- Migration source: `finalsource/be/src/database/migrations/`
- Runtime: configured Docker Compose MySQL service

The active configuration pins the expected migration head, DBML bytes and live schema fingerprint.

## Source baseline

- Archive: `.codex/skills/restore-source-baseline/assets/source-baseline.zip`
- Checksum: `.codex/skills/restore-source-baseline/assets/source-baseline.sha256`

Do not substitute a different path or infer a missing input. Report missing, ambiguous or mismatched sources without modifying them.
