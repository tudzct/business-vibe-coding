# File-driven workflow

## Phase 1

1. Select one `docs/01-inception/use-cases/uc-*.md` projection.
2. Verify its Sheet provenance and checksum.
3. Create `docs/02-construction/business-rules/<UC-ID>-business-rules.{json,md}` with all rules in order.
4. Freeze `docs/02-construction/implementation/<UC-ID>/business-rule-baseline.json`.
5. Resolve referenced Figma data when applicable.
6. Generate `docs/02-construction/coding-prompts/<UC-ID>-business-coding-prompt.md` using Prompts A-F.
7. Obtain researcher approval for unresolved decisions and the completed prompt.

## Phase 2

1. Load one Confirmed experiment configuration and activate one run.
2. Generate source in `finalsource/` from the approved prompt.
3. Record the initial generation and one assessment for every frozen BR.
4. Repair evidenced defects with bounded sub-prompts; retain every revision record.
5. Run permitted non-test checks and Docker observations.
6. Freeze the final source hash and complete the canonical run JSON.

No workflow step creates or runs tests or test cases.
