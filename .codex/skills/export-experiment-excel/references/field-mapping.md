# Final workflow telemetry mapping and cell update contract

## Canonical field meanings

Run this standalone export only after `metrics.status == finalized`. `metrics.phases.<phase>.values` contains a closed measurement bucket. Phase keys are `prompt_generation` (Coding Prompt), `source_generation` (First Source), and `repair` (Repair/RPA). A bare label such as "Token" without a phase/type is ambiguous: use a enclosing group heading only if it uniquely resolves the meaning, otherwise N/A.

| Template meaning | Canonical JSON path |
|---|---|
| UC / run / variant / replicate | `uc_id`, `run_id`, `prompt_variant`, `replicate_index` |
| Model requested | `generation_model.requested_model_id` |
| Input tokens | `metrics.phases.<phase>.values.tokens.input_tokens` |
| Cache/cached input tokens | `metrics.phases.<phase>.values.tokens.cached_input_tokens` |
| Output tokens | `metrics.phases.<phase>.values.tokens.output_tokens` |
| Reasoning output tokens | `metrics.phases.<phase>.values.tokens.reasoning_output_tokens` |
| Total tokens | `metrics.phases.<phase>.values.tokens.total_tokens` |
| Captured work seconds | `metrics.phases.<phase>.values.duration_seconds` |
| Workflow/user turns | `metrics.phases.<phase>.values.workflow_turn_count` |
| Observable tool calls | `metrics.phases.<phase>.values.tool_call_count` |
| Model/API calls | `metrics.phases.<phase>.values.model_call_count` (null if unavailable) |
| Workflow fields above | Replace `metrics.phases.<phase>.values` with `metrics.workflow` |

Only `closed` phase values are exportable as finalized; `skipped` is N/A with its reason, not fabricated zero. Workflow requires `metrics.status == finalized`. Legacy metrics lacking this schema cannot be relabelled as phase-split metrics. Unavailable counters remain N/A. Cached input is part of input, reasoning is part of output. "Tool cost" must explicitly mean call count to map it to tool_call_count; it is not money or model calls. Do not sum three phases, export UI/BR/flow judgments, or implement a flow score here.

Seconds are captured work, not UI "Worked for" or full elapsed chat time. Convert seconds to minutes only for an explicitly minute-labelled field. Ambiguous units produce N/A. Preserve existing formula cells even if they produce a pre-existing error.

## Mapping manifest

All paths resolve from `repo_root`; all writes stay in the Business repository and outside external reference projects. The agent generates the manifest from actual workbook inspection. It is not supplied manually by the researcher.

```json
{
  "schema_version": 1,
  "export_mode": "finalized_workflow_telemetry",
  "repo_root": "<absolute Business repository path>",
  "workbook": "<workbook path>",
  "workbook_sha256": "sha256:<hash>",
  "sources": ["docs/05-experiments/UC-01/run-1.json"],
  "cells": [
    {
      "sheet": "Results",
      "cell": "D5",
      "identity": {"uc_id": "UC-01", "run_id": "run-1"},
      "field": "metrics.phases.source_generation.values.tokens.input_tokens",
      "type": "number",
      "conversion": "identity",
      "expected_value": null,
      "overwrite_existing": false,
      "basis": [{"cell": "D4", "value": "Source input tokens"}, {"cell": "A5", "value": "UC-01"}],
      "review_range": "A4:F6"
    }
  ],
  "issues": []
}
```

Identity values use exact canonical strings/numbers and may include `prompt_variant`, `replicate_index`, `run_order`, or `generation_model.requested_model_id`. One matching source is required; no match or multiple matches yields N/A. Include all candidate canonical records so ambiguity is detectable. Select candidates by authorized scope/identity, never desired score.

`type`: `number`, `integer`, `string`, or `boolean`. `conversion`: `identity`, `seconds_to_minutes`, `percent_to_fraction`. Non-identity conversions are allowed only for the corresponding duration/percent fields. `field: null` with `unresolved_reason` marks an understood result cell with an ambiguous metric. Retain evidence for both row identity and header hierarchy in `basis`. Empty `basis` is rejected. Include a bounded `review_range` containing the target and its context.

`expected_value` captures the input cell's exact value (null for blank); `basis` values and the workbook hash guard against stale mapping. `overwrite_existing` is only true for a user-authorized refresh. Cell targets must be ordinary writable input/result cells, not formulas, spill/table-formula children, protected regions or non-anchor merged cells. The agent verifies those layout/native features during inspection; the writer independently refuses detected formulas and stale values.

`issues` retains unresolved destinations that must remain untouched (sheet, cell/range if known, reason). Known writable cells with unavailable values still appear in `cells` and receive N/A. The prepared updates retain source hashes, field paths, conversion, before/after values and reasons. Export never changes the input result JSON.

`export_mode` must be `finalized_workflow_telemetry`. Every source must contain validated, finalized metrics. Every non-null result field must be an identity field or committed telemetry under Prompt, Source, Repair or Workflow. Map all recognized telemetry scopes in this one export operation. Manual BR/UI/flow cells are omitted completely, not represented as N/A or unresolved cells. The output receipt retains the export mode.

Usage, with bundled executables:

```text
node <scratch>/fill_workbook.mjs inspect --repo-root <repo> --workbook <xlsx> --sheet Results --range A1:Z20 --preview <before.png>
python .codex/skills/export-experiment-excel/scripts/prepare_excel_updates.py --mapping <mapping.json> --output <updates.json>
node <scratch>/fill_workbook.mjs fill --repo-root <repo> --updates <updates.json> --output <new.xlsx>
```

The writer is a values-only helper, not a general template or macro preservation engine. Follow the installed spreadsheets skill to render before authoring, inspect complex template features, check export preservation and review the final output. Unsupported preservation must be reported, not silently flattened.
