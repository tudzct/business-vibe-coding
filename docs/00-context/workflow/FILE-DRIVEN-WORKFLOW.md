# File-driven workflow

The method has exactly two phases. Frozen inputs, approved prompts and first-pass evidence are immutable; later artifacts reference them by path and checksum.

The telemetry buckets `prompt_generation`, `source_generation`, `repair` do not add a research-method phase. Use one task per UC/run and the shared timing protocol. Capture only actual Prompt/first-pass Source/Repair execution intervals. After each work response, show a plain-language gate. On researcher confirmation, `advance-experiment-gate` invokes telemetry internally in a later gate-close turn; the researcher never invokes Measure/Audit skills. Gate-close turns are excluded and never begin later generation work.

Internal telemetry never reads or writes Excel. After Final Metrics Gate, the researcher may separately invoke `export-experiment-excel`; BR/Figma/flow/manual columns remain unchanged.

The repository also provides `audit-figma-ui-accuracy` as a standalone optional tool. The researcher may call it manually in a separate turn, inspect UI by eye, or skip UI scoring entirely. No phase or confirmation gate calls it automatically. An absent/null `ui_accuracy` or UI score, or an unsuccessful optional UI comparison, must never block BR/flow validation, telemetry closure, report generation, Excel export or completion. Scorer evidence checks apply only inside the optional request and do not create a new gate.

## Phase 1

1. Load researcher defaults from root `.env`. If missing, create it from `.env.example`, list all blank researcher fields once and stop. After completion, show one Configuration Gate summary and persist a new schema-2.2 Confirmed configuration only after confirmation. Pin the active Figma version and manifest checksum.
2. Select one frozen `docs/01-inception/use-cases/uc-*.md` projection and the configured `full` or `rq3` variant.
3. Verify the UC checksum and recorded Sheet ID, tab, range and retrieval time. Compare raw bytes first; if only line endings differ, require an exact canonical-LF or canonical-CRLF checksum match and retain `docs/02-construction/implementation/<UC-ID>/source-checksum-normalization.json`. Do not rewrite the frozen UC or refresh connected sources for a line-ending-only match.
4. Resolve every associated BR and explicit flow in source order. Freeze `business-rule-baseline.json` and `flow-baseline.json`; do not select, omit or add rules/flows.
5. Resolve referenced API and checksum-valid frozen Figma evidence when applicable. Do not infer a missing or ambiguous mapping.
6. Generate one Draft prompt:
   - Full: `docs/02-construction/coding-prompts/<UC-ID>-business-coding-prompt.md`, containing Prompts A-F.
   - RQ3: `docs/02-construction/coding-prompts/<UC-ID>-rq3-coding-prompt.md`, containing only Prompts A-D. Keep Prompt E, Prompt F and BR baseline content out of this artifact.
7. Show Prompt Gate. On confirmation, approve the prompt and close prompt telemetry internally. Stop before source work.

## Phase 2

1. Require closed prompt telemetry and validate the `Approved` prompt against one Confirmed experiment configuration, then activate exactly one run before modifying `finalsource/`.
2. Generate only the source required by the approved prompt. For RQ3, validate baseline identity without loading BR expressions into generation context; load them only after first-pass generation stops.
3. Preserve first-pass source/hash/model/raw-time evidence and show Source Gate. On confirmation, close source telemetry internally and stop.
4. Show First-pass Audit Gate. On confirmation, run permitted checks and Docker observations, assess every frozen BR and invoke `audit-flow-accuracy`. Optional UI inspection or a separate researcher invocation of `audit-figma-ui-accuracy` is outside this gate and never a prerequisite.
5. Show Repair Decision Gate. Run no repair unless the researcher explicitly authorizes it; preserve an explicit skip decision.
6. When repair is authorized, create one bounded sub-prompt per evidenced defect and save it precisely under `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/repairs/`. Apply the smallest correction, retain the repair record and reassess affected BRs without overwriting first-pass results.
7. End repair work at Repair Gate; confirmation closes repair telemetry. Final Audit Gate confirmation runs final BR/flow/runtime audit and freezes the hash. Final Metrics Gate confirmation internally finalizes canonical metrics and reports.

Schema changes require an approved `docs/02-construction/implementation/<UC-ID>/schema.json` before entity or migration edits. No workflow step creates or runs tests or test cases, and Docker Compose is the only supported runtime path.
