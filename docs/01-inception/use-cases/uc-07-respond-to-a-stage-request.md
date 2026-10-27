---
artifact_type: use-case-specification
status: Frozen
uc_id: UC-07
uc_name: "Respond to a Stage Request"
---

# UC-07: Respond to a Stage Request

## Functional Use-Case Specification

### Use Case ID

UC-07

### Use Case Name

Respond to a Stage Request

### Description

As a host, I want to accept or reject a viewer's stage request so that the viewer receives a clear participation outcome.

### Actor(s)

Host; Stage Service.

### Priority

High

### Trigger

The host opens a displayed stage request and chooses a response.

### Pre-Condition(s)

PRE-1: The host interface displays a stage-request item.

### Post-Condition(s)

POST-1: The host and viewer interfaces display the returned decision outcome.

### Basic Flow

Flow ID: BF-1

BF-1.1: The host opens the displayed request.
BF-1.2: The client presents the available response actions.
BF-1.3: The host chooses Accept.
BF-1.4: The client submits the response.
BF-1.5: The system returns the updated stage request and participant representation.
BF-1.6: The host client renders the viewer on the stage.
BF-1.7: The viewer client requests session state and renders its returned participation state.

### Alternative Flow

AF-1: Reject a stage request

3a : The host chooses Reject.
3b : The client submits the response and displays the returned rejected outcome.

### Exception Flow

EF-1: Stage response fails

5a : The stage service cannot complete the response.
5b : The client displays the returned failure state and retains the request item.

### Related UI

- Live Streaming Desktop Features 6007:86770.
- Live Streaming Mobile Features 6012:90506.

### Related API IDs

API-STAGE-REQUEST-CREATE.
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
  participants: Set(Participant)
}
class Participant {
  id: String
  sessionId: String
  principalId: String
  role: ParticipantRole
  status: ParticipantStatus
  version: Integer
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
  decide(command: StageCommand, session: Session, stream: LiveStream, request: StageRequest): StageRequest
}
note right of RequestContext
Request-local trusted adapter data; not a process-global singleton.
Principal and session are decoded from the authenticated session access token.
participantId resolves the principal's membership.
end note
@enduml
~~~
