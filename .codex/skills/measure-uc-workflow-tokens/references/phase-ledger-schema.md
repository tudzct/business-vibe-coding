# Execution timing and phase protocol

Use `timing_method: system_timestamp_delta` with `timing_protocol: generation_execution_only_v1`. The AI invokes the helper at the following boundaries; the helper records the actual system instant and code calculates the delta. It does not infer readiness automatically. This is not UI Worked-for or full-turn latency.

| Execution | START | END |
|---|---|---|
| Prompt | After all required inputs, configuration, frozen resources, Figma resolution and gates are ready; immediately before generating the Draft | Immediately after the complete Draft is persisted, before researcher review/approval |
| First-pass Source | After preflight/approval/activation, immediately before the first source mutation | Immediately after complete first-pass source generation, before build, audit, runtime verification or repair |
| Each Repair | After defect selection, sub-prompt planning, required resolution and authorization; immediately before executing the correction | After correction and permitted evidence collection, before appending the repair audit |

Never start a generation timer merely because a request arrived or a phase remains open. Configuration, approvals, missing-input/Figma resolution, standalone audit/runtime, finalization and reporting are outside execution intervals. For an unexpected blocker during execution, end the segment before resolution or researcher waiting; start a fresh segment only when generation resumes. Retain time already spent on actual failed execution; never exclude attempts merely for failing.

Resolve an available Python executable first; do not assume python/python3 is on PATH. Substitute it for <python-executable> (PowerShell: & '<absolute-python-path>' ...).

```text
<python-executable> .codex/skills/measure-uc-workflow-tokens/scripts/capture_timestamp.py --run-json <canonical.json> --session <rollout.jsonl> --turn-id <current-id> --phase prompt_generation --event start --segment-id prompt-001 --source-revision sha256:<actual-64-hex>
<python-executable> .codex/skills/measure-uc-workflow-tokens/scripts/capture_timestamp.py --run-json <canonical.json> --session <rollout.jsonl> --turn-id <current-id> --phase prompt_generation --event end --segment-id prompt-001 --source-revision sha256:<actual-64-hex>
```

For `--phase repair`, pass `--repair-id <canonical-repair-id>` on both endpoints and abandonment. Each repair has its own pair and ID matching `run.repairs[].repair_id`; resumed segments may share that repair ID but require unique segment IDs. Preserve failed/blocked repair records. Never reuse an interval for several repairs or invent per-repair token splits.

The helper obtains timezone-qualified `at` and `epoch_ms` from one local system instant. Raw identities include UC/run/session/turn/phase/segment/event/source revision, timing protocol and repair ID where applicable. Start/end revisions may differ; other identities must match. Never type, reuse or backfill endpoints. Duration is `(end.epoch_ms - start.epoch_ms)/1000`; ISO and epoch must agree within one second. Reject negative/overlapping intervals. End each segment in its own turn, before response completion or researcher waiting, including asynchronous approval. Tool/AI work inside an execution interval contributes elapsed seconds; never convert time into tokens.

The first core START opens that phase and binds `first_turn_id`. An open phase is a lifecycle window, not a continuously running timer. Auxiliary-only turns inside it do not start a core timer. If prerequisites block the first execution, retain `not_started`, report the blocker and do not fabricate successful phase closure. After researcher confirmation, the internal telemetry engine runs in a later gate-close turn and closes the phase at that turn ID; later work cannot return to a closed phase. A reopened request requires a new run/explicit amendment protocol. Never execute different core phases or close a phase and perform new work in one turn.

If an earlier terminal/aborted turn lost its END, use `--event abandon --segment-id <unfinished-id> --reason <evidence-backed-reason>` in a later turn with current turn ID and original phase/repair ID. This records the missing endpoint and permits subsequent work without inventing an end. The original selected generation turn must retain `timing_unavailable_reason`; phase/workflow time remains null. Never abandon a running turn to evade measurement.

## Aggregation and evidence

- Phase time sums only that phase's non-overlapping execution intervals. `metrics.repair_timing` records each canonical repair's seconds, segment IDs and missing-evidence reason. Missing repair endpoints make repair time unavailable, not zero.
- Workflow time = Prompt execution + first-pass Source execution + all Repair executions. Pending/missing phase time makes workflow time null; explicitly skipped repair contributes zero. This is not all workflow activity or first-to-last-message elapsed time.
- Auxiliary-only turns need no generation timestamps. Their counted generation seconds are zero with `timing_exclusion_reason`, not a claim of zero actual elapsed time. Optional auxiliary diagnostic captures remain raw evidence only, never included in phase/workflow seconds.
- Tokens remain independent: apply selection-schema.md to all UC work including setup/approval/dataset/audit-only turns. Mixed turns keep one semantic primary label; seconds still come only from actual core segments. Every Measure/report-only turn is excluded from both metrics.

`phase-ledger.json` is machine authority; `phase-ledger.md` is its generated view. Both live beside `workflow-metrics.json` in `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/`. The journal records timing protocol, phase state, segments and measurement boundaries. Canonical `metrics.phase_ledger` is the last committed snapshot. Writers lock the run and atomically replace individual files; canonical metrics commit first and mirrors recover from that snapshot. Historical ledgers/metrics without this protocol are read-only: use a new run. Never relabel old broad timestamps or overwrite closed observations to make numbers match.

Prompt/source/repair remain measurement buckets inside the two-phase research method. Full and RQ3 require Source Gate closure after the first-pass hold, then first-pass BR/flow evidence and explicit researcher repair authorization. Persist the actual decision as `repair_authorization: {"approved": true, "turn_id": "<actual-approval-turn>"}`. The helper checks ordering/existence; the AI checks the message permits repair. Approval may share the later repair turn, never source generation or telemetry gate closure. Telemetry closure is not repair approval. Preserve first-pass evidence unchanged.
