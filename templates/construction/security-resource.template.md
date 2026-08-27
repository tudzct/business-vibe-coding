---
artifact_type: legacy-security-coding-resource
uc_id: <UC-ID>
security_point_selection_mode: researcher_selected | all_catalog
security_point_selection_artifact: docs/02-construction/implementation/<UC-ID>/security-point-selection.md
experiment_configuration_artifact: docs/05-experiments/configurations/<CONFIG-ID>.json
experiment_configuration_checksum: sha256:<checksum>
---

# <UC-ID> Security Coding Resource

## Assets, actors, trust boundaries and data classification

`[CONTEXT]`

## Security Requirements

Project every gate-selected requirement exactly from the canonical JSON. In `all_catalog` mode this means all 50 active A01–A10 SEC. Do not rewrite, specialize or invent SR content.

### Security Requirement: [exact security_point_name]

**Requirement ID:** `[SR-<UC>-NN]`

**OWASP category:** `[exact owasp value]`

**SEC ID:** `[exact sec_id value]`

**Security point:** `[exact security_point value]`

**Catalog entry:** Copy every remaining canonical JSON field exactly according to `resource/format_security.md`.

**Source supplement:** Only for a required field that is empty or explicitly not specified/not populated. Use only this record's `primary_source_url`; record target field, URL, retrieval time, source location, extracted text and resolved/unresolved status. Never overwrite the catalog entry.

**Traceability:** Record AC/BR IDs, affected layers and evidence locations separately. Traceability must not change the SR.

## Frozen security scoring baseline

| Category | Selected SEC/SR IDs | Total points |
|---|---|---:|
| A01 | | |
| A02 | | |
| Overall | | |

Freeze this table before source generation. One selected SEC instantiated as an SR equals one point.

## Unselected catalog items and rationale

| SEC ID | Exclusion basis / applicability note |
|---|---|

In `researcher_selected` mode, record every unselected active A01–A10 SEC as excluded by researcher selection. In `all_catalog` mode, this table must be empty.

## Residual risk and decisions

Do not generate tests or test cases from this resource.
