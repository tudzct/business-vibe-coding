# Defects handoff contract

`defects-handoff.json` is a derived Audit artifact. Canonical Run JSON remains the complete authority for assessments, follow-ups, provenance, metrics and defect history. The handoff contains only the accepted, conclusive, currently repairable findings needed by the next authorized operation.

Build or rebuild it only for the standalone initial Audit and its authorized follow-ups, before another operation consumes the results. A subordinate verifier and any run with later-operation activity already recorded must not create, replace or enrich it.

Write the artifact only to:

```text
docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/defects-handoff.json
```

Use `assets/defects-handoff.template.json` as the structural example and `scripts/build_defects_handoff.py` as the only writer. The builder validates the canonical run, accepted BR/Flow projections, immutable evidence, checksum-pinned specifications and exact output path. It writes atomically and validates the persisted artifact again.

## Selection

- Include an open `business_rule` defect only when at least one of its affected BRs has the accepted result `unmet`.
- Include an open `flow` defect only when at least one of its affected Flows has the accepted result `incorrect`.
- Include every open `technical` defect.
- Exclude `met`, `correct`, `not_evaluable` and resolved findings. `not_evaluable` is not a defect.
- If any accepted BR or Flow remains `not_evaluable`, do not create or replace the handoff.
- If all results are conclusive and no repairable defects remain, write `status: no_repair_required` with an empty `defects` array.

## Audit-supplied enrichment

Pass enrichment through stdin; do not create an intermediate payload file. The root object contains only `defects`. Each entry may contain:

```json
{
  "defect_id": "DEFECT-ID",
  "affected_flow_step_ids": ["BF-1.3", "AF-1.3a", "EF-1.4a"],
  "affected_files": ["finalsource/path/to/file.ts"],
  "evidence_annotations": {
    "path/to/evidence.txt": {
      "source_file": "finalsource/path/to/file.ts",
      "line_start": 10,
      "line_end": 14,
      "locator": "function name or runtime action",
      "observed_fact": "direct observation",
      "defect_finding": "evidence-backed finding"
    }
  },
  "required_correction": {
    "mode": "evidence_derived",
    "representation": "observable outcome",
    "text": "bounded correct outcome",
    "supporting_definitions": []
  }
}
```

`affected_flow_step_ids` identifies exact steps under the parent IDs in `affected_flow_ids`. Use `BF-1.1` for Basic Flow steps and prefix the source labels of Alternative or Exception Flow steps with their parent, for example `AF-1.3a` and `EF-1.4a`. Keep only parent Flow IDs in `ordered_flow_ids`; step IDs do not change the Audit denominator.

Every `flow` defect must name at least one exact step for every affected parent Flow. If the whole Flow is affected, list all of its steps. A non-blocking `technical` defect that names affected parent Flows follows the same rule. An execution-blocking technical root cause may leave both Flow arrays empty when no precise step can be observed; do not invent step IDs.

The builder derives exact `verbatim_authoritative` corrections for BR and Flow defects from the checksum-pinned specifications. For a BR it preserves the authoritative rule text and only the referenced shared utility definitions. For a Flow it preserves the exact source lines for every listed step. Audit supplies `evidence_derived` correction text only for technical defects; it states the observable correct outcome and must not prescribe an implementation strategy.

Evidence annotations locate and explain already immutable evidence. Text and JSON evidence content is copied into the handoff, optionally limited by validated line bounds. Images remain referenced by path, hash and media type and carry the confirmed visual observation; they are never embedded as base64.

The output deliberately has no `target_ids`, `source`, `basis`, `context_label`, researcher-message history, prompt path, configuration path, model metadata, metrics, gates, repair strategy, permitted-verification list or prohibited-change list. Category plus affected IDs identifies the target; immutable evidence identifies the source; `required_correction` carries only the accepted correction contract.

Run dry-run first with the same stdin payload, then persist:

```text
python -B .codex/skills/audit-generation-metrics/scripts/build_defects_handoff.py --run-json <canonical.json> --input - --dry-run
python -B .codex/skills/audit-generation-metrics/scripts/build_defects_handoff.py --run-json <canonical.json> --input -
```
