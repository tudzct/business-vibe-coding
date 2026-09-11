# Explicit post-turn selection

Use one task/session per UC/run. All commands are run from the Business repository. Resolve a real canonical run path and explicit rollout path, not the latest file. The canonical JSON must exist with `uc_id` and `run_id` before opening prompt metrics; use the configured run identity. This Draft bookkeeping does not activate source generation.

Prepare a private temporary selection JSON (absolute rollout paths must not be copied into public results):

```json
{
  "uc_id": "UC-01",
  "run_id": "UC-01-R1",
  "session_path": "C:/private/rollout.jsonl",
  "turns": [
    {"turn_id": "setup-turn-id", "phase": "uc_setup", "reason": "Setup specific to UC-01 before prompt phase"},
    {"turn_id": "prompt-turn-id", "phase": "prompt_generation", "reason": "Generate UC-01 Draft"},
    {"turn_id": "approval-turn-id", "phase": "prompt_generation", "reason": "Approval while prompt phase is open"}
  ],
  "excluded_turns": [],
  "workflow_evidence": {
    "start": {"turn_id": "setup-turn-id", "required_terms": ["UC-01"]},
    "terminal": {"turn_id": "approval-turn-id", "required_terms": ["approve"]}
  }
}
```

Each later selection retains previously selected rows/reasons and adds new work. Every turn between workflow start and the current measurement turn must be selected or explicitly excluded. Intermediate Measure turns must be excluded with reason `measurement/report turn`. The current measurement turn is supplied separately by `--measurement-turn-id` and automatically excluded. Start/terminal text markers must match the actual user messages; start must identify the UC. Do not save message contents in results.

Core phases: `prompt_generation`, `source_generation`, `repair`. Auxiliary workflow-only phases: `configuration_and_approval`, `dataset_resolution`, `audit`, `runtime_verification`, `finalization`, `uc_setup`. A required clarification/blocked/approval turn inside an open core phase belongs to that core phase. A UC-specific skill before phase start belongs only to workflow. Common setup before the UC and other UC work are excluded with reasons.

Optional selected-turn fields: `repair_id` references a real canonical repair record; `timing_unavailable_reason` is mandatory if a captured endpoint is absent. Never fill missing endpoints with rollout or current timestamps. On `finalize-workflow`, `repair_skip_reason` records the researcher decision if no repair was performed. An unstarted phase has unavailable values; a recorded skipped repair is explicitly distinguished from missing evidence.

Boundary checks use explicit start/completion events. Aborted turns with terminal events remain chargeable; interrupted turns without an end are not finalized. The extractor refuses incomplete/missing token evidence rather than guessing. Unsupported legacy rollout boundaries require an explicit extractor extension, not latest-turn heuristics.

The output's `metrics.phases.<phase>.values` contains `tokens`, `duration_seconds`, `workflow_turn_count`, `tool_call_count`, and nullable `model_call_count`. `metrics.workflow` has the same fields and covers all selected work. Workflow is provisional while `status=open`; phase-close records become immutable. No prompt+source+repair subtotal is emitted.
