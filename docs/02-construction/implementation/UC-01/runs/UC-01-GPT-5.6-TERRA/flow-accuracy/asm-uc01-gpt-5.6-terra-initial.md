# Flow accuracy: asm-uc01-gpt-5.6-terra-initial

Status: scored
Rubric: completion-critical-flow-runtime-v2
Source revision: sha256:c5ccf5963db2a8c5acf2c97e9d7d7ee2dc09cb081a904bf8ef11f5304e6adf93
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

- obs-uc01-bf1 / BF-1: 2026-10-19T14:48:08+07:00 to 2026-10-19T14:48:16+07:00; completed; entry http://localhost:8080; end Local camera and microphone preview and control states rendered.
  1. Navigate to pre-join interface -> Pre-join interface loaded with Get Started header and logo (entry, BF-1.1)
  2. Inspect presented controls -> Camera toggle, mic toggle, role selector, display name field, and permission buttons rendered (BF-1.2)
  3. Click permission action button -> Permission request triggered for camera and microphone access (BF-1.3)
  4. Receive permission outcome -> MediaStream tracks acquired and permission status updated to GRANTED (BF-1.4)
  5. Render media preview and control states -> Video preview element displays stream and mic badge indicates on (BF-1.5, terminal_outcome)
- obs-uc01-af1 / AF-1: 2026-10-19T14:48:19+07:00 to 2026-10-19T14:48:23+07:00; completed; entry http://localhost:8080; end Muted preview placeholder and mic muted state displayed.
  1. Traverse pre-join interface entry -> Controls accessible (entry)
  2. Click Camera on / Mic on buttons to turn them off -> Buttons switch to Camera off and Mic off (branch, AF-1.3a)
  3. Observe muted preview rendering -> Video hidden, circular avatar placeholder shown, Mic muted badge shown (AF-1.3b, terminal_outcome)
- obs-uc01-ef1 / EF-1: 2026-10-19T14:48:24+07:00 to 2026-10-19T14:48:28+07:00; completed; entry http://localhost:8080; end Permission needed dialog displayed with Try again recovery action.
  1. Initiate pre-join permission request -> Request access initiated (entry)
  2. Permission access is not granted by user/system -> PermissionStatus becomes DENIED (branch, EF-1.4a)
  3. Render permission-denied modal and recovery button -> Modal dialog Permission needed rendered with Try again button (EF-1.4b, terminal_outcome)

Evidence paths, SHA-256 values, target decisions and source findings: companion JSON input.
