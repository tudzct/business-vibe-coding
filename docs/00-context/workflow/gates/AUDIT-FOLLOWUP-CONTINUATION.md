# Audit follow-up continuation

Save one attributed follow-up covering BRs, flows or both, then return a validated continuation status. The existing skip receipt retains policy ID `audit-followup-continuation-v1` and pins the evidence establishing that no correction is required.

1. Resolve the exact UC/run and preserve frozen baselines and accepted result provenance. Save partial or challenged results and offer an attributed researcher verdict or bounded LLM re-audit.
2. Save the response directly in canonical JSON, preserving original assessments, source, telemetry and existing receipts. Unmentioned BR/Flow results remain unchanged. Accept researcher results with attribution, never as fabricated LLM implementation/runtime proof.
3. The continuation helper reports `measurement_pending` while normal unknown BRs or Flows remain, `await_repair_request` when conclusive results expose defects, or an all-passing status. `execution_blocked` is not researcher-overridable through follow-up; preserve its canonical blocking defect for an authorized consumer. Never edit source from this continuation operation.
4. Require source telemetry closed, initial audit saved and evidence pinned to the current source. Missing evidence alone is not a source-correction target.
5. If every BR/flow passes on unchanged source, record correction unnecessary and preserve initial evidence as terminal observation. Do not invent final evidence or timing.

Never reopen a terminal run, rewrite recorded evidence, mix source revisions or create/run tests. Docker Compose v2 remains mandatory for runtime; material business/API/schema ambiguities require concrete researcher resolution.
