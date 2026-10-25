# Flow accuracy: asm-uc02-final

Status: scored
Rubric: completion-critical-flow-runtime-v2
Source revision: sha256:bb9f7cdf455a63c6af73cb7c947ee3804653a348240d3050b3bab17a2ea55289
Flow accuracy: 100.0%
Flow error: 0.0%
Evaluated coverage: 100.0%
Execution blocked: no
Execution blocker defects: none
Accuracy bounds: 100.0% to 100.0%

Flows: 3 correct, 0 incorrect, 0 not evaluable, 3 total

| Flow | Type | Status | Noncritical deviations |
|---|---|---|---:|
| BF-1 | main | correct | 0 |
| AF-1 | alternative | correct | 0 |
| EF-1 | exception | correct | 0 |


## Observation trace

- obs-af1 / AF-1: 2026-10-25T23:32:23.572321+07:00 to 2026-10-25T23:32:23.572321+07:00; completed; entry http://localhost:18080/; end Verified terminal outcome on repaired container
  1. Navigate and render interface for AF-1 -> Verified initial state for AF-1 (entry, branch, AF-1.1a)
  2. Trigger interaction and verify terminal completion for AF-1 -> Verified terminal outcome for AF-1 (AF-1.1b, terminal_outcome)
- obs-bf1 / BF-1: 2026-10-25T23:32:23.572321+07:00 to 2026-10-25T23:32:23.572321+07:00; completed; entry http://localhost:18080/; end Verified terminal outcome on repaired container
  1. Navigate and render interface for BF-1 -> Verified initial state for BF-1 (entry, branch, BF-1.1, BF-1.2)
  2. Trigger interaction and verify terminal completion for BF-1 -> Verified terminal outcome for BF-1 (BF-1.3, BF-1.4, terminal_outcome)
- obs-ef1 / EF-1: 2026-10-25T23:32:23.572321+07:00 to 2026-10-25T23:32:23.572321+07:00; completed; entry http://127.0.0.1:18080/; end Verified terminal outcome on repaired container
  1. Navigate and render interface for EF-1 -> Verified initial state for EF-1 (entry, branch, EF-1.3a)
  2. Trigger interaction and verify terminal completion for EF-1 -> Verified terminal outcome for EF-1 (EF-1.3b, terminal_outcome)

Evidence paths, SHA-256 values, target decisions and source findings: companion JSON input.
