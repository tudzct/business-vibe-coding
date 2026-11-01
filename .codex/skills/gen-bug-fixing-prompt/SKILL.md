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

Do not read any other file for prompt content. In particular, do not read `finalsource/`, `docs/00-context/`, `docs/01-inception/`, `docs/04-experiments/`, `resource/`, raw evidence or log directories, measurement artifacts, Coding Prompts, other UC/run/model artifacts, Git history or branches, or instructions/templates/resources belonging to another skill. Do not read script source. Active instructions and execute-only helpers control the operation but are not prompt-content inputs.

## Generation

1. If the validated handoff has `status: no_repair_required` and `defect_count: 0`, report that no prompt is required and stop. Do not create the repairs directory or capture Repair timing.
2. Otherwise require `status: ready`, a positive `defect_count`, unique defect IDs/fingerprints and only open handoff defects. Preserve handoff order. Create exactly one file per root-cause defect, even when that defect affects multiple BRs, Flows or Flow steps.
3. Use repair indexes `1..N` and write only to `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/repairs/repair-<NNN>-<DEFECT-ID>.md`. Do not overwrite an existing non-identical artifact.
4. Fill every template field from the matching handoff defect. Preserve all identifiers, evidence facts, evidence content, authoritative correction text and supporting definitions exactly. Render every evidence item as its own numbered Markdown subsection. Use a `json` or `text` fence for copied content and write `N/A` when handoff content is `null`. Use an `ocl` fence for OCL correction text and each supporting definition; use a `text` fence for Flow, natural-language or technical correction text. Do not dump the handoff as raw JSON and do not paraphrase authoritative text.
5. `affected_flow_ids` contains parent Flow IDs. `affected_flow_step_ids` contains exact affected step IDs such as `BF-1.1`, `AF-1.3a` or `EF-1.4a`. Copy both arrays unchanged. Copy `affected_files` unchanged; do not inspect those paths.
6. Do not add `permitted verification`, implementation strategy, inferred requirements, features, evidence, paths or identifiers. The output directory is a write target, not a third content source.

## Control and measurement

Immediately before the first prompt-artifact write, derive the active Canonical Run path from the validated handoff identity and execute `.codex/scripts/capture_timestamp.py --run-json <derived-canonical-path> --phase repair --event start --repair-activity sub_prompt_generation --segment-id <one-unique-segment-id> --source-revision <handoff-source-revision>`. The helper resolves rollout/turn information internally. Do not supply or guess either value and do not read the helper or Canonical Run.

After the complete set is written:

1. execute `scripts/validate_sub_prompts.py --handoff <path> --prompt-dir <repairs-directory>`;
2. execute `scripts/record_prompt_handoff.py --handoff <path> --prompt-dir <repairs-directory>` to persist only `repair_prompt_directory`, `all_sub_prompt_count`, `repair_round_limit: 10`, `repair_rounds_completed: 0` and `repair_status: not_started`;
3. capture Repair END with the same shared helper, segment ID and `repair_activity`.

Helpers are execute-only. Use only their exit status and emitted result; do not inspect their source or the files they manage. If generation fails after START, capture END before responding and preserve the actual failed work.

Report the prompt count and every generated path, then stop. Do not modify `finalsource/`, invoke Repair, or invoke another top-level operation. Do not create or run tests.
