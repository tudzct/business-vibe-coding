# Experiment configuration gate

A comparison group uses one Confirmed configuration before any run mutates source. It fixes:

- configuration/comparison-group/researcher identifiers;
- UC IDs and expected ordered BR IDs;
- generation and audit model assignments;
- replicate indexes and unique run order;
- audit protocol and timing method.

New schema 2.1 configurations fix `timing_method` to `system_timestamp_delta`. The validator rejects a missing or different value. Confirmed legacy configurations remain immutable under their original schema and checksum; do not edit them in place merely to add this field.

Exactly one run is activated through its `run-activation.json` before source-generation model/version capture, source timing or source mutation. A Draft canonical UC/run identity and live prompt/setup telemetry may be recorded before activation; that does not authorize source work. Changing a frozen configuration requires a new configuration ID and checksum; prior evidence remains immutable.
