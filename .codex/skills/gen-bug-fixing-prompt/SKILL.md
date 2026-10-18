---
name: gen-bug-fixing-prompt
description: Generate one complete bug-fixing sub-prompt for every evidenced open defect in the validated active run without modifying source.
---

# Generate Bug-fixing Prompts

Apply the [shared operational constitution](../../../AGENTS.md#shared-operational-constitution).

Invoking `$gen-bug-fixing-prompt` authorizes prompt-artifact generation only. Resolve the exact active UC/run with closed source telemetry and a saved accepted initial BR/Flow/defect audit. Consume the canonical run, accepted audit results and checksummed defect evidence as handoff artifacts; do not read the producer skill's instructions or the source-repair skill. Read [sub-prompt.template.md](../../../templates/construction/sub-prompt.template.md) as this operation's private prompt contract. This operation belongs to the existing `repair` measurement bucket; it does not create a separate sub-prompt phase or metric.

1. Select every canonical open `initial` defect that remains repairable under the accepted researcher verdicts. A `business_rule` defect remains repairable while at least one affected BR is `unmet`; a `flow` defect remains repairable while at least one affected Flow is `incorrect`; a `technical` defect remains repairable while open. Keep canonical order, require a unique defect ID and fingerprint, and create one prompt per root-cause defect rather than one prompt per affected BR or Flow. `not_evaluable` without a canonical defect is not a repair prompt.
2. Before writing, require the canonical `repairs` array to be empty and refuse ambiguous, missing or non-checksummed evidence. Use repair indexes `1..N` and filenames `repair-<NNN>-<DEFECT-ID>.md` under `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/repairs/`. Do not overwrite an existing non-identical artifact.
3. Fill every template field and section from the canonical defect, its immutable evidence and the current source revision. Include defect identity/fingerprint/category/trigger, all affected BR/Flow IDs, exact evidence references, a bounded required correction, allowed files, permitted non-test verification and prohibited changes. Do not leave placeholders or invent evidence, requirements or features.
4. Immediately before the first prompt-artifact write, capture Repair START with `.codex/scripts/capture_timestamp.py --run-json <canonical.json> --phase repair --event start --repair-activity sub_prompt_generation --segment-id <one-unique-segment-id> --source-revision sha256:<actual-64-hex>`. The helper resolves the active rollout and turn internally; never supply or guess either path or ID. Generate the complete set in this one invocation. Run `scripts/validate_sub_prompts.py --run-json <canonical.json> --prompt-dir <repairs-directory> --record-handoff`; require an exact one-to-one match between the accepted repairable initial defects and generated prompt files. This command validates the full set and atomically persists only repository-relative `repair_prompt_directory`, `all_sub_prompt_count`, `repair_round_limit: 10`, `repair_rounds_completed: 0` and `repair_status: not_started`.
5. Preserve Audit results, `repairs`, authorization, gates and canonical `metrics` value-for-value. Capture Repair END with the same shared helper, segment ID and `repair_activity` immediately after the complete prompt set and handoff metadata are persisted. If generation fails after START, end the segment before responding and preserve the actual failed work.
6. Report the prompt count and every generated path, then stop. Do not modify `finalsource/` or invoke repair or another top-level operation.

Do not create or run tests.
