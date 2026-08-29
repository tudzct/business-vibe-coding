# File-driven workflow

The method has exactly two phases. Frozen inputs, approved prompts and first-pass evidence are immutable; later artifacts reference them by path and checksum.

## Phase 1

1. Select one frozen `docs/01-inception/use-cases/uc-*.md` projection and the `full` or `rq3` prompt variant recorded by the Confirmed experiment configuration.
2. Verify the UC checksum and recorded Sheet ID, tab, range and retrieval time. Compare raw bytes first; if only line endings differ, require an exact canonical-LF or canonical-CRLF checksum match and retain `docs/02-construction/implementation/<UC-ID>/source-checksum-normalization.json`. Do not rewrite the frozen UC or refresh connected sources for a line-ending-only match.
3. Resolve every associated BR in source order. Create `docs/02-construction/business-rules/<UC-ID>-business-rules.{json,md}` and freeze `docs/02-construction/implementation/<UC-ID>/business-rule-baseline.json`; do not select, omit or add rules.
4. Resolve referenced API and checksum-valid frozen Figma evidence when applicable. Do not infer a missing or ambiguous mapping.
5. Generate one Draft prompt:
   - Full: `docs/02-construction/coding-prompts/<UC-ID>-business-coding-prompt.md`, containing Prompts A-F.
   - RQ3: `docs/02-construction/coding-prompts/<UC-ID>-rq3-coding-prompt.md`, containing only Prompts A-D. Keep Prompt E, Prompt F and BR baseline content out of this artifact.
6. Stop for researcher resolution if an ambiguity changes behavior, rule meaning, public API, ownership, schema or destructive behavior. Otherwise obtain researcher approval and mark the prompt `Approved`.

## Phase 2

1. Validate the `Approved` prompt against one Confirmed experiment configuration, then activate exactly one run before modifying `finalsource/`.
2. Generate only the source required by the approved prompt. For RQ3, validate baseline identity without loading BR expressions into generation context; load them only after first-pass generation stops.
3. Stop the initial timer and preserve the first-pass source hash, model/time/token metadata and source evidence before any repair.
4. Run permitted lint, typecheck and production-build commands and authorized Docker observations. Record exactly one first-pass result for every frozen BR as `met`, `unmet` or `not_evaluable` from inspectable evidence.
5. For RQ3, stop after the first-pass assessment. Run no repair sub-prompt unless the researcher explicitly enables the repair condition.
6. When repair is authorized, create one bounded sub-prompt per evidenced defect, apply the smallest correction, retain the repair record and reassess affected BRs without overwriting first-pass results.
7. Freeze the final `finalsource/` hash and complete the canonical run JSON only when the run reaches a terminal state.

Schema changes require an approved `docs/02-construction/implementation/<UC-ID>/schema.json` before entity or migration edits. No workflow step creates or runs tests or test cases, and Docker Compose is the only supported runtime path.
