# Flow accuracy: initial-audit

Status: not_evaluable
Rubric: completion-critical-flow-runtime-v2
Source revision: sha256:c62958e7190a714e05249ab1084942bb30170c146d441bcee17cd6650c960759
Flow accuracy: N/A
Flow error: N/A
Evaluated coverage: 66.666667%
Execution blocked: no
Execution blocker defects: none
Accuracy bounds: 66.666667% to 100.0%

Flows: 2 correct, 0 incorrect, 1 not evaluable, 3 total

| Flow | Type | Status | Noncritical deviations |
|---|---|---|---:|
| BF-1 | main | not_evaluable | 0 |
| AF-1 | alternative | correct | 0 |
| EF-1 | exception | correct | 0 |

{"category": "environment", "affected_targets": "BF-1.5", "reason": "Headless runner lacks physical media hardware, yielding NotAllowedError on media request", "impact": "Basic Flow live media preview terminal outcome cannot be observed at runtime"}

## Observation trace

- OBS-BF-1 / BF-1: 2026-10-25T17:11:00+07:00 to 2026-10-25T17:11:08+07:00; incomplete; entry http://localhost:8086/; end Pre-join interface controls displayed; media access outcome received
  1. Navigate to http://localhost:8086/ and open pre-join interface -> Client rendered pre-join header "Get Started", prompt subtitle, and media preview container (entry, BF-1.1)
  2. Inspect presence of camera, microphone, name, and permission controls -> Client presents microphone toggle, camera toggle, display name input, and "Enable preview" button (BF-1.2)
  3. Click "Enable preview" button to request media access -> Triggered preparePreview() requesting camera and microphone access (BF-1.3)
  4. Observe media access request execution and returned outcome -> MediaDevices.getUserMedia executed; received NotAllowedError outcome from host browser (BF-1.4)
  5. Observe live media preview rendering state -> Live media stream preview could not render due to environment NotAllowedError; interface transitioned to exception handling (BF-1.5, terminal_outcome)
- OBS-AF-1 / AF-1: 2026-10-25T17:11:09+07:00 to 2026-10-25T17:11:16+07:00; completed; entry http://localhost:8086/; end Camera toggle clicked, camera turned off, avatar icon rendered in preview
  1. Traverse shared main prefix to pre-join preview interface -> Pre-join interface active with media controls (entry)
  2. Click camera toggle button to turn camera off -> Camera toggled off; button aria-pressed updated to false (branch, AF-1.1)
  3. Verify client renders the corresponding muted preview state -> Client rendered avatar icon "◉" with aria-label "Camera preview muted" and muted camera control (AF-1.2, terminal_outcome)
- OBS-EF-1 / EF-1: 2026-10-25T17:11:19+07:00 to 2026-10-25T17:11:26+07:00; completed; entry http://localhost:8086/; end Modal permission-denied alertdialog rendered with "Try again" recovery action
  1. Enter pre-join preview and initiate media permission request -> Permission request triggered (entry)
  2. Browser rejects media access with NotAllowedError -> Access is not granted (Permission denied error received) (branch, EF-1.1)
  3. Observe client modal display and visible recovery action -> Client rendered alertdialog "Camera or microphone access was not granted" and recovery action button "Try again" (EF-1.2, terminal_outcome)

Evidence paths, SHA-256 values, target decisions and source findings: companion JSON input.
