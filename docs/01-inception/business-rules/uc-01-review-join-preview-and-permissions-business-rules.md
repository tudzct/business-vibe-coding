---
artifact_type: business-rule-specification
status: Frozen
uc_id: UC-01
uc_name: "Review Join Preview and Permissions"
---

# UC-01: Review Join Preview and Permissions

## Business Rules

### OCL Utility Definitions

```text
String.trim(): String
- Removes leading and trailing whitespace; internal whitespace is unchanged.
```

### Rule Definitions

~~~text
BR-RJPP-01 - Permission And Hardware
context PreviewService::prepare(command: PreviewCommand): PreviewState
post BR_RJPP_01_PermissionAndHardware:
  (result.cameraEnabled implies result.cameraPermission = PermissionStatus::GRANTED and result.cameraAvailable and command.requestCamera) and
  (result.microphoneEnabled implies result.microphonePermission = PermissionStatus::GRANTED and result.microphoneAvailable and command.requestMicrophone)

BR-RJPP-02 - Viewer Preview Muted
context PreviewService::prepare(command: PreviewCommand): PreviewState
post BR_RJPP_02_ViewerPreviewMuted:
  command.role = ParticipantRole::VIEWER implies not result.cameraEnabled and not result.microphoneEnabled

BR-RJPP-03 - Name Readiness
context PreviewService::prepare(command: PreviewCommand): PreviewState
post BR_RJPP_03_NameReadiness:
  result.isReadyToJoin = (command.displayName <> null and command.displayName.trim().size() > 0 and command.displayName.trim().size() <= 50)

BR-RJPP-04 - Preview Key
context PreviewService::prepare(command: PreviewCommand): PreviewState
post BR_RJPP_04_PreviewKey:
  result.participantKey = command.participantKey

BR-RJPP-05 - Camera Denied State
context PreviewService::prepare(command: PreviewCommand): PreviewState
post BR_RJPP_05_CameraDeniedState:
  result.cameraPermission <> PermissionStatus::GRANTED implies not result.cameraEnabled

BR-RJPP-06 - Microphone Denied State
context PreviewService::prepare(command: PreviewCommand): PreviewState
post BR_RJPP_06_MicrophoneDeniedState:
  result.microphonePermission <> PermissionStatus::GRANTED implies not result.microphoneEnabled

BR-RJPP-07 - Client Local Preview
context PreviewService::prepare(command: PreviewCommand): PreviewState
post BR_RJPP_07_ClientLocalPreview:
  Participant.allInstances() = Participant.allInstances()@pre and
  MediaPreference.allInstances() = MediaPreference.allInstances()@pre and
  ViewPreference.allInstances() = ViewPreference.allInstances()@pre
~~~
