# Repair contract

Each repair addresses one evidenced fingerprint and records: repair ID, sub-prompt path, category (`technical`, `business_rule`, `ui`, or `flow`), trigger, affected BR IDs, source revisions before/after, bounded evidence before/after, changed files, status, model, automatic time endpoints and tokens.

Allowed triggers are `syntax`, `compile`, `lint`, `runtime`, `business_rule_review`, `ui_review` and `flow_review`. A `business_rule` repair references at least one frozen BR. All repairs count toward the total; preserve every prior record and initial assessment.

Both Full and RQ3 repairs require closed source telemetry, persisted first-pass BR assessment and researcher authorization after source measurement. Record live timestamp segment IDs and exact turn IDs. Measure finalizes per-turn/per-phase tokens later. If multiple repair invocations share one turn, do not invent a token split; retain the turn as an indivisible repair-phase observation. Never append current-turn token estimates as final values.
