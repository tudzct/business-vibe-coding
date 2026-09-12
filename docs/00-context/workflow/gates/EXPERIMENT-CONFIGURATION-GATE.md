# Experiment configuration gate

A comparison group uses one Confirmed configuration before any run mutates source. Researcher-supplied defaults come from the ignored root `.env`; when absent, copy `.env.example`, list all blank fields once and stop. `.env` is convenience input, while the Confirmed JSON remains canonical. It fixes:

- configuration/comparison-group/researcher identifiers;
- UC IDs and expected ordered BR IDs;
- generation and audit model assignments;
- replicate indexes and unique run order;
- audit protocol and timing method.
- the activated Figma dataset version and manifest checksum;
- per-UC frozen BR and flow baseline paths.

New schema 2.2 configurations fix `timing_method` to `system_timestamp_delta` and pin the active Figma dataset. The validator rejects missing/mismatched values. Confirmed schema 2.0/2.1 configurations remain immutable; never edit them in place.

Show one Configuration Gate summary derived from `.env`. Only researcher confirmation changes the Draft to Confirmed. Generate IDs/order deterministically; do not ask repeatedly for values already supplied in `.env`.

Exactly one run is activated through its `run-activation.json` before source-generation model/version capture, source timing or source mutation. A Draft canonical UC/run identity and live prompt/setup telemetry may be recorded before activation; that does not authorize source work. Changing a frozen configuration requires a new configuration ID and checksum; prior evidence remains immutable.
