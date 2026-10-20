---
artifact_type: use-case-specification
status: Frozen
uc_id: UC-12
uc_name: "Configure Audio and Video Devices"
---

# UC-12: Configure Audio and Video Devices

## Functional Use-Case Specification

### Use Case ID

UC-12

### Use Case Name

Configure Audio and Video Devices

### Description

As a participant, I want to select my microphone, camera, and audio output so that the session uses my preferred devices.

### Actor(s)

Participant; Preference Service.

### Priority

High

### Trigger

The participant opens device settings.

### Pre-Condition(s)

PRE-1: The client displays a preview or joined-session interface.

### Post-Condition(s)

POST-1: The client displays and applies the returned device preferences.

### Basic Flow

Flow ID: BF-1

BF-1.1: The participant opens device settings.
BF-1.2: The client presents the available microphone, camera, and audio-output choices.
BF-1.3: The participant selects the desired values and confirms.
BF-1.4: The client applies the selection locally in preview, or submits the preference update from the joined session.
BF-1.5: The client receives the local result or the returned device preferences.
BF-1.6: The client applies the returned settings to the preview or session.

### Alternative Flow

AF-1: Close settings without confirming

3a : The participant closes settings without confirming.
3b : The client restores the previous preview or session state.

### Exception Flow

EF-1: Device preference cannot be applied

4a : The selected preference cannot be applied.
4b : The client displays the returned failure state and keeps the previous visible selection.

### Related UI

- Settings 6007:51132.
- Video Conferencing Desktop Preview 6066:89727.
- Video Conferencing Mobile Preview 6066:89005.

### Related API IDs

API-PREFERENCES-UPDATE.
API-SESSION-JOIN.
API-SESSION-STATE.

### Notes

The shared model defines trusted context, persistence mapping, and query helpers. Server mutation execution uses MutationGateway and its common OCL constraints in UC-02. API command dispatch selects the named operation; it does not combine the preconditions of different operations. Read operations have no domain writes.

UC-12 through UC-14 and the personal-pin rules in UC-15 constrain one atomic PreferenceService.update operation. Field-presence guards determine which values change. Client-local preview operations do not call this server operation.

## UML Model

~~~plantuml
@startuml
hide empty members
enum SessionStatus {
  LOBBY
  LIVE
  ENDED
}
enum ParticipantStatus {
  JOINED
  LEFT
}
class DateTime <<datatype>> {
}
note right of DateTime: Used only as a type; no structural member is accessed by these BRs.
class RequestContext {
  {static} principalId: String
  {static} participantId: String
  {static} sessionId: String
  {static} authenticated: Boolean
}
class Session {
  id: String
  status: SessionStatus
}
class Participant {
  id: String
  sessionId: String
  principalId: String
  status: ParticipantStatus
}
class MediaPreference {
  participantId: String
  microphoneDeviceId: String
  cameraDeviceId: String
  speakerDeviceId: String
  virtualBackgroundId: String
  updatedAt: DateTime
}
class ViewPreference {
  participantId: String
  updatedAt: DateTime
}
class PreviewDraft {
  participantKey: String
  microphoneDeviceId: String
  cameraDeviceId: String
  speakerDeviceId: String
  virtualBackgroundId: String
}
class PreferencePatch {
  sessionId: String
  participantId: String
  idempotencyKey: String
  hasMicrophoneDeviceId: Boolean
  microphoneDeviceId: String
  hasCameraDeviceId: Boolean
  cameraDeviceId: String
  hasSpeakerDeviceId: Boolean
  speakerDeviceId: String
}
class PreferencesResult {
  media: MediaPreference
  view: ViewPreference
}
class PreferenceService {
  update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
}
class ClientPreferenceService {
  selectDevices(draft: PreviewDraft, microphone: String, camera: String, speaker: String): PreviewDraft
}
note right of RequestContext
Request-local trusted adapter data; not a process-global singleton.
Principal and session are decoded from the authenticated session access token.
participantId resolves the principal's membership.
end note
@enduml
~~~
