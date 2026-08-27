---
name: bug-fixing-sub-prompt
description: Repair one evidenced error in initially generated or previously repaired source by creating a bounded bug-fixing sub-prompt, applying the smallest correction, rerunning permitted non-test checks, and appending repair telemetry and audit evidence without changing immutable first-pass results. Use after gen-source-code has recorded its first-pass audit and a syntax, compile, lint, runtime, security, UI, or flow error remains; do not use for new features, speculative refactors, tests, or unresolved product/security decisions.
---

# Execute a Bug-fixing Sub-prompt

Read the approved coding prompt, current audit, current source/diff, `templates/construction/sub-prompt.template.md`, `references/repair-contract.md`, affected FE/BE skill instructions and the audit skill. Treat the first-pass source and audit fields as immutable evidence.

## Preconditions

1. Require a persisted first-pass audit for the run before any repair.
2. Require reproducible evidence from a permitted build, lint, runtime, SCA, source/config review, Figma review or flow review.
3. Stop for the researcher when the repair would change authorization, ownership, public API, schema, approved behavior or accepted residual risk.
4. Do not repair an inferred or unevidenced problem.

## Execute one iteration

1. Assign the next stable ID `repair-NNN`; one invocation equals one repair entry.
2. Classify the primary objective as `technical`, `security`, `ui` or `flow`. Use `security` only when the objective directly repairs one or more frozen Prompt E SR IDs. A compile repair remains `technical` even if it later makes an SR evaluable.
3. Read `runs/<RUN-ID>/run-activation.json`, validate its configuration checksum and resolve the complete tuple from the Confirmed configuration. Use it for repair unless the researcher explicitly assigns another complete tuple. Immediately before execution, capture the dedicated automatic timestamp pair.
4. Create `docs/02-construction/implementation/<UC-ID>/sub-prompts/<repair-ID>.md` from the template. Include exact evidence, error fingerprint, affected requirement IDs, current source revision and explicit non-goals.
5. Identify the root cause. Invoke the affected React and/or NestJS skill and make the smallest coherent source correction under `finalsource/`. Do not add a feature or broaden the parent prompt.
6. Rerun only the permitted check that exposed the error plus the smallest relevant build/lint/runtime evidence. Do not create or run tests/test cases.
7. Immediately after the correction and its permitted evidence collection complete, before the repair audit is appended, run the same capture script for the end timestamp. Persist `timing_method: system_timestamp_delta`, both raw endpoint pairs and `duration_seconds = (ended_epoch_ms - started_epoch_ms) / 1000`. Reject negative duration; never type, estimate or backfill endpoints. Capture effective model and token telemetry from the repair runner when exposed; otherwise retain `null` with a reason.
8. Invoke `$audit-generation-metrics`. Append repair telemetry and generation-audit evidence. Preserve the frozen Prompt E list. Security-tool findings are outside this repair loop and must never trigger or influence this sub-prompt.
9. Report resolved, unresolved or blocked. A later error requires a new skill invocation, a new repair ID and a new timer.

## Safety and stopping

- Never weaken validation or Prompt E controls to make a check pass.
- Never combine unrelated errors merely to reduce the measured sub-prompt count.
- Stop when evidence is insufficient, the same error fingerprint remains after three consecutive repair attempts, or the next change requires a human decision.
- Preserve all previous sub-prompt artifacts and telemetry. Unknown time/token/model fields remain `null` with a reason; never estimate them.

## Metric contract

Every invocation appends one item to `repairs[]` and therefore increments `all_sub_prompt_count`. Every item must retain its own raw wall-clock endpoints and duration; aggregate repair duration is derived from these individual values. Only category `security` increments `security_repair_sub_prompt_count`. All categories contribute to all-repair time/tokens and whole-UC totals. Read `references/repair-contract.md` for the required record schema and classification rules.
