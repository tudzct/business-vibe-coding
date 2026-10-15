---
name: gen-bug-fixing-prompt
description: Generate one complete bug-fixing sub-prompt for every evidenced open defect in the validated active run without modifying source.
---

# Generate Bug-fixing Prompts

Apply the [shared operational constitution](../../../AGENTS.md#shared-operational-constitution).

Invoking `$gen-bug-fixing-prompt` authorizes prompt-artifact generation only. Resolve the exact active UC/run with closed source telemetry and a saved accepted initial BR/Flow/defect audit. Consume the canonical run, accepted audit results and checksummed defect evidence as handoff artifacts; do not read the producer skill's instructions or the source-repair skill. Read [sub-prompt.template.md](../../../templates/construction/sub-prompt.template.md) as this operation's private prompt contract.

1. Select every canonical `initial` defect whose status is `open`. Keep canonical order, require a unique defect ID and fingerprint, and create one prompt per root-cause defect rather than one prompt per affected BR or Flow. `not_evaluable` without a canonical defect is not a repair prompt.
2. Before writing, require the canonical `repairs` array to be empty and refuse ambiguous, missing or non-checksummed evidence. Use repair indexes `1..N` and filenames `repair-<NNN>-<DEFECT-ID>.md` under `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/repairs/`. Do not overwrite an existing non-identical artifact.
3. Fill every template field and section from the canonical defect, its immutable evidence and the current source revision. Include defect identity/fingerprint/category/trigger, all affected BR/Flow IDs, exact evidence references, a bounded required correction, allowed files, permitted non-test verification and prohibited changes. Do not leave placeholders or invent evidence, requirements or features.
4. Generate the complete set in this one invocation. Run `scripts/validate_sub_prompts.py --run-json <canonical.json> --prompt-dir <repairs-directory>` and require an exact one-to-one match between the initial defect inventory and generated prompt files.
5. Report the prompt count and every generated path, then stop. Do not modify `finalsource/`, canonical Audit results, `repairs`, authorization, gates, timing or metrics. Do not invoke repair or another top-level operation.

Do not create or run tests.
