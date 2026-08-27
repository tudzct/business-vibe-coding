# Experiment configuration gate

A comparison group uses one Confirmed configuration before any run mutates source. It fixes:

- configuration/comparison-group/researcher identifiers;
- UC IDs and expected ordered BR IDs;
- generation and audit model assignments;
- replicate indexes and unique run order;
- audit protocol and timing method.

Exactly one run is activated through its `run-activation.json` before model/version capture, timing or source mutation. Changing a frozen configuration requires a new configuration ID and checksum; prior evidence remains immutable.
