# Assessment input and persistence

Run from the Business repository root, using the available Python executable:

```text
python .codex/skills/audit-figma-ui-accuracy/scripts/score_ui_accuracy.py --run-json docs/05-experiments/UC-01/run-1.json --assessment <assessment.json> --dry-run
python .codex/skills/audit-figma-ui-accuracy/scripts/score_ui_accuracy.py --run-json docs/05-experiments/UC-01/run-1.json --assessment <assessment.json>
```

The AI creates the assessment input from inspected evidence, not estimated percentages. Paths are repository-relative. Each `evidence` item is `{ "path": "...", "sha256": "sha256:..." }` and must identify an existing Business artifact. Retain screenshots before scoring; do not use mutable screenshots from a different source revision.

Required fields:

- `uc_id`, `run_id`, unique path-safe `assessment_id`, `stage` (`initial` or `final`), `source_revision`, timezone-qualified `captured_at`.
- `design_status`: `complete`, `no-design`, or `blocked`. `dataset_id`, `dataset_version`, `resolver_evidence` (file/hash). Verify these against the pinned configuration/prompt before using the calculator. Resolver evidence must have the matching UC (zero padding may differ) and dataset, plus successful checksums for `complete`/`no-design`.
- `limitations`: list of concrete limitations, possibly empty. `reason` required for blocked/no-design. Blocked saves null, not_applicable is only no-design.
- For complete designs: `inventory_evidence` file/hash, `reference_screenshots` list of file/hash; `runtime_screenshots` list of file/hash with `state`, `viewport` (`width`,`height`), `source_revision`, `browser`, `device_scale`, `fonts` and `captured_at`.
- `structure`: nonempty list of `{ "id": "frozen node/group ID", "status": "met|unmet|not_evaluable", "evidence": [file/hash], "rationale": "observation" }`. These IDs must exactly match `visible_node_ids` in the frozen inventory JSON.
- `categories`: object with exactly the six rubric keys, each a nonempty list of checkpoint objects with `id`, `status`, `evidence`, `rationale`. The inventory JSON has `category_checkpoint_ids` with exactly those categories and ordered ID lists. Same inventory checksum must be retained across scored assessments of a run.
- `perceptual_similarity`: `{ "deterministic_environment": true, "value": null, "reason": "Comparator not available" }` when unavailable. If value is available (0–1), also require `method`, `version`, `settings`, and `evidence` pointing to a reproducible comparison receipt. That receipt must bind the reference/runtime screenshot hashes. Record a reason when the environment is not deterministic.

Each category uses binary checkpoint scores. `not_evaluable` is not removed from the denominator; it leaves the overall percentage null until evidence exists. No freehand overall score is accepted.

Canonical run additions:

```text
ui_accuracy.schema_version = 1
ui_accuracy.rubric_id = security-ui-weighted-v1
ui_accuracy.assessments[] = immutable computed snapshots, including full input/evidence
ui_accuracy.current_assessment_id = last accepted assessment
ui_accuracy_percent = current weighted percentage, or null
ui_accuracy_status = scored | repair_required | similarity_pending | not_evaluable | not_applicable
```

One initial assessment is allowed. Final assessments append history; an identical assessment ID/content is idempotent, but reuse with changed content fails. Initial cannot be appended after final. The canonical JSON is the source of truth; a same-ID retry regenerates a missing derived report after an interrupted write. Reports are `runs/<RUN-ID>/ui-accuracy/<assessment_id>.{json,md}`. Writes use the shared run lock and preserve BR/Measure fields. Existing records without this block remain valid and unscored.
