---
artifact_type: use-case-specification
status: Frozen
uc_id: UC-06
uc_name: "Request Stage Access"
---

# UC-06: Request Stage Access

## Functional Use-Case Specification

### Use Case ID

UC-06

### Use Case Name

Request Stage Access

### Description

As a viewer, I want to request stage access so that the host can consider adding me to the live stage.

### Actor(s)

Viewer; Stage Service.

### Priority

High

### Trigger

The viewer chooses the visible stage-request action.

### Pre-Condition(s)

PRE-1: The client displays the viewer live-session interface.

### Post-Condition(s)

POST-1: The viewer interface displays the returned request state.
POST-2: The host interface displays the returned stage-request item.

### Basic Flow

Flow ID: BF-1

BF-1.1: The viewer chooses to request stage access.
BF-1.2: The client submits the stage request.
BF-1.3: The system returns the request representation.
BF-1.4: The viewer client displays the returned request state.
BF-1.5: The host client requests session state and displays the request item.

### Alternative Flow

AF-1: Withdraw a stage request

4a : The viewer withdraws the displayed request.
4b : The client submits the cancellation and removes the pending presentation.

### Exception Flow

EF-1: Stage request fails

3a : The stage service cannot complete the request.
3b : The client displays the returned failure state and keeps playback available.

### Related UI

- Live Streaming Viewer 6007:51397.
- Live Streaming Desktop Features 6007:86770.
- Live Streaming Mobile Features 6012:90506.

### Related API IDs

API-STAGE-REQUEST-CREATE.
API-SESSION-STATE.

### Notes

The shared model defines trusted context, persistence mapping, and query helpers. Server mutation execution uses MutationGateway and its common OCL constraints in UC-02. API command dispatch selects the named operation; it does not combine the preconditions of different operations. Read operations have no domain writes.

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
enum StageRequestStatus {
  PENDING
  ACCEPTED
  REJECTED
  CANCELLED
}
enum StageRequestAction {
  CREATE
  ACCEPT
  REJECT
  CANCEL
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
  kind: SessionKind
  status: SessionStatus
}
class Participant {
  id: String
  sessionId: String
  principalId: String
  role: ParticipantRole
  status: ParticipantStatus
}
class LiveStream {
  sessionId: String
  status: StreamStatus
}
class StageRequest {
  id: String
  sessionId: String
  participantId: String
  status: StageRequestStatus
  decidedByParticipantId: String
  createdAt: DateTime
  decidedAt: DateTime
  version: Integer
}
class StageCommand {
  sessionId: String
  actorParticipantId: String
  requestId: String
  action: StageRequestAction
  expectedVersion: Integer
  idempotencyKey: String
}
class StageService {
  submitRequest(command: StageCommand, session: Session, stream: LiveStream): StageRequest
}
note right of RequestContext
Request-local trusted adapter data; not a process-global singleton.
Principal and session are decoded from the authenticated session access token.
participantId resolves the principal's membership.
end note
@enduml
~~~
