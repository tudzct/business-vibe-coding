---
artifact_type: business-use-case-specification
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

1. The host opens the recording control.
2. The client presents the recording confirmation shown by the design.
3. The host confirms the start action.
4. The client submits the recording-control request.
5. The system returns the recording representation.
6. The client displays the returned recording indicator and refreshes it from session state.

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

The shared model defines trusted context, persistence mapping, and query helpers. Server mutation execution uses MutationGateway and its common OCL constraints in UC-02. API command dispatch selects the named operation; it does not combine the preconditions of different operations. Read operations have no domain writes.

## UML Model

Local projection of exactly the vocabulary needed by the Business Rules below, including signature and helper types. Enum domains are retained in full to preserve their value semantics.

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
class String {
  trim(): String
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
note right of String
Removes leading and trailing whitespace; internal whitespace is unchanged.
end note
note right of RequestContext
Request-local trusted adapter data; not a process-global singleton.
Principal and session are decoded from the authenticated session access token.
participantId resolves the principal's membership.
Provider callbacks use a separate authenticated adapter.
end note
note right of TransactionContext: Describes the database transaction for the current operation.
@enduml
~~~

## Business Rules

~~~text
BR-CSR-01 - Authenticated Membership
context RecordingService::control(command: RecordingCommand, session: Session): Recording
pre BR_CSR_01_AuthenticatedMembership:
  RequestContext::authenticated and RequestContext::sessionId = command.sessionId and
  command.actorParticipantId = RequestContext::participantId and
  Participant.allInstances()->exists(p | p.id = command.actorParticipantId and
    p.principalId = RequestContext::principalId and p.sessionId = command.sessionId and
    p.status = ParticipantStatus::JOINED and p.role = ParticipantRole::HOST)

BR-CSR-02 - Target Session
context RecordingService::control(command: RecordingCommand, session: Session): Recording
pre BR_CSR_02_TargetSession:
  command.sessionId = session.id and session.status <> SessionStatus::ENDED

BR-CSR-03 - Command Key
context RecordingService::control(command: RecordingCommand, session: Session): Recording
pre BR_CSR_03_CommandKey:
  command.idempotencyKey <> null and command.idempotencyKey.trim().size() > 0

BR-CSR-04 - Start Recording
context RecordingService::control(command: RecordingCommand, session: Session): Recording
pre BR_CSR_04_StartRecording:
  command.action = RecordingAction::START implies command.expectedVersion = null and session.status = SessionStatus::LIVE and
  not Recording.allInstances()->exists(r | r.sessionId = session.id and (r.status = RecordingStatus::STARTING or r.status = RecordingStatus::RECORDING))

BR-CSR-05 - Stop Recording
context RecordingService::control(command: RecordingCommand, session: Session): Recording
pre BR_CSR_05_StopRecording:
  command.action = RecordingAction::STOP implies Recording.allInstances()->one(r | r.sessionId = session.id and
    (r.status = RecordingStatus::STARTING or r.status = RecordingStatus::RECORDING) and r.version = command.expectedVersion)

BR-CSR-06 - Recording Effect
context RecordingService::control(command: RecordingCommand, session: Session): Recording
post BR_CSR_06_RecordingEffect:
  result.sessionId = session.id and
  if command.action = RecordingAction::START then result.oclIsNew() and result.status = RecordingStatus::STARTING and
    result.startedByParticipantId = command.actorParticipantId and result.createdAt <> null and result.startedAt = null and result.version = 1 and result.stoppedAt = null
  else result = Recording.allInstances()@pre->any(r | r.sessionId = session.id and
      (r.status@pre = RecordingStatus::STARTING or r.status@pre = RecordingStatus::RECORDING)) and
    result.status = RecordingStatus::STOPPED and result.version = command.expectedVersion + 1 and result.stoppedAt <> null endif

BR-CSR-07 - Recording Callback
context RecordingService::complete(command: ProviderCompletion, recording: Recording, session: Session): Recording
pre BR_CSR_07_RecordingCallback:
  RequestContext::providerAuthenticated and command.sessionId = session.id and recording.sessionId = session.id and
  command.resourceId = recording.id and command.expectedVersion = recording.version and recording.status = RecordingStatus::STARTING and
  session.status = SessionStatus::LIVE and TransactionContext::lockedSessionId = session.id and TransactionContext::atomicCommit

BR-CSR-08 - Recording Callback Effect
context RecordingService::complete(command: ProviderCompletion, recording: Recording, session: Session): Recording
post BR_CSR_08_RecordingCallbackEffect:
  result = recording and recording.version = recording.version@pre + 1 and session.version = session.version@pre + 1 and
  if command.succeeded then recording.status = RecordingStatus::RECORDING and recording.startedAt <> null
  else recording.status = RecordingStatus::FAILED and recording.stoppedAt <> null endif

BR-CSR-09 - One Active Recording
context Recording
inv BR_CSR_09_OneActiveRecording:
  Recording.allInstances()->select(r | r.sessionId = self.sessionId and (r.status = RecordingStatus::STARTING or r.status = RecordingStatus::RECORDING))->size() <= 1
~~~
