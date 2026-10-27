---
artifact_type: use-case-specification
status: Frozen
uc_id: UC-16
uc_name: "Control Session Recording"
---

# UC-16: Control Session Recording

## Functional Use-Case Specification

### Use Case ID

UC-16

### Use Case Name

Control Session Recording

### Description

As a host, I want to start and stop session recording so that the session can be captured through the visible recording controls.

### Actor(s)

Host; Recording Service.

### Priority

High

### Trigger

The host chooses a recording action from the session controls.

### Pre-Condition(s)

PRE-1: The host is viewing the joined-session interface.

### Post-Condition(s)

POST-1: The client displays the recording state returned by the system.

### Basic Flow

Flow ID: BF-1

BF-1.1: The host opens the recording control.
BF-1.2: The client presents the recording confirmation shown by the design.
BF-1.3: The host confirms the start action.
BF-1.4: The client submits the recording-control request.
BF-1.5: The system returns the recording representation.
BF-1.6: The client displays the returned recording indicator and refreshes it from session state.

### Alternative Flow

AF-1: Stop the active recording

6a : The host chooses to stop the active recording.
6b : The client submits the stop action and displays the returned stopped state.

### Exception Flow

EF-1: Recording control fails

5a : The recording service cannot complete the action.
5b : The client displays the returned recording failure state.

### Related UI

- Video Conferencing Desktop Features 6007:55138.
- Live Streaming Mobile Features 6012:90506.
- Video Conferencing Mobile Features 6012:52233.

### Related API IDs

API-RECORDING-CONTROL.
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
enum RecordingStatus {
  IDLE
  STARTING
  RECORDING
  STOPPED
  FAILED
}
enum RecordingAction {
  START
  STOP
}
class DateTime <<datatype>> {
}
note right of DateTime: Used only as a type.
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
class Recording {
  createdAt: DateTime
  id: String
  sessionId: String
  startedByParticipantId: String
  status: RecordingStatus
  version: Integer
  startedAt: DateTime
  stoppedAt: DateTime
}
class RecordingCommand {
  sessionId: String
  actorParticipantId: String
  action: RecordingAction
  expectedVersion: Integer
  idempotencyKey: String
}
class ProviderCompletion {
  sessionId: String
  resourceId: String
  expectedVersion: Integer
  succeeded: Boolean
}
class RecordingService {
  control(command: RecordingCommand, session: Session): Recording
  complete(command: ProviderCompletion, recording: Recording, session: Session): Recording
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
