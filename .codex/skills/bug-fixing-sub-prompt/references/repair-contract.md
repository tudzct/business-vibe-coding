# Repair contract

Each repair addresses one evidenced fingerprint and records: repair ID, sub-prompt path, category (`technical`, `business_rule`, `ui`, or `flow`), trigger, affected BR IDs, source revisions before/after, bounded evidence before/after, changed files, status, model, automatic time endpoints and closed-turn token provenance. If multiple repairs share a turn, store tokens only at the aggregate repair stage and do not divide or duplicate that turn across repair records.

Allowed triggers are `syntax`, `compile`, `lint`, `runtime`, `business_rule_review`, `ui_review` and `flow_review`. A `business_rule` repair references at least one frozen BR. All repairs count toward the total; preserve every prior record and initial assessment.
