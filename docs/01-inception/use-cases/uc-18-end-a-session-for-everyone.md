---
artifact_type: use-case-specification
status: Frozen
uc_id: UC-18
uc_name: "End a Session for Everyone"
---

# UC-18: End a Session for Everyone

## Functional Use-Case Specification

### Use Case ID

UC-18

### Use Case Name

End a Session for Everyone

### Description

As a host, I want to end the session for everyone so that all participants receive the post-session outcome.

### Actor(s)

Host; Session Service.

### Priority

High

### Trigger

The host chooses End for everyone from the session controls.

### Pre-Condition(s)

PRE-1: The host is viewing the joined-session interface.

### Post-Condition(s)

POST-1: Each client displays the returned ended-session state.

### Basic Flow

Flow ID: BF-1

BF-1.1: The host opens the end-session control.
BF-1.2: The client presents the confirmation shown by the design.
BF-1.3: The host confirms End for everyone.
BF-1.4: The client submits the termination request.
BF-1.5: The system returns the ended-session representation.
BF-1.6: Each client requests session state and displays the post-session outcome.

### Alternative Flow

AF-1: Cancel end-session confirmation

3a : The host cancels the confirmation.
3b : The client closes the dialog and restores the session interface.

### Exception Flow

EF-1: Session termination fails

5a : The session service cannot complete the action.
5b : The client displays the returned failure state and keeps the session interface available.

### Related UI

- Live Streaming Desktop Features 6007:86770.
- Video Conferencing Desktop Features 6007:55138.
- Live Streaming Mobile Features 6012:90506.
- Video Conferencing Mobile Features 6012:52233.

### Related API IDs

API-SESSION-DEPARTURE.
API-SESSION-STATE.

### Notes

The shared model defines trusted context, persistence mapping, and query helpers. Server mutation execution uses MutationGateway. API command dispatch selects the named operation. Read operations have no domain writes.

## UML Model

~~~plantuml
@startuml
hide empty members
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
enum DepartureKind {
  LEAVE
  END
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
  status: SessionStatus
  version: Integer
  endedAt: DateTime
}
class Participant {
  id: String
  sessionId: String
  principalId: String
  role: ParticipantRole
  status: ParticipantStatus
  leftAt: DateTime
  microphoneEnabled: Boolean
  cameraEnabled: Boolean
  version: Integer
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
class Departure {
  id: String
  sessionId: String
  participantId: String
  kind: DepartureKind
  createdAt: DateTime
}
class DepartureCommand {
  sessionId: String
  actorParticipantId: String
  kind: DepartureKind
  expectedVersion: Integer
  idempotencyKey: String
}
class SessionService {
  end(command: DepartureCommand, session: Session): Departure
}
note right of RequestContext
Request-local trusted adapter data; not a process-global singleton.
Principal and session are decoded from the authenticated session access token.
participantId resolves the principal's membership.
end note
@enduml
~~~
