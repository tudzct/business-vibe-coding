# File-driven workflow

The method has exactly two phases. Frozen inputs, approved prompts and first-pass evidence are immutable; later artifacts reference them by path and checksum.

The telemetry buckets `prompt_generation`, `source_generation`, `repair` do not add a research-method phase. Use one task per UC/run and the shared `.codex/skills/measure-uc-workflow-tokens/references/phase-ledger-schema.md` protocol. Capture live timestamp segments during work, then let the researcher invoke Measure in a later turn to close each bucket. UC-specific confirmations, blockers and resolution inside an open bucket belong to that bucket; work before its start belongs only to workflow. Common setup outside the UC is recorded separately. Exclude all measurement/report-only turns. Never finalize tokens in the measured work response.

The researcher may append `Excel target: <path-or-link>` to any Measure invocation. After Measure commits the requested phase/workflow telemetry, it invokes `export-experiment-excel` in telemetry-only mode and saves a new filled workbook copy. The target is scoped to that invocation and is never reused implicitly. Automatic Measure export never writes BR/Figma/flow or other researcher-maintained columns. Excel/report work remains excluded from telemetry; an Excel failure after commit does not invalidate or repeat the Measure boundary.

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

1. Require closed prompt telemetry and validate the `Approved` prompt against one Confirmed experiment configuration, then activate exactly one run before modifying `finalsource/`.
2. Generate only the source required by the approved prompt. For RQ3, validate baseline identity without loading BR expressions into generation context; load them only after first-pass generation stops.
3. Stop the initial work timer, preserve first-pass source/hash/model/raw-time evidence and end the turn for both Full and RQ3. Leave tokens pending. Hold before repairs and separate audit until the researcher invokes Measure in a later turn to close source telemetry.
4. In a subsequent audit turn, run permitted lint/typecheck/build and authorized Docker observations against first-pass evidence. Record exactly one evidenced first-pass result for every frozen BR. This separate audit belongs to workflow, outside the closed source bucket.
5. For both Full and RQ3, stop after first-pass assessment. Run no repair sub-prompt unless the researcher explicitly authorizes repair after source measurement. Preserve RQ3 Sub-prompt-off as a recorded decision.
6. When repair is authorized, create one bounded sub-prompt per evidenced defect and save it precisely under `docs/02-construction/implementation/<UC-ID>/runs/<RUN-ID>/repairs/`. Apply the smallest correction, retain the repair record and reassess affected BRs without overwriting first-pass results.
7. End repair work before its researcher Measure closure. Perform requested final audit/runtime/finalization, then freeze the final hash and terminal run evidence. A later `finalize-workflow` measurement updates canonical `metrics` and derived result files. Work completion and post-run metrics finalization are separate states.

Schema changes require an approved `docs/02-construction/implementation/<UC-ID>/schema.json` before entity or migration edits. No workflow step creates or runs tests or test cases, and Docker Compose is the only supported runtime path.
