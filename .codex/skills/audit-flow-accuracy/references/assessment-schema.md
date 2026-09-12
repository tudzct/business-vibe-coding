# Flow baseline and assessment schema

## Frozen baseline

`docs/02-construction/implementation/<UC-ID>/flow-baseline.json` contains:

```json
{
  "schema_version": 1,
  "artifact_type": "flow-baseline",
  "status": "Frozen",
  "uc_id": "UC-01",
  "use_case_path": "docs/01-inception/use-cases/uc-01-register-account.md",
  "use_case_sha256": "sha256:<64 hex>",
  "frozen_at": "<ISO-8601>",
  "ordered_flow_ids": ["BF-1", "AF-1", "EF-1"],
  "counts": {"main": 1, "alternative": 1, "exception": 1, "total": 3},
  "flows": [{
    "flow_id": "BF-1",
    "type": "main",
    "title": "Basic Flow",
    "source_anchor": "Functional Use-Case Specification / Basic Flow",
    "branch_from_step": null,
    "terminal_outcome": "<observable completion outcome>",
    "steps": [{
      "step_id": "BF-1.1",
      "text": "<frozen step>",
      "completion_critical": true,
      "criticality_reason": "<why failure blocks completion>"
    }]
  }]
}
```

Types are `main`, `alternative`, and `exception`. Flow and step IDs are unique and source ordered. Explicit nested variants may use `UC-08.1/BF-1`; referenced “identical” flows are not copied.

## Assessment input

```json
{
  "uc_id": "UC-01",
  "run_id": "<RUN-ID>",
  "assessment_id": "<path-safe ID>",
  "stage": "initial",
  "source_revision": "sha256:<64 hex>",
  "captured_at": "<ISO-8601>",
  "baseline": {"path": "docs/02-construction/implementation/UC-01/flow-baseline.json", "sha256": "sha256:<64 hex>"},
  "limitations": [],
  "flows": [{
    "flow_id": "BF-1",
    "terminal_outcome": {"status": "met", "evidence": [{"path": "<repo path>", "sha256": "sha256:<64 hex>"}], "rationale": "<observation>"},
    "steps": [{"step_id": "BF-1.1", "status": "met", "evidence": [{"path": "<repo path>", "sha256": "sha256:<64 hex>"}], "rationale": "<observation>"}]
  }]
}
```

`stage` is `initial` or `final`; observation status is `met`, `unmet` or `not_evaluable`. Evidence must be repository-local and checksum-valid.

The scorer appends `flow_accuracy.assessments`, updates `flow_accuracy_percent`, `flow_error_percent` and `flow_accuracy_status`, and writes `flow-accuracy/<assessment-id>.{json,md}` beside run evidence. Same-ID retries are idempotent; changed content with the same ID fails.
