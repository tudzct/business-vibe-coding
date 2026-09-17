#!/usr/bin/env python3
"""Read-only MySQL 8.4 schema fingerprinting for researcher-prepared baselines.

No Python packages, schema writes, container starts or model calls are needed.
Protocol mysql84-tables-v1: sorted JSON metadata rows, UTF-8, SHA-256.
"""

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[4]
PROTOCOL = "mysql84-tables-v1"
HASH = re.compile(r"sha256:[0-9a-f]{64}\Z")
FIELDS = {"dbml_path", "dbml_sha256", "schema_fingerprint_sha256"}

# Explicit metadata allow-list excludes row counts, cardinality, timestamps,
# physical sizes and the current AUTO_INCREMENT counter. Case is preserved.
QUERIES = {
    "schema": ("SCHEMATA", "SCHEMA_NAME, DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME",
               "SCHEMA_NAME = DATABASE()"),
    "table": ("TABLES", "TABLE_NAME, TABLE_TYPE, ENGINE, ROW_FORMAT, TABLE_COLLATION, CREATE_OPTIONS",
              "TABLE_SCHEMA = DATABASE()"),
    "column": ("COLUMNS", "TABLE_NAME, COLUMN_NAME, ORDINAL_POSITION, COLUMN_TYPE, IS_NULLABLE, "
               "COLUMN_DEFAULT, EXTRA, CHARACTER_SET_NAME, COLLATION_NAME, GENERATION_EXPRESSION, SRS_ID",
               "TABLE_SCHEMA = DATABASE()"),
    "index": ("STATISTICS", "TABLE_NAME, INDEX_NAME, NON_UNIQUE, SEQ_IN_INDEX, COLUMN_NAME, "
              "COLLATION, SUB_PART, NULLABLE, INDEX_TYPE, IS_VISIBLE, EXPRESSION",
              "TABLE_SCHEMA = DATABASE()"),
    "constraint": ("TABLE_CONSTRAINTS", "TABLE_NAME, CONSTRAINT_NAME, CONSTRAINT_TYPE, ENFORCED",
                   "CONSTRAINT_SCHEMA = DATABASE()"),
    "key": ("KEY_COLUMN_USAGE", "TABLE_NAME, CONSTRAINT_NAME, COLUMN_NAME, ORDINAL_POSITION, "
            "POSITION_IN_UNIQUE_CONSTRAINT, REFERENCED_TABLE_SCHEMA, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME",
            "CONSTRAINT_SCHEMA = DATABASE()"),
    "foreign_key": ("REFERENTIAL_CONSTRAINTS", "TABLE_NAME, CONSTRAINT_NAME, UNIQUE_CONSTRAINT_SCHEMA, "
                    "UNIQUE_CONSTRAINT_NAME, MATCH_OPTION, UPDATE_RULE, DELETE_RULE, REFERENCED_TABLE_NAME",
                    "CONSTRAINT_SCHEMA = DATABASE()"),
    "check": ("CHECK_CONSTRAINTS", "CONSTRAINT_NAME, CHECK_CLAUSE", "CONSTRAINT_SCHEMA = DATABASE()"),
    "partition": ("PARTITIONS", "TABLE_NAME, PARTITION_NAME, SUBPARTITION_NAME, PARTITION_ORDINAL_POSITION, "
                  "SUBPARTITION_ORDINAL_POSITION, PARTITION_METHOD, SUBPARTITION_METHOD, PARTITION_EXPRESSION, "
                  "SUBPARTITION_EXPRESSION, PARTITION_DESCRIPTION, TABLESPACE_NAME",
                  "TABLE_SCHEMA = DATABASE()"),
}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def sha256(raw):
    return "sha256:" + hashlib.sha256(raw).hexdigest()


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, f"duplicate JSON field: {key}")
        result[key] = value
    return result


def dbml_file(value):
    require(isinstance(value, str) and value.strip(), "database_baseline.dbml_path is required")
    relative = Path(value)
    require(not relative.is_absolute() and ".." not in relative.parts, "DBML path must be repository-relative")
    path = (ROOT / relative).resolve()
    require(path.is_relative_to(ROOT) and path.suffix.lower() == ".dbml", "DBML must be a repository .dbml file")
    require(path.is_file(), "configured DBML file is missing; prepare it outside generation")
    raw = path.read_bytes()
    require(raw.decode("utf-8-sig").strip(), "configured DBML is empty")
    return path, sha256(raw)


def validate_input(config):
    """Validate the three-field input without contacting Docker/MySQL."""
    block = config.get("database_baseline")
    require(isinstance(block, dict), "missing database_baseline; prepare the fifth input outside generation")
    require(set(block) == FIELDS, "database_baseline requires exactly dbml_path, dbml_sha256 and schema_fingerprint_sha256")
    for name in ("dbml_sha256", "schema_fingerprint_sha256"):
        require(isinstance(block[name], str) and HASH.fullmatch(block[name]), f"invalid database_baseline.{name}")
    _, actual = dbml_file(block["dbml_path"])
    require(actual == block["dbml_sha256"], "database DBML checksum mismatch")
    return block


def docker_executable():
    executable = shutil.which("docker")
    if executable:
        return executable
    # Support the packaged Windows Docker Desktop installation without changing PATH.
    for base in (os.environ.get("LOCALAPPDATA"), os.environ.get("ProgramFiles")):
        if base:
            for suffix in ("Programs/DockerDesktop/resources/bin/docker.exe", "Docker/Docker/resources/bin/docker.exe"):
                candidate = Path(base) / suffix
                if candidate.is_file():
                    return str(candidate)
    raise ValueError("Docker CLI unavailable; database validation requires Docker Compose v2")


def command(args, label, stdin=None):
    try:
        result = subprocess.run(args, input=stdin, capture_output=True, text=True,
                                encoding="utf-8", errors="strict", timeout=25, cwd=ROOT)
    except subprocess.TimeoutExpired:
        raise ValueError(f"{label} timed out; database preflight blocked") from None
    except OSError:
        raise ValueError(f"{label} unavailable; check Docker access") from None
    # Raw stderr/config/inspect may contain secrets. Never forward it to model output.
    require(result.returncode == 0, f"{label} failed (exit {result.returncode}); check Docker/database configuration and access")
    return result.stdout


class Runtime:
    def __init__(self):
        compose = ROOT / "finalsource/compose.yaml"
        env_file = ROOT / "finalsource/.env"
        require(compose.is_file() and env_file.is_file(), "database preflight requires finalsource/compose.yaml and finalsource/.env")
        require((ROOT / "finalsource/init.sql").is_file(), "researcher-prepared finalsource/init.sql is missing")
        self.prefix = [docker_executable(), "compose", "--env-file", str(env_file), "-f", str(compose)]
        version = command(self.prefix + ["version", "--short"], "Compose version").strip().lstrip("v")
        # Compose v5 preserves the v2 CLI (Docker's official compatibility policy).
        require(version.split(".")[0] in {"2", "5"}, "Docker Compose v2-compatible CLI is required (v2 or v5)")
        data = json.loads(command(self.prefix + ["config", "--format", "json"], "Compose configuration"))
        services = data.get("services", {})
        db_env = services.get("database", {}).get("environment", {})
        be_env = services.get("backend", {}).get("environment", {})
        self.schema = db_env.get("MYSQL_DATABASE")
        require(isinstance(self.schema, str) and re.fullmatch(r"[A-Za-z0-9_]+", self.schema), "invalid Compose MYSQL_DATABASE")
        self.check_backend(be_env)
        # If backend is running, check its actual connection target as well as Compose.
        ids = command(self.prefix + ["ps", "-q", "backend"], "backend identity").split()
        require(len(ids) <= 1, "multiple backend containers; database target is ambiguous")
        if ids:
            inspected = json.loads(command([self.prefix[0], "inspect", ids[0]], "backend connection inspection"))
            runtime_env = dict(item.split("=", 1) for item in inspected[0]["Config"]["Env"] if "=" in item)
            self.check_backend(runtime_env)

    def check_backend(self, env):
        require(env.get("DB_HOST") == "database" and str(env.get("DB_PORT")) == "3306"
                and env.get("DB_DATABASE") == self.schema,
                "backend database target differs from the Compose database service")

    def query(self, sql):
        # Password is expanded only inside the existing container, never in argv or logs.
        shell = ('test -n "$MYSQL_ROOT_PASSWORD" && test -n "$MYSQL_DATABASE" && '
                 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysql --protocol=socket --user=root '
                 '--database="$MYSQL_DATABASE" --default-character-set=utf8mb4 '
                 '--batch --raw --skip-column-names --connect-timeout=5')
        output = command(self.prefix + ["exec", "-T", "database", "sh", "-c", shell],
                         "MySQL metadata query", sql)
        try:
            return [json.loads(line) for line in output.splitlines() if line.strip()]
        except (ValueError, TypeError):
            raise ValueError("invalid MySQL metadata output") from None


def metadata_sql():
    parts = ["SET SESSION time_zone = '+00:00';",
             "SET SESSION show_gipk_in_create_table_and_information_schema = ON;",
             "SELECT JSON_ARRAY('server', VERSION(), DATABASE(), @@lower_case_table_names);"]
    for kind, (table, fields, where) in QUERIES.items():
        parts.append(f"SELECT JSON_ARRAY('{kind}', {fields}) FROM INFORMATION_SCHEMA.{table} WHERE {where};")
    # This protocol covers table schemas. Fail closed on executable schema objects
    # rather than hashing an incomplete description or exposing stored routines.
    for table, column in (("TRIGGERS", "TRIGGER_SCHEMA"), ("ROUTINES", "ROUTINE_SCHEMA"), ("EVENTS", "EVENT_SCHEMA")):
        parts.append(f"SELECT JSON_ARRAY('unsupported', '{table}', COUNT(*)) FROM INFORMATION_SCHEMA.{table} WHERE {column} = DATABASE();")
    return "\n".join(parts)


def fingerprint(rows):
    require(isinstance(rows, list) and all(isinstance(row, list) and row for row in rows), "invalid schema metadata")
    server = [row for row in rows if row[0] == "server"]
    require(len(server) == 1 and len(server[0]) == 4 and str(server[0][1]).startswith("8.4."), "fingerprint requires MySQL 8.4")
    tables = [row for row in rows if row[0] == "table"]
    require(tables, "database has no tables; initialize the baseline outside generation")
    require(all(row[2] == "BASE TABLE" for row in tables), "mysql84-tables-v1 does not support views")
    for row in rows:
        if row[0] == "unsupported":
            require(row[2] == 0, "mysql84-tables-v1 does not support triggers, stored routines or events")
        else:
            require(row[0] in QUERIES or row[0] == "server", "unknown fingerprint metadata section")
    require(len([r for r in rows if r[0] == "schema"]) == 1, "database schema metadata missing")
    require(all(any(r[0] == "column" and r[1] == t[1] for r in rows) for t in tables), "incomplete column metadata")
    # MySQL patch version is operational; name/case policy and actual structure are pinned.
    normalized = [row for row in rows if row[0] not in {"server", "unsupported"}]
    normalized.append(["server_policy", "mysql-8.4", server[0][2], server[0][3]])
    serial = lambda value: json.dumps(value, ensure_ascii=False, separators=(",", ":"), allow_nan=False)
    normalized.sort(key=serial)
    return sha256(serial([PROTOCOL, normalized]).encode("utf-8"))


def capture(require_empty=False):
    runtime = Runtime()
    rows = runtime.query(metadata_sql())
    actual = fingerprint(rows)
    require(next(row[2] for row in rows if row[0] == "server") == runtime.schema, "running database differs from Compose MYSQL_DATABASE")
    if require_empty:
        # Used explicitly at pipeline setup only; never infer emptiness from TABLE_ROWS.
        for row in rows:
            if row[0] == "table":
                name = row[1].replace("`", "``")
                result = runtime.query(f"SELECT JSON_ARRAY('has_rows', EXISTS(SELECT 1 FROM `{name}` LIMIT 1));")
                require(result == [["has_rows", 0]], "database contains rows; empty database required only at pipeline initialization")
    return actual


def verify_database(config):
    block = validate_input(config)
    actual = capture()
    require(actual == block["schema_fingerprint_sha256"],
            f"database schema fingerprint mismatch: expected {block['schema_fingerprint_sha256']}, actual {actual}")
    validate_input(config)  # Detect file changes during runtime inspection.
    return "valid"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--dbml", help="Print three configuration fields from a researcher-verified runtime")
    mode.add_argument("--configuration", type=Path, help="Verify existing pins, without updating them")
    parser.add_argument("--require-empty", action="store_true", help="Preparation only: require all tables empty")
    args = parser.parse_args()
    if args.configuration:
        require(not args.require_empty, "--require-empty is preparation-only; cumulative UCs retain data")
        raw = args.configuration.read_bytes()
        config = json.loads(raw.decode("utf-8-sig"), object_pairs_hook=unique_object)
        require(isinstance(config, dict) and config.get("status") == "Confirmed", "configuration must be Confirmed")
        verify_database(config)
        require(args.configuration.read_bytes() == raw, "configuration changed during database validation")
        print("PASS database_baseline")
    else:
        path, checksum = dbml_file(args.dbml)
        actual = capture(args.require_empty)
        require(dbml_file(args.dbml)[1] == checksum, "DBML changed during fingerprint capture")
        print(json.dumps({"dbml_path": path.relative_to(ROOT).as_posix(), "dbml_sha256": checksum,
                          "schema_fingerprint_sha256": actual}, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, TypeError, KeyError, UnicodeError) as exc:
        raise SystemExit(f"database baseline blocked: {exc}")
