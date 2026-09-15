# Automatic repair after a flow follow-up

Policy ID: `flow-followup-auto-repair-v1`.

## Manual-result exception and repair readiness

For new decisions, a saved `mode: researcher_result` follow-up does not authorize repair. If defects remain and every frozen flow has a conclusive accepted verdict, the helper returns `await_repair_request`, preserving gates and authorization. Acknowledge that the results were saved and wait for the researcher's subsequent `$bug-fixing-sub-prompt` invocation. That invocation constitutes explicit authorization: validate prerequisites, record `repair_decision` with outcome `authorized` and its actual turn ID using `record_gate.py` (dry-run first), then start bounded repair immediately in the same turn without another audit or repair confirmation. This is a decision/work turn, not telemetry closure.

If any accepted flow is still `not_evaluable`, return `measurement_pending` and reject new repair authorization, including an explicit bug-fixing invocation. Save conclusive researcher results or complete authorized measurement first; missing observations alone are not defects. Researcher verdicts retain their attribution and do not require a second LLM runtime measurement. If all BRs and accepted flows pass, keep the existing no-defect skip/Final Metrics path.

These rules override the automatic-repair and partial-measurement permission below for new decisions. The existing LLM remeasurement path remains automatic when all flow verdicts are conclusive and defects exist. Preserve historical policy receipts and already authorized repair scopes; do not rewrite or revoke them.

The researcher has authorized this repository policy: after researcher-provided flow results or a requested bounded LLM remeasurement are saved, the LLM records the applicable Repair Decision and continues into bounded repair in the same work turn, without asking for another repair confirmation. Apply identically to Full and RQ3. This policy concerns follow-ups, not the initial First-pass Audit Gate or telemetry closure.

## Ordered operations

1. Resolve the exact active UC/run. Follow `audit-flow-accuracy/references/follow-up-measurement.md`, validate and save the follow-up in Canonical Run JSON. The scorer/helper remains flow-only: preserve source, BRs, telemetry and gate history during this write. Preserve researcher attribution and immutable evidence. A failed write or summary-only refresh does not trigger continuation.
2. Return to the workflow coordinator. Inspect the current gate, source and saved results. Source telemetry must already be closed and First-pass Audit Gate must already have its immutable receipt. Do not close that audit gate and begin repair in the same turn. Verify the actual source hash using the run's existing hash procedure; pass that verified value to the continuation helper. Never substitute a stored hash without checking current source. Stale results remain accepted report evidence but cannot justify repairs on a different source.
3. After tracing reported failures to bounded defects on current source, run the helper below with `--dry-run`, then repeat without it. The helper revalidates configuration/activation, initial BR/flow evidence, prior gate hashes, latest saved follow-up, source identity and decision outcome. It locks the run and atomically writes only the decision/authorization and applicable no-repair status. It never edits application source or closes telemetry.
4. For `begin_repair`, immediately invoke `bug-fixing-sub-prompt` in the same work turn. Do not stop to ask for permission to repair or request another researcher message. Create one scoped artifact per evidenced defect, capture repair START only before the correction, then repair and automatically verify BR/flow/runtime before Repair Gate. Assessment and repair are sequential operations; source must remain unchanged throughout the earlier assessment.
5. For `final_metrics`, report the pending Final Metrics Gate; do not finalize metrics in this work turn. For `measurement_pending`, keep partial results and offer the existing two measurement paths without creating a new gate. A missing observation is not a defect. For `no_transition`, retain the existing gate and repair scope; never start another cycle from replaying a follow-up. Within an already authorized repair, return new findings to its caller under its existing bounds.

```text
<python-executable> -B .codex/skills/advance-experiment-gate/scripts/continue_after_flow.py --run-json <canonical.json> --followup-id <saved-id> --turn-id <actual-work-turn-id> --source-revision sha256:<verified-current-hash> --dry-run
```

The LLM invokes this helper automatically after either saved follow-up path, not after each raw assessment or report refresh. Terminal runs and gates outside `repair_decision` receive no new transition. A terminal run still pending that gate is rejected rather than reopened. Do not modify unrelated historical runs.

## Decision rules

| Validated results on the current source | Next action |
|---|---|
| At least one evidenced BR `unmet` or accepted flow `incorrect` | Record automatic authorization and begin bounded repair, even if other results remain pending |
| No known failures but any BR/flow remains `not_evaluable` | Keep measurement pending; no speculative repair and no automatic skip |
| All BRs `met` and all accepted flows `correct` | Record `skipped` with a no-defect reason and proceed to Final Metrics, retaining unchanged initial evidence |

For automatic skip, final BR values must already equal initial values, no repairs may have executed, and the current source must match the initial audited hash. The reason is `repair unnecessary`, never a fabricated researcher refusal. Report final-source runtime limitations separately from accepted researcher results.

## Receipt and timing

Keep existing `repair_decision` outcomes `authorized`/`skipped` and historical explicit receipts. Automatic receipts use `decided_at` instead of `confirmed_at`, the actual decision work `turn_id`, and `automatic_decision` containing policy ID/path/checksum, triggering follow-up ID/checksum, source revision and defect BR/flow IDs. `repair_authorization` keeps `approved` and `turn_id` and adds `mode: automatic_policy` plus that same `automatic_decision`. The turn is a decision execution reference, not a new researcher approval. The repository policy supplies the standing authorization. Historical authorization without `mode` remains an explicit researcher decision.

The only same-turn gate/work exception is this automatic Repair Decision after a saved follow-up. It does not close a telemetry phase. Prompt, Source, First-pass Audit, Repair and Final Metrics confirmation boundaries remain. The mixed follow-up/repair turn receives one actual primary token label; repair seconds exclude earlier evaluation, decision recording and waiting. No source or repair work is permitted inside a telemetry-close turn.

Configuration pins, activation, frozen baselines, original assessments and prior receipts remain immutable. New receipts pin the accepted summary at the decision. Later conclusive results can replace accepted verdicts without rewriting those receipts. Repeated continuation after a recorded decision is a no-op, including after interruption; inspect existing repair artifacts and timing before resuming an authorized correction.

Stop for ambiguous business/API/ownership meaning, unapproved schema changes, destructive actions, source drift or unavailable mandatory runtime. A fingerprint still failing after three attempts retains its existing stop rule. These constraints do not require another generic repair confirmation.
