# Use-case generation audit

> Completeness requirement: instantiate every section and field below for every run. Do not replace this report with a summary. Preserve unavailable fields explicitly with their reason, and keep all values consistent with the validated audit JSON.

## Identification

- Run ID:
- Unified experiment configuration ID/path/checksum:
- Comparison group ID and researcher ID:
- Id / Use case ID:
- Tên use case / Use case name:
- Replicate index and run order:
- Audit protocol (`fixed`, `matched` or `cross`):
- Security-point selection mode (`researcher_selected` or `all_catalog`):
- Security-point selection artifact:
- Input-bundle/code revision:
- Confirmed model-selection artifact:
- Run-specific model-selection projection:
- Model-selection gate version: `2`
- Generation model requested label:
- Generation requested model ID / reasoning effort / reasoning mode:
- Generation effective model ID / snapshot / reasoning effort:
- Generation model observed post-run evidence (if any; does not backfill effective):
- Audit requested model ID / reasoning effort / reasoning mode:
- Audit effective model ID / snapshot / reasoning effort:
- Codex client pre-generation version (`codex --version` exact output):
- Codex client observed post-run version (if pre-generation capture was missed):
- Model configuration key:
- Other model/sampling parameters or unavailable reason:
- UC complexity level and score:
- Complexity rationale:

## Generation efficiency

- Timing method: `system_timestamp_delta`
- First generation automatic ISO/epoch-ms start and end (first source mutation through completed first-pass source generation; excludes build/audit/repair):
- First generation derived duration seconds:
- Tổng số bug-fixing sub-prompt / All sub-prompt count:
- Số sub-prompt sửa lỗi bảo mật / Security repair sub-prompt count:
- Duration of each sub-prompt (`repair-NNN`: automatic ISO/epoch-ms start/end and derived duration seconds):
- Total all-repair duration seconds (derived from every repair duration; `null` if incomplete):
- Total security repair duration seconds:
- Initial input/output/total tokens:
- Repair input/output/total tokens by iteration:
- Repair model ID / snapshot / reasoning effort by iteration:
- Total tokens for all sub-prompts:
- Total tokens for whole UC:
- Token telemetry source and unavailable reason:

### Repair iterations

| Repair ID | Category | Trigger | Error fingerprint | Requirement IDs | Model/config | Start ISO/epoch ms | End ISO/epoch ms | Duration seconds | Tokens | Status | Sub-prompt/evidence |
|---|---|---|---|---|---|---:|---:|---:|---:|---|---|
| | | | | | | | | | | | |

## Manual baseline

- Expert 1 estimate (minutes, name/role/assumptions):
- Expert 2 estimate (minutes, name/role/assumptions):
- Expert 3 estimate (minutes, name/role/assumptions):
- Median manual estimate minutes:

## Supporting quality metrics

- UI accuracy percentage, rubric and evidence:
- Flow accuracy percentage, rubric and evidence:

## Prompt E source-based security assessment

- Frozen selected SR IDs and totals:
- Met / unmet / not-evaluable totals by A01-A10 and overall:
- One assessment row per frozen SR with source/configuration/build/runtime evidence and rationale:
- Final source hash after terminal repair:
- Generation-audit limitations:

## Audit provenance

- Audit time and auditor:
- Unknown/unavailable fields and reason:
- Artifact paths:
