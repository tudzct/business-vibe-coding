# Flow follow-up and requested repair

Historical policy ID `flow-followup-auto-repair-v1` remains readable for existing receipts. For new operations, follow [the researcher command sequence](../FILE-DRIVEN-WORKFLOW.md); there is no automatic repair after audit or follow-up.

1. Resolve the exact UC/run and preserve frozen baseline and accepted result provenance. Save partial results and offer researcher verdicts or bounded LLM measurement.
2. Save either follow-up directly in canonical JSON, preserving original assessments, source, BRs, telemetry and existing receipts. Accept researcher results with attribution, never as fabricated LLM runtime proof.
3. The continuation helper reports `measurement_pending` while unknown flows remain, or `await_repair_request` when conclusive results expose defects. Acknowledge the save and wait for `$bug-fixing-sub-prompt`; do not ask a separate Repair Decision confirmation or automatically edit source.
4. That command records authorization through `record_command.py --action repair` with its actual turn ID (dry-run first) and starts bounded repair immediately. Require source telemetry closed, initial audit saved, conclusive accepted flow results and an evidenced defect on current source. Missing evidence alone is not a repair target. Existing historical authorizations retain their recorded scope.
5. If every BR/flow passes on unchanged source, record repair unnecessary, preserve initial evidence as terminal observation, retain equal initial/final BR results and skip correction. The researcher runs `finalize-workflow` once; it persists the skipped Repair bucket and finalizes the workflow atomically. Do not invent a final audit or repair timing.

Within requested repair, automatically verify BR/flow/runtime on final source and freeze its hash/status before returning the next close command. Never reopen a terminal run, rewrite historical evidence, mix source revisions or create/run tests. Docker Compose v2 remains mandatory for runtime; material business/API/schema ambiguities require concrete researcher resolution.
