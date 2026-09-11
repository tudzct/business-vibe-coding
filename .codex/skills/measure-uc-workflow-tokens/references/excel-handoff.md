# Measure-to-Excel handoff

## Invocation contract

The researcher may identify a different workbook on every Measure invocation. Accept natural-language invocations such as:

```text
$measure-uc-workflow-tokens close source_generation for UC-01 / RUN-01.
Excel target: C:\Research\results-model-a.xlsx
```

```text
$measure-uc-workflow-tokens finalize-workflow for UC-01 / RUN-01.
Excel target: <attached workbook or accessible Excel link>
```

`Excel target:` belongs to this invocation only. Never save it as a default and never carry it into a later Measure turn. The prompt must still identify the exact UC/run and close/finalize operation; the workbook name is not run identity.

## Target resolution

- A local/attached target must resolve to exactly one readable `.xlsx` file. A web link must resolve through an authorized available connector to an actual Excel workbook before authoring. Do not scrape a sharing page or infer a file from a folder/latest-file listing.
- A Google Sheets URL is not an `.xlsx` target. Use the Google Sheets-specific workflow only when the researcher explicitly wants that destination; do not silently convert it.
- If a link needs sign-in, is ambiguous, is inaccessible, points to `.xls`/`.xlsm`, or cannot be represented without losing required native features, stop before the Measure commit when detected during preflight and ask the researcher to attach/export a supported `.xlsx` file. Never substitute another workbook.
- Read-only preflight should verify the target opens and contains a uniquely identifiable row/section for the requested UC/run. It may inspect the workbook before measurement. Do not modify it before canonical metrics are committed.

## Automatic export after commit

1. Complete the requested Measure operation and verify canonical/mirror equality.
2. Invoke `export-experiment-excel` with mapping profile `measure_telemetry_only` and `measurement_scope` equal to the just-closed phase (`prompt_generation`, `source_generation`, or `repair`) or `workflow` for `finalize-workflow`.
3. Map only recognized cells for that exact scope: input, cached input, output, reasoning output and total tokens; captured duration; workflow turn count; observable tool-call count; and model-call count only if it is genuinely available. Do not write other closed phases again unless the researcher explicitly requests a refresh.
4. Omit BR met/unmet/not-evaluable, Figma/UI accuracy, flow accuracy, complexity, repair judgments and all other manual columns from the mapping. Do not write `N/A` into those cells. A recognized telemetry cell whose committed value is unavailable may receive literal `N/A` with its reason.
5. Preserve the supplied workbook. Save a new output copy under the Business repository `outputs/measure-excel/`, using a collision-safe name containing the input stem, UC, run and measured scope. Return the new workbook and fill receipt. The next Measure call may target this new copy to accumulate another scope, or may target a different workbook.

If Excel authoring fails after the canonical commit, report `METRICS_SAVED / EXCEL_FAILED`, the exact error and the unchanged input workbook. Do not repeat Measure; an export-only retry reads the already committed JSON. Success is `METRICS_SAVED / EXCEL_SAVED`.
