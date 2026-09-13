# Experiment gate transitions

| Pending gate | Researcher confirmation | Internal action | Next gate |
|---|---|---|---|
| configuration | confirms displayed `.env` projection | freeze schema-2.3 configuration with BR/flow paths and Figma version/checksum | prompt generation |
| prompt | approves Draft | persist approval and close prompt telemetry | run activation/source generation |
| source | confirms first-pass evidence | close source telemetry | first-pass audit |
| first-pass audit | confirms audit execution | run non-test checks, BR audit and flow audit; preserve initial evidence | repair decision |
| repair decision | authorize or skip | persist exact decision/turn; for skip retain unchanged first-pass evidence and terminal status | repair or final metrics |
| repair | confirms repair with automatic BR/flow/runtime verification already persisted | close repair telemetry | final metrics |
| final metrics | confirms terminal summary | finalize workflow telemetry and refresh report | complete |

Every transition stores `status`, confirmation turn ID and timestamp under canonical run `gates`. A close turn never begins work belonging to the next row. Schema/public API/ownership/destructive ambiguities create a separate decision gate and do not count as confirmation of the pending gate.

Configuration also freezes `flow_audit_rubric: completion-critical-flow-runtime-v2`; legacy configurations remain v1. First-pass audit and automatic repair verification resolve the same rubric through activation/configuration checksum. Runtime-v2 requires actual integrated completion evidence for `correct`; repair work observes all flows on final source before repair closure. No-repair completion retains the initial observation on unchanged source, without relabelling its ID/stage/time. Preserve first-pass artifacts, report runtime blockers/unknowns, and return defects to Repair Decision Gate. Audit/runtime never extends generation execution time.

Use the [shared Full/RQ3 contract](../../../../docs/00-context/workflow/FULL-RQ3-CONTRACT.md). The gate recorder checks the same evidence preconditions for both variants and supports read-only `--dry-run`. Initialize canonical gates at `configuration`; do not create a later starting gate or backfill historical transitions. Prompt Gate requires the approved `coding_prompt` path/hash and closed prompt telemetry; Source Gate additionally verifies activation and closed source telemetry. First-pass audit requires initial evidence; repaired-source closure requires final evidence already produced within repair. First-pass gate receipts pin result hashes, and later gates preserve them. Record skip with `--reason` describing the actual researcher decision; skip goes directly to final metrics with equal initial/final BR results and unchanged source hash. An obsolete pending `final_audit` can use `--gate final_metrics` after evidence/telemetry validation without another audit turn. Missing UI scores are not a gate condition.
