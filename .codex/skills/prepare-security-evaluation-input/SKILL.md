---
name: prepare-security-evaluation-input
description: Prepare and researcher-approve the SR-blind product-level evaluation input required before run-third-party-security-scan. Use when the frozen finalsource snapshot is terminal but no Approved JSON exists under docs/03-audit/security-tools/finalsource/inputs/, when an input must be created for a changed source hash, or when the scan skill directs the researcher here. Never inspect SRs, prompts, generation audit/repair records, or experiment-run reports.
---

# Prepare Security Evaluation Input

Read `AGENTS.md`, `PROJECT_CONTEXT.md`, `docs/00-context/security/SECURITY-TOOL-EVALUATION.md`, the Approved criteria catalog, the selected Approved evaluation policy, and `templates/security-evaluation/final-source-security-evaluation-input.template.json`.

1. Remain SR-blind. Read only evaluator policy/catalog/contracts, `finalsource/`, and evaluator-owned input/output paths. Treat the UC range as provenance only.
2. Require the researcher to state that generation/audit/repair for the current product snapshot is terminal and provide or confirm the stable researcher ID, immutable evaluation ID, contributing UC range, and selected Approved policy.
3. Run `scripts/prepare_security_evaluation_input.py` without `--approve` to produce a proposal on stdout. It computes the current `finalsource/` tree hash and policy checksum and validates the Approved catalog/policy. Do not write an input yet.
4. Present the proposal and ask the researcher to explicitly approve that evaluation ID, current source hash, policy, and UC provenance. A statement that UC execution finished is not approval of this evaluator input.
5. Only after explicit approval in the current conversation, rerun the script with `--approve`. It writes exactly one immutable input under `docs/03-audit/security-tools/finalsource/inputs/<evaluation-id>.json` and validates it. Never overwrite an existing input or output directory.
6. Return the created path and direct the researcher to call `$run-third-party-security-scan <created-path>`.

Do not start Docker, run scanners, alter `finalsource/`, create functional tests, or approve on behalf of the researcher.

Example proposal command:

```bash
python3 .codex/skills/prepare-security-evaluation-input/scripts/prepare_security_evaluation_input.py \
  --evaluation-id EVAL-FINAL-UC001-UC016-001 \
  --researcher thiemjason \
  --uc-from UC-001 \
  --uc-to UC-016 \
  --policy security-tools/evaluation-policies/third-party-a01-a02.json
```

After explicit approval, append `--approve` to the same command.
