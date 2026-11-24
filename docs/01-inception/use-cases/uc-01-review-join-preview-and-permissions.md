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

As a prospective participant, I want to use the pre-join screen before entering a session.

### Actor(s)

Prospective Participant; Preview Service.

### Priority

High

### Trigger

The prospective participant opens the pre-join screen.

### Pre-Condition(s)

PRE-1: The client displays the pre-join interface.

### Post-Condition(s)

POST-1: The client updates the pre-join interface according to the preview result.

### Basic Flow

Flow ID: BF-1

BF-1.1: The prospective participant opens the pre-join interface.
BF-1.2: The client renders the pre-join controls shown by the design.
BF-1.3: The prospective participant interacts with the displayed preview controls.
BF-1.4: The client invokes `PreviewService::prepare` and processes the returned state.
BF-1.5: The client updates the pre-join interface to reflect the resulting state.

### Alternative Flow

AF-1: Adjust preview media state

3a : The prospective participant changes a media control on the pre-join interface.
3b : The client updates the preview interface to reflect the resulting control state.

### Exception Flow

EF-1: Device access unavailable

4a : Requested device access cannot be completed.
4b : The client displays the permission-denied dialog and its visible recovery action.

### Related UI

- Broadcaster Preview 6007:51245.
- Video Conferencing Desktop Preview 6066:89727.
- Video Conferencing Mobile Preview 6066:89005.

### Related API IDs

None.

### Notes

None.

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
note "allInstances() represents the classifier extent.\nAn extent-only classifier has no structural properties in this UC projection." as ExtentSemantics
@enduml
~~~
