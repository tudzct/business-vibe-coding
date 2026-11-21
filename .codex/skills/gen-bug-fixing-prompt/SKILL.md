---
name: gen-bug-fixing-prompt
description: Generate one complete bug-fixing sub-prompt per repairable defect from the Audit defects handoff without modifying source.
---

# Generate Bug-fixing Prompts

Apply the [shared operational constitution](../../../AGENTS.md#shared-operational-constitution).

Invoke this skill as `$gen-bug-fixing-prompt <path-to-defects-handoff.json>`. This operation generates prompt artifacts only and owns the independent `sub_prompt_generation` measurement phase. It never performs source Repair.

## Technical and Control-Plane Material

Technical and control-plane material may be read only to operate this workflow and must not add product behavior, requirements or defect facts. Permitted material is `AGENTS.md`, this skill and its own references, [technical stack rules](../../../docs/00-context/engineering/TECHNICAL-STACK-RULES.md), [database policy](../../../docs/00-context/engineering/DATABASE-SCHEMA.md), the [active-run contract](../../../docs/00-context/workflow/WORKFLOW-CONTRACT.md), and output emitted by required execute-only helpers.

## Content boundary

The following operation-specific read prohibitions apply:

- do not read any file under `finalsource/` or `docs/01-inception/`;
- do not read `docs/00-context/FIGMA-LINK-REVIEW.md`, `docs/00-context/engineering/schema.dbml`, or any file under `resource/figma-design-dataset/`;
- do not read any generated Coding Prompt under `docs/02-construction/coding-prompts/`;
- do not read any `defects-handoff.json` other than the one exact handoff supplied to this operation;
- do not read any file under a `flow-accuracy/` directory beneath `docs/02-construction/implementation/`, any file under `docs/03-audit/`, or any `source-input.json` or `source-output.json`;
- do not read existing prompt contents under the target `repairs/` directory; it is a write target, not an additional input source;
- do not open the contents of `docs/04-experiments/configurations/*.json`, `docs/04-experiments/<UC-ID>/canonical-run-*.json`, `docs/02-construction/implementation/<UC-ID>/*-baseline.json`, or `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/{run-activation,phase-ledger,workflow-metrics}.{json,md}`; and
- do not directly connect to, read or query a live database.

Execute-only helpers may inspect exact active-run configuration, handoff, output-directory and telemetry state internally. Use only their exit status and emitted results; a managed path emitted by a helper does not authorize reading that file.

## Phase 1: Read-only Preflight & START

Before START, execute `scripts/validate_sub_prompts.py --handoff <path> --check-handoff-only`. Use its bounded identity/status/count result without opening additional control-plane files. If the validated handoff has `status: no_repair_required` and an empty `defects` array, report that no prompt is required and stop. Do not create the repairs directory or capture Sub-prompt Generation timing. Otherwise require `status: ready`, a non-empty defect inventory and an exact active-run identity.

Once preflight passes, derive the active Canonical Run path from that validated identity and capture live Sub-prompt Generation START immediately with `.codex/scripts/capture_timestamp.py --run-json <derived-canonical-path> --phase sub_prompt_generation --event start --segment-id <one-unique-segment-id> --source-revision <handoff-source-revision>`. The helper resolves rollout/turn information internally. Do not supply or guess either value and do not read the helper or Canonical Run.

## Phase 2: Generate the complete sub-prompt set

1. Read `templates/construction/sub-prompt.template.md` in full and follow its instructions.
2. Preserve handoff order and unique defect IDs/fingerprints. Create exactly one file per root-cause defect, even when that defect affects multiple BRs, Flows, APIs, UI targets or files.
3. Use repair indexes `1..N` and write only to `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/repairs/repair-<NNN>-<DEFECT-ID>.md`. Do not overwrite an existing non-identical artifact from a prior completed handoff or run.
4. If generation cannot proceed because the validated Handoff or required template material is missing, invalid, ambiguous or contradictory, report the exact problem and stop. Do not repair the Handoff or invent a replacement.

## Phase 3: Validate, persist & END

After the complete set is written:

1. execute `scripts/validate_sub_prompts.py --handoff <path> --prompt-dir <repairs-directory>`; if validation reports structural, identity, scope-inventory, or unresolved-placeholder errors on the drafts just created in this invocation (before `record_prompt_handoff.py` and END capture), fix those draft files and re-run `scripts/validate_sub_prompts.py`;
2. execute `scripts/record_prompt_handoff.py --handoff <path> --prompt-dir <repairs-directory>` to persist only `repair_prompt_directory`, `all_sub_prompt_count`, per-defect `repair_round_limit: 10`, total `repair_rounds_completed: 0` and `repair_status: not_started`;
3. capture Sub-prompt Generation END with `.codex/scripts/capture_timestamp.py --run-json <derived-canonical-path> --phase sub_prompt_generation --event end --segment-id <same-segment-id> --source-revision <handoff-source-revision>`.

Helpers are execute-only. Use only their exit status and emitted result; do not inspect their source or the files they manage. If generation fails after START and cannot be resolved by fixing the current drafts, capture END before responding and preserve the actual failed work.

Report the prompt count and every generated path, then stop. The next top-level operation is `$measure-uc-workflow close-phase sub_prompt_generation`; do not invoke it or Repair in this turn. Do not modify `finalsource/` or create/run tests.
