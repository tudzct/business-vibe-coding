---
name: gen-bug-fixing-prompt
description: Generate one complete bug-fixing sub-prompt per repairable defect from the Audit defects handoff without modifying source.
---

# Generate Bug-fixing Prompts

Apply the [shared operational constitution](../../../AGENTS.md#shared-operational-constitution).

Invoke this skill as `$gen-bug-fixing-prompt <path-to-defects-handoff.json>`. This operation generates prompt artifacts only and belongs to the existing `repair` measurement bucket.

## Content boundary

The completed prompt content has exactly two input sources:

1. the explicitly supplied `defects-handoff.json`;
2. [sub-prompt.template.md](../../../templates/construction/sub-prompt.template.md).

Read both in full. The handoff must identify one UC/run, pass `scripts/validate_sub_prompts.py --handoff <path> --check-handoff-only`, and have the exact canonical location declared by its own `uc_id` and `run_id`.

Do not read any other file for prompt content. The following operation-specific prohibitions apply:

- do not read any file under `finalsource/` or `docs/01-inception/`;
- do not read `docs/00-context/FIGMA-LINK-REVIEW.md`, `docs/00-context/engineering/schema.dbml`, or any file under `resource/figma-design-dataset/`;
- do not read any generated Coding Prompt under `docs/02-construction/coding-prompts/`;
- do not read any `defects-handoff.json` other than the one exact handoff supplied to this operation;
- do not read any file under a `flow-accuracy/` directory beneath `docs/02-construction/implementation/`, any file under `docs/03-audit/`, or any `source-input.json` or `source-output.json`;
- do not read existing prompt contents under the target `repairs/` directory; it is a write target, not an additional input source;
- do not open the contents of `docs/04-experiments/configurations/*.json`, `docs/04-experiments/<UC-ID>/canonical-run-*.json`, `docs/02-construction/implementation/<UC-ID>/*-baseline.json`, or `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/{run-activation,phase-ledger,workflow-metrics}.{json,md}`; and
- do not directly connect to, read or query a live database.

Technical documents required by the active operation may constrain execution but must not supply prompt content. Execute-only helpers may inspect exact active-run configuration, handoff, output-directory and telemetry state internally. Use only their exit status and emitted results; a managed path emitted by a helper does not authorize reading that file.

## Generation

1. Read `sub-prompt.template.md` in full and strictly follow the instructions declared inside it. Read the supplied Defects Handoff in full as the defect-information source used to complete the template.
2. If the validated handoff has `status: no_repair_required` and an empty `defects` array, report that no prompt is required and stop. Do not create the repairs directory or capture Repair timing.
3. Otherwise require `status: ready`, a non-empty `defects` array and unique defect IDs/fingerprints. Preserve handoff order. Create exactly one file per root-cause defect, even when that defect affects multiple BRs, Flows, APIs, UI targets or files.
4. Use repair indexes `1..N` and write only to `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/repairs/repair-<NNN>-<DEFECT-ID>.md`. Do not overwrite an existing non-identical artifact.
5. Author each completed sub-prompt with the model from the matching Handoff defect and the template instructions. This is prompt generation, not a mechanical JSON-to-Markdown conversion. The model may organize and phrase the defect information clearly, but it must not invent, omit or contradict Handoff facts.
6. Preserve every identifier, fingerprint, source revision, evidence fact/content, BR/OCL definition, OCL Utility Definition, Flow/API authoritative text and required behavior. Authoritative material may be surrounded by explanatory prose but must remain verbatim.
7. Represent every Handoff evidence item in the template's Evidence section. Record category, description and reproduction steps once; repeat the source file, line range, locator, defect finding and content fields for each evidence item. Use `N/A` for a null line range.
8. Populate Known affected files from `scope.affected_files`. Populate Affected targets from all remaining non-empty scope arrays. Do not inspect any referenced path.
9. If an instruction or placeholder cannot be completed because the Handoff is missing, invalid, ambiguous or contradictory, report the exact field and stop. Do not repair the Handoff or invent a replacement.
10. Do not add permitted verification, implementation strategy, inferred requirements, features, evidence, paths or identifiers. Do not dump the Handoff as raw JSON. The output directory is a write target, not a third content source.

## Control and measurement

Immediately before the first prompt-artifact write, derive the active Canonical Run path from the validated handoff identity and execute `.codex/scripts/capture_timestamp.py --run-json <derived-canonical-path> --phase repair --event start --repair-activity sub_prompt_generation --segment-id <one-unique-segment-id> --source-revision <handoff-source-revision>`. The helper resolves rollout/turn information internally. Do not supply or guess either value and do not read the helper or Canonical Run.

After the complete set is written:

1. execute `scripts/validate_sub_prompts.py --handoff <path> --prompt-dir <repairs-directory>`;
2. execute `scripts/record_prompt_handoff.py --handoff <path> --prompt-dir <repairs-directory>` to persist only `repair_prompt_directory`, `all_sub_prompt_count`, per-defect `repair_round_limit: 10`, total `repair_rounds_completed: 0` and `repair_status: not_started`;
3. capture Repair END with the same shared helper, segment ID and `repair_activity`.

Helpers are execute-only. Use only their exit status and emitted result; do not inspect their source or the files they manage. If generation fails after START, capture END before responding and preserve the actual failed work.

Report the prompt count and every generated path, then stop. Do not modify `finalsource/`, invoke Repair, or invoke another top-level operation. Do not create or run tests.
