# Experiment metrics schema

The canonical run JSON records:

- configuration, UC, model, replicate, order, wall-clock time and token use;
- frozen final-source checksum;
- initial and final assessment for every frozen BR;
- each BR status: `met`, `unmet` or `not_evaluable`, with evidence and rationale;
- repair count/time/tokens and affected BR IDs;
- optional researcher estimates, UI/flow accuracy and structural complexity.

Required consistency:

- assessed BR IDs exactly equal the baseline's ordered BR IDs;
- each BR occurs once per assessment snapshot;
- overall totals equal status counts;
- repairs never mutate the immutable initial snapshot;
- claims require inspectable source, configuration, build or bounded runtime evidence;
- prompt text alone is not evidence.

No test metrics or generated test cases are part of this schema.
