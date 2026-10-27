---
artifact_type: use-case-specification
status: Frozen
uc_id: UC-04
uc_name: "Stop a Live Stream"
---

# UC-04: Stop a Live Stream

## Functional Use-Case Specification

### Use Case ID

UC-04

### Use Case Name

Stop a Live Stream

### Description

As a host, I want to stop a live stream so that the broadcast ends for viewers.

### Actor(s)

Host; Live Stream Service.

### Priority

High

### Trigger

The host chooses the visible end-stream action.

### Pre-Condition(s)

PRE-1: The client displays a running live session.

### Post-Condition(s)

POST-1: The host interface displays the returned ended state.
POST-2: The viewer interface displays the returned post-stream outcome.

### Basic Flow

Flow ID: BF-1

BF-1.1: The host opens the end-stream action.
BF-1.2: The client presents the confirmation shown by the design.
BF-1.3: The host confirms the action.
BF-1.4: The client submits the stop request.
BF-1.5: The system returns the ended stream representation.
BF-1.6: The client displays the post-stream state.

### Alternative Flow

AF-1: Cancel stream-stop confirmation

3a : The host cancels the confirmation.
3b : The client closes the dialog and restores the live session interface.

### Exception Flow

EF-1: Stream stop fails

5a : The system cannot complete the stop request.
5b : The client displays the returned failure state and preserves the current session view.

### Related UI

- Live Streaming Desktop Features 6007:86770.
- Live Streaming Mobile Features 6012:90506.

### Related API IDs

API-LIVE-STREAM-CONTROL.
API-SESSION-STATE.

### Notes

The shared model defines trusted context, persistence mapping, and query helpers. Server mutation execution uses MutationGateway. API command dispatch selects the named operation. Read operations have no domain writes.

## UML Model

~~~plantuml
@startuml
hide empty members
enum SessionKind {
  LIVE_STREAM
  VIDEO_CONFERENCE
}
enum SessionStatus {
  LOBBY
  LIVE
  ENDED
}
enum ParticipantRole {
  HOST
  BROADCASTER
  VIEWER
  STAGE_PARTICIPANT
}
enum ParticipantStatus {
  JOINED
  LEFT
}
enum StreamStatus {
  READY
  STARTING
  LIVE
  ENDED
}
enum StreamAction {
  START
  STOP
}
enum StageRequestStatus {
  PENDING
  ACCEPTED
  REJECTED
  CANCELLED
}
enum ShareStatus {
  ACTIVE
  STOPPED
}
enum RecordingStatus {
  IDLE
  STARTING
  RECORDING
  STOPPED
  FAILED
}
class DateTime <<datatype>> {
}
note right of DateTime: Used only as a type.
class RequestContext {
  {static} principalId: String
  {static} participantId: String
  {static} sessionId: String
  {static} authenticated: Boolean
}
class Session {
  id: String
  kind: SessionKind
  status: SessionStatus
}
class Participant {
  id: String
  sessionId: String
  principalId: String
  role: ParticipantRole
  status: ParticipantStatus
  microphoneEnabled: Boolean
  cameraEnabled: Boolean
}
class LiveStream {
  sessionId: String
  status: StreamStatus
  version: Integer
  endedAt: DateTime
}
class StageRequest {
  sessionId: String
  status: StageRequestStatus
  decidedAt: DateTime
  version: Integer
}
class ContentShare {
  sessionId: String
  status: ShareStatus
  version: Integer
  stoppedAt: DateTime
}
class Recording {
  sessionId: String
  status: RecordingStatus
  version: Integer
  stoppedAt: DateTime
}
class StreamControlCommand {
  sessionId: String
  actorParticipantId: String
  action: StreamAction
  expectedVersion: Integer
  idempotencyKey: String
}
class LiveStreamService {
  stop(command: StreamControlCommand, stream: LiveStream, session: Session): LiveStream
}
note right of RequestContext
Request-local trusted adapter data; not a process-global singleton.
Principal and session are decoded from the authenticated session access token.
participantId resolves the principal's membership.
end note
@enduml
~~~
