---
artifact_type: use-case-specification
status: Frozen
uc_id: UC-01
uc_name: "Review Join Preview and Permissions"
---

# UC-01: Review Join Preview and Permissions

## Functional Use-Case Specification

### Use Case ID

UC-01

### Use Case Name

Review Join Preview and Permissions

### Description

As a prospective participant, I want to review my camera and microphone preview so that I understand how I will appear before joining.

### Actor(s)

Prospective Participant; Preview Service.

### Priority

High

### Trigger

The prospective participant opens a session preview.

### Pre-Condition(s)

PRE-1: The client displays the pre-join interface.

### Post-Condition(s)

POST-1: The client displays the selected camera and microphone state.
POST-2: The client displays the returned permission outcome when permission is requested.

### Basic Flow

Flow ID: BF-1

BF-1.1: The prospective participant opens the pre-join interface.
BF-1.2: The client presents the camera, microphone, name, and permission controls shown by the design.
BF-1.3: The prospective participant chooses the displayed permission action.
BF-1.4: The client requests access and receives an outcome.
BF-1.5: The client renders the media preview and current control states.

### Alternative Flow

AF-1: Turn off microphone or camera

3a : The prospective participant turns the microphone or camera off.
3b : The client renders the corresponding muted preview state.

### Exception Flow

EF-1: Permission denied

4a : Access is not granted.
4b : The client displays the permission-denied dialog and its visible recovery action.

### Related UI

- Broadcaster Preview 6007:51245.
- Video Conferencing Desktop Preview 6066:89727.
- Video Conferencing Mobile Preview 6066:89005.

### Related API IDs

None.

### Notes

Preview preparation is client-local. Its participantKey identifies local draft state, not persisted session membership.

## UML Model

~~~plantuml
@startuml
hide empty members
enum ParticipantRole {
  HOST
  BROADCASTER
  VIEWER
  STAGE_PARTICIPANT
}
enum PermissionStatus {
  UNKNOWN
  GRANTED
  DENIED
}
class Participant <<extent>> {
  {static} allInstances(): Set(Participant)
}
class MediaPreference <<extent>> {
  {static} allInstances(): Set(MediaPreference)
}
class ViewPreference <<extent>> {
  {static} allInstances(): Set(ViewPreference)
}
class PreviewCommand {
  participantKey: String
  role: ParticipantRole
  displayName: String
  requestCamera: Boolean
  requestMicrophone: Boolean
}
class PreviewState {
  participantKey: String
  cameraPermission: PermissionStatus
  microphonePermission: PermissionStatus
  cameraAvailable: Boolean
  microphoneAvailable: Boolean
  cameraEnabled: Boolean
  microphoneEnabled: Boolean
  isReadyToJoin: Boolean
}
class PreviewService {
  prepare(command: PreviewCommand): PreviewState
}
note "allInstances() is the standard OCL classifier extent.\nAn extent-only classifier has no structural properties in this UC projection." as ExtentSemantics
@enduml
~~~
