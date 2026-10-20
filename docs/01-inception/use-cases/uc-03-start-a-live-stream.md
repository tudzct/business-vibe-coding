---
artifact_type: use-case-specification
status: Frozen
uc_id: UC-03
uc_name: "Start a Live Stream"
---

# UC-03: Start a Live Stream

## Functional Use-Case Specification

### Use Case ID

UC-03

### Use Case Name

Start a Live Stream

### Description

As a host, I want to start the configured live stream so that viewers can watch the broadcast.

### Actor(s)

Host; Live Stream Service.

### Priority

High

### Trigger

The host chooses the visible start-stream control.

### Pre-Condition(s)

PRE-1: The client displays the broadcaster session interface.

### Post-Condition(s)

POST-1: The client displays the stream state returned by the system.
POST-2: Viewer-facing playback reflects the returned broadcast outcome.

### Basic Flow

Flow ID: BF-1

BF-1.1: The host reviews the broadcaster preview and chooses Start.
BF-1.2: The client submits the stream-control request.
BF-1.3: The system returns the current stream representation.
BF-1.4: The client displays the starting state.
BF-1.5: The client renders the live session when the updated representation is returned by the session-state request.

### Alternative Flow

AF-1: Open the broadcaster session menu

1a : The host opens the session menu before starting.
1b : The client displays the available broadcaster actions.

### Exception Flow

EF-1: Stream start fails

3a : The system cannot complete the start request.
3b : The client displays a technical-failure state and keeps the broadcaster interface available.

### Related UI

- Broadcaster Preview 6007:51245.
- Live Session 6007:51075.
- Live Streaming Desktop Features 6007:86770.
- Live Streaming Mobile Features 6012:90506.

### Related API IDs

API-LIVE-STREAM-CONTROL.
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
enum StreamAction {
  START
  STOP
}
class DateTime <<datatype>> {
}
note right of DateTime: Used only as a type; no structural member is accessed by these BRs.
class RequestContext {
  {static} principalId: String
  {static} participantId: String
  {static} sessionId: String
  {static} authenticated: Boolean
  {static} providerAuthenticated: Boolean
}
class TransactionContext {
  {static} lockedSessionId: String
  {static} atomicCommit: Boolean
}
class Session {
  id: String
  kind: SessionKind
  status: SessionStatus
  version: Integer
}
class Participant {
  id: String
  sessionId: String
  principalId: String
  role: ParticipantRole
  status: ParticipantStatus
}
class LiveStream {
  id: String
  sessionId: String
  status: StreamStatus
  version: Integer
  startedAt: DateTime
  endedAt: DateTime
}
class StreamControlCommand {
  sessionId: String
  actorParticipantId: String
  action: StreamAction
  expectedVersion: Integer
  idempotencyKey: String
}
class ProviderCompletion {
  sessionId: String
  resourceId: String
  expectedVersion: Integer
  succeeded: Boolean
}
class LiveStreamService {
  start(command: StreamControlCommand, stream: LiveStream, session: Session): LiveStream
  complete(command: ProviderCompletion, stream: LiveStream, session: Session): LiveStream
}
note right of RequestContext
Request-local trusted adapter data; not a process-global singleton.
Principal and session are decoded from the authenticated session access token.
participantId resolves the principal's membership.
Provider callbacks use a separate authenticated adapter.
end note
note right of TransactionContext: Describes the database transaction for the current operation.
@enduml
~~~
