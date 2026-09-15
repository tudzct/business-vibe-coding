---
name: advance-experiment-gate
description: Record internal Business experiment command steps without extra confirmation gates; preserve historical receipts and wait for explicit repair commands after follow-ups.
---

# Record Workflow Commands

This compatibility skill records internal command steps; it never presents or requests a human confirmation gate. Read [FILE-DRIVEN-WORKFLOW.md](../../../docs/00-context/workflow/FILE-DRIVEN-WORKFLOW.md).

Use `scripts/record_command.py --run-json <canonical.json> --action <action> --turn-id <actual-id>` (dry-run first for work actions). Actions: `approve-prompt --prompt <prompt.md>`, `prompt-close`, `source-close`, `audit`, `repair`, `repair-close`, `finalize`. The researcher never needs to invoke this helper.

Prompt close approves/pins the Draft before Measure; Measure automatically records its completed close/finalize action after successful persistence. After initial BR/flow audit is saved, run `--action audit` in that audit turn. It records no-repair automatically only when all frozen results pass. At the repair command, run `--action repair` and begin correction in the same work turn without another confirmation. Preserve immutable initial assessments and evidence hashes; internal historic gate names remain compatibility bookkeeping.

After researcher or LLM follow-up saves, `continue_after_flow.py` reports measurement pending, waits for a repair request when defects remain, or records all-passing skip. It never grants new automatic repair authorization. Retain existing historical authorizations and never reopen terminal runs. Optional activation/UI evidence is not a prerequisite.

Prompt telemetry close (Turn 2) automatically creates a missing `run-activation.json` from the pinned configuration and approved prompt, or validates an existing receipt without replacing it. The receipt records the actual prompt-close turn/time, before source generation. No standalone activation turn is required.
