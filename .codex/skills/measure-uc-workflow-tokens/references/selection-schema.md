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
    {"turn_id": "approval-turn-id", "phase": "configuration_and_approval", "reason": "Only approved the existing Draft; no prompt generation or revision"}
  ],
  "excluded_turns": [],
  "workflow_evidence": {
    "start": {"turn_id": "setup-turn-id", "required_terms": ["UC-01"]},
    "terminal": {"turn_id": "approval-turn-id", "required_terms": ["approve"]}
  }
}
```

Each later selection retains previously selected rows/reasons and adds new work. Every completed turn in the session before the current measurement turn must be selected or explicitly excluded, including turns before the selected workflow start. Inspect these earlier turns so UC-specific configuration/setup is not silently omitted. Intermediate Measure turns must be excluded with reason `measurement/report turn`. The current measurement turn is supplied separately by `--measurement-turn-id` and automatically excluded. Start/terminal text markers must match the actual user messages; start must identify the UC. Do not save message contents in results.

Core token labels: `prompt_generation`, `source_generation`, `repair`. Auxiliary workflow-only token labels: `configuration_and_approval`, `dataset_resolution`, `audit`, `runtime_verification`, `finalization`, `uc_setup`. Assign by the turn's actual primary work, not the currently open timing bucket or the skill named in the request.

| Actual primary work | Token label |
|---|---|
| Generate/revise the coding prompt | `prompt_generation` |
| Implement first-pass source | `source_generation` |
| Execute a source correction | `repair` |
| Only prepare/confirm configuration, activate a run, approve an artifact or resolve an approval gate | `configuration_and_approval` |
| Only resolve Figma/dataset inputs, including a missing-dataset blocker | `dataset_resolution` |
| Assess implementation, observe runtime, finalize evidence, or prepare UC-specific environment | `audit`, `runtime_verification`, `finalization`, or `uc_setup` |

All selected labels contribute to workflow tokens. Only a matching core label contributes to that core's tokens. A failed generation/repair attempt still counts under its actual work; failure alone never moves it to auxiliary or excludes it. A request to generate code that only receives an approval blocker is auxiliary. If approval and generation happen in one turn, choose the primary phase from the full work evidence and retain the whole turn under that one label. Never split tokens between activities or classify solely by keywords. Explain ambiguous/mixed classifications in `reason`; surface unresolved uncertainty to the researcher before committing. Common setup before the UC and other UC work are excluded with reasons.

The script checks labels and sums; it cannot prove semantic intent. Auxiliary labels are allowed between core phase open/close boundaries. Core labels must remain inside their own generation window so a later turn cannot silently change a closed phase. This lifecycle check does not assign the token label. No new workflow steps are required.

Optional selected-turn fields: `repair_id` references a real canonical repair record; `timing_unavailable_reason` is mandatory if a captured endpoint is absent. Never fill missing endpoints with rollout or current timestamps. On `finalize-workflow`, `repair_skip_reason` records the researcher decision if no repair was performed. An unstarted phase has unavailable values; a recorded skipped repair is explicitly distinguished from missing evidence.

Boundary checks use explicit start/completion events. Aborted turns with terminal events remain chargeable; interrupted turns without an end are not finalized. The extractor refuses incomplete/missing token evidence rather than guessing. Unsupported legacy rollout boundaries require an explicit extractor extension, not latest-turn heuristics.

Schema 2 output's `metrics.phases.<phase>.values` contains `tokens`, `duration_seconds`, `workflow_turn_count`, `tool_call_count`, and nullable `model_call_count`. Tokens and counts follow semantic `turns[].phase`; duration follows `turns[].timing_phase`, derived from existing captured segments/ledger, not entered by the classifier. Thus a config-only turn can have token phase `configuration_and_approval` and timing phase `prompt_generation`. Reclassification never changes captured time. `metrics.token_phase_breakdown` retains all selected labels (including auxiliary), five token fields and turn/tool counts. `metrics.workflow` covers all selected work. Workflow is provisional while `status=open`; phase-close records become immutable. No prompt+source+repair subtotal is emitted. Schema 1 records remain read-only under their original attribution semantics.
