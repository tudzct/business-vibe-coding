# Repair contract

Each repair addresses one evidenced fingerprint and records: repair ID, sub-prompt path, category (`technical`, `business_rule`, `ui`, or `flow`), trigger, affected BR IDs, source revisions before/after, bounded evidence before/after, changed files, status, model, automatic time endpoints and tokens.

Allowed triggers are `syntax`, `compile`, `lint`, `runtime`, `business_rule_review`, `ui_review` and `flow_review`. A `business_rule` repair references at least one frozen BR. All repairs count toward the total; preserve every prior record and initial assessment.

Both Full and RQ3 repairs require closed source telemetry, persisted first-pass BR assessment and researcher authorization after source measurement. Record live timestamp segment IDs and exact turn IDs. Measure finalizes per-turn/per-phase tokens later. If multiple repair invocations share one turn, do not invent a token split; retain the turn as an indivisible repair-phase observation. Never append current-turn token estimates as final values.

Each repair execution requires its own live START/END pair with `--repair-id` matching the canonical record. START after planning/resolution/authorization, immediately before correction; END after correction plus permitted evidence collection, before audit appending. Persist raw identity/ISO/epoch endpoints and segment references. Measure derives `metrics.repair_timing.<repair_id>`; missing endpoints yield null with a reason. Workflow time sums Prompt + first-pass Source + every repair execution, regardless of outcome; it excludes standalone auxiliary work.
