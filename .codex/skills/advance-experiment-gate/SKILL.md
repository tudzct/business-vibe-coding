---
name: advance-experiment-gate
description: Persist and validate one explicitly supplied internal command receipt without inferring another operation.
---

# Record Workflow Commands

This skill is a deterministic internal recorder. It executes only the exact action supplied by its authorized caller, never infers a future action and never presents or requests a human confirmation gate.

Use `scripts/record_command.py --run-json <canonical.json> --action <action> --turn-id <actual-id>` (dry-run first for work actions). The caller supplies the action and required artifact paths. The researcher never needs to invoke this helper. Do not expose the state-machine roadmap to an unrelated operation.

Prompt close approves/pins the Draft before Measure; Measure automatically records its completed close/finalize action after successful persistence. After initial BR/Flow/defect audit is saved, run `--action audit` in that audit turn. It records no-repair automatically only when all frozen results pass and no canonical defect remains open. At the repair command, run `--action repair` and begin correction in the same work turn without another confirmation. Normal `not_evaluable` results remain pending; complete-inventory `execution_blocked` is eligible only when its open generated-source blocking defect is pinned. Preserve immutable initial assessments and evidence hashes; internal gate names identify command steps.

After one researcher or LLM audit follow-up is saved, `continue_after_flow.py` evaluates the accepted BR and flow results together, reports measurement pending, waits for a repair request when defects remain, or records all-passing skip. It never grants new automatic repair authorization. Never reopen terminal runs. Optional activation/UI evidence is not a prerequisite.

When the supplied action owns activation persistence, it creates a missing `run-activation.json` from the pinned configuration and approved prompt, or validates an existing receipt without replacing it. The receipt records the actual action turn/time. No receipt authorizes a future action.
