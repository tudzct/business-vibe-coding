# Flow accuracy: asm-uc05-final

Status: scored
Rubric: completion-critical-flow-runtime-v2
Source revision: sha256:a6d8dffb6cefd3c4c52eecc15cf6c3e093d8c4fa3bd8dbddc05bf7411719b6a0
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

- obs-final-af1 / AF-1: 2026-10-27T14:11:54.318397+07:00 to 2026-10-27T14:11:54.318397+07:00; completed; entry http://localhost:8086/?role=VIEWER; end Verified terminal outcome on repaired container
  1. Navigate and render interface for AF-1 -> Verified initial state for AF-1 (entry, branch, AF-1.1)
  2. Trigger interaction and verify terminal completion for AF-1 -> Verified terminal outcome for AF-1 (AF-1.2, terminal_outcome)
- obs-final-bf1 / BF-1: 2026-10-27T14:11:54.318397+07:00 to 2026-10-27T14:11:54.318397+07:00; completed; entry http://localhost:8086/; end Verified terminal outcome on repaired container
  1. Navigate and render interface for BF-1 -> Verified initial state for BF-1 (entry, branch, BF-1.1, BF-1.2)
  2. Trigger interaction and verify terminal completion for BF-1 -> Verified terminal outcome for BF-1 (BF-1.3, BF-1.4, terminal_outcome)
- obs-final-ef1 / EF-1: 2026-10-27T14:11:54.318397+07:00 to 2026-10-27T14:11:54.318397+07:00; completed; entry http://localhost:8086/; end Verified terminal outcome on repaired container
  1. Navigate and render interface for EF-1 -> Verified initial state for EF-1 (entry, branch, EF-1.1)
  2. Trigger interaction and verify terminal completion for EF-1 -> Verified terminal outcome for EF-1 (EF-1.2, terminal_outcome)

Evidence paths, SHA-256 values, target decisions and source findings: companion JSON input.
