# Artifact retention and context

Retain separately:

- immutable project inputs and their checksums;
- active-run configuration and baseline references;
- operation-owned prompt artifacts;
- source revisions and provenance receipts;
- immutable observations and evidence;
- operation-owned correction artifacts;
- telemetry and state receipts;
- final source checksum.

Never overwrite an earlier observation with a later result. Derived artifacts may reference source paths and hashes but must not append decisions to immutable project inputs.

Artifact retention does not grant context access. Read an artifact only when the active operation's handoff contract requires it. Do not read the producer skill's private instructions, template or references.

Keep prompts, evidence and reports free of secrets and unrelated payloads.
