# Researcher-provided database baseline

The database is the fifth prepared generation input, alongside the four existing research JSON inputs. The researcher provides a DBML description and initializes MySQL 8.4 from `finalsource/init.sql` outside generation. One database serves the entire cumulative UC pipeline. Its rows are initially empty and may accumulate through authorized business operations; its structure remains fixed.

## Configuration contract

New Experiment Configurations use schema `2.4` with exactly three database fields:

```json
"database_baseline": {
  "dbml_path": "docs/00-context/engineering/schema.dbml",
  "dbml_sha256": "sha256:<64 lowercase hex characters>",
  "schema_fingerprint_sha256": "sha256:<64 lowercase hex characters>"
}
```

The configuration's existing `status: Confirmed` applies to this block. No separate database status, ID, manifest, confirmation or duplicate block in BR/flow baselines or Canonical Run JSON is required. The canonical configuration checksum pins all three fields. Preserve historical inputs/results; changed frozen inputs require a new configuration/run, not replacement hashes in existing evidence.

The DBML hash covers exact file bytes, including comments and line endings. The fingerprint covers normalized metadata from the researcher-verified MySQL baseline. These pins are independent: matching both proves each input still matches its own baseline, not that DBML and SQL were semantically equivalent when prepared. The researcher checks that correspondence before pinning. Never derive a replacement expected fingerprint from an unverified runtime during preflight.

## Preparation and verification

After explicitly authorized initialization of a fresh volume, run from the repository root using an available Python executable:

```text
<python-executable> .codex/skills/gen-coding-prompt/scripts/database_baseline.py --dbml docs/00-context/engineering/schema.dbml --require-empty
```

This prints the three configuration fields without writing files. It reads the existing Compose `database` service and verifies actual table emptiness using bounded existence queries. It never starts/resets containers or executes init SQL. Prepare `finalsource/.env` and start MySQL first; root `.env` is unused. Copy the reviewed output into the externally prepared configuration, then hash that configuration for the Canonical Run JSON. Running this command directly requires no AI.

Prompt/Source call their existing `preflight_configuration.py` once; it imports the database helper internally. It verifies DBML and live runtime pins before generation START. Missing fields/file/database, invalid pins, Docker/query failures or mismatches block with a concise error. No automatic bootstrap, inferred baseline or input repair is allowed. Success retains compact preflight output, with no raw metadata or credentials. Read DBML once as shared Full/RQ3 technical context; do not duplicate it as SQL/metadata dumps.

The existing START capture helper revalidates preflight internally as well. This can repeat the database read before the timestamp; no additional researcher turn is required and the validation duration is outside core execution time. Do not skip verification using a stale cached PASS. Whole-turn token accounting still includes actual invocation/output overhead.

Audit and Repair verify the pinned configuration before observation/correction and after integrated verification:

```text
<python-executable> .codex/skills/gen-coding-prompt/scripts/database_baseline.py --configuration <pinned-configuration.json>
```

The helper returns `PASS database_baseline` or an error without modifying pins/metrics. Measure, activation and export do not query MySQL. Runtime failures preserve partial evidence and do not alone prove a BR unmet. Existing whole-turn token labels and timing boundaries remain; verification inside Repair remains part of Repair.

## Fingerprint protocol: mysql84-tables-v1

Use the same helper for capture and verification. It reads MySQL 8.4 `INFORMATION_SCHEMA` using container-root metadata access to avoid incomplete visibility from application-account grants. Credentials remain internal and never appear in output. Backend Compose settings, and the actual running backend when present, must point to the inspected database service/schema.

The fingerprint includes schema name/default charset/collation, identifier case policy, base table options, columns/order/types/defaults/nullability/generated expressions/SRID, ordered indexes, PK/unique/FK/CHECK constraints, FK actions and partition definitions. It sorts compact JSON metadata rows and hashes UTF-8 bytes with the protocol ID. It excludes record contents/counts, physical sizes, cardinality, timestamps, current auto-increment counters, comments and MySQL patch version. Major/minor is fixed at 8.4.

This protocol supports base tables including partitions. Views, triggers, stored routines and events are explicitly rejected rather than silently omitted. Extend/version the protocol before using those objects. No concurrent DDL is allowed during capture/validation. This verifies structure, not server/volume identity: equivalent fresh instances intentionally share a hash. It cannot prove volume freshness; initialization emptiness is checked separately.

## Source and database boundaries

- Preserve exact DBML names/case, types, lengths, nullability, defaults, keys, relationships, indexes and delete behavior. Generic naming conventions never authorize renaming the supplied schema.
- Create/update TypeORM entity mappings, queries, DTOs and services against existing tables. Entity edits do not authorize DDL.
- Allow authorized business `SELECT`, `INSERT`, `UPDATE`, `DELETE` and transactions. Never arbitrarily seed, erase or reset data to make audit pass.
- Keep `synchronize: false` and automatic migration execution disabled everywhere. Never generate/run migrations, schema sync, DDL, `TRUNCATE`, grants, or alter DBML/init SQL during generation, audit or repair.
- Incompatible requirements are input blockers: report the exact missing/conflicting element and stop. Do not weaken requirements or request in-run permission to alter schema.
- No per-UC `schema.json` creation/approval or schema gate remains. Preserve old artifacts as historical evidence only. Public API, ownership and destructive-data decisions retain their existing boundaries.
- DML-only application-account grants are a useful setup defense. Fingerprinting detects drift but does not enforce privileges; never claim DDL is technically impossible without verified grants.

## Pipeline lifecycle

Reset only on explicit researcher instruction at the start of a new pipeline/replicate/condition. Init SQL runs on the fresh volume once. Never reset or require empty tables between cumulative UCs. Retain their data and compare structure pins. Source baseline restoration remains source-only and never resets the database.

Metadata reference: https://dev.mysql.com/doc/refman/8.4/en/information-schema.html

The helper accepts the `docker compose` v2 CLI and its compatible v5 successor, not legacy `docker-compose` v1. See https://docs.docker.com/compose/support-and-feedback/faq/ .
