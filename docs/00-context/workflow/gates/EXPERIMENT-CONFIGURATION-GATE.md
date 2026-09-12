# Experiment configuration gate

A comparison group uses one Confirmed configuration before any run mutates source. Researcher-supplied defaults come from the ignored root `.env`; when absent, copy `.env.example`, list all blank fields once and stop. `.env` is convenience input, while the Confirmed JSON remains canonical. It fixes:

- configuration/comparison-group/researcher identifiers;
- UC IDs and expected ordered BR IDs;
- generation and audit model assignments;
- replicate indexes and unique run order;
- audit protocol and timing method.
- the activated Figma dataset version and manifest checksum;
- per-UC frozen BR and flow baseline paths.

New schema 2.3 configurations fix `timing_method` to `system_timestamp_delta`, pin the active Figma dataset, and freeze `flow_audit_rubric: completion-critical-flow-runtime-v2` before generation. The validator rejects missing/mismatched values and mixed flow rubrics within one comparison group, including Full/RQ3 and model conditions. `audit_design.protocol` still assigns auditors; it never stores the rubric. Confirmed schema 2.0/2.1/2.2 configurations retain legacy `completion-critical-flow-v1` and remain immutable; never edit them in place or compare their scores as if measured with v2.

Show one Configuration Gate summary derived from `.env`. Only researcher confirmation changes the Draft to Confirmed. Generate IDs/order deterministically; do not ask repeatedly for values already supplied in `.env`.

Exactly one run is activated through its `run-activation.json` before source-generation model/version capture, source timing or source mutation. A Draft canonical UC/run identity and live prompt/setup telemetry may be recorded before activation; that does not authorize source work. Changing a frozen configuration requires a new configuration ID and checksum; prior evidence remains immutable.
