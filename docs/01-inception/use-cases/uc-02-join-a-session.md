---
artifact_type: use-case-specification
status: Frozen
uc_id: UC-02
uc_name: "Join a Session"
---

# UC-02: Join a Session

## Functional Use-Case Specification

### Use Case ID

UC-02

### Use Case Name

Join a Session

### Description

As a participant, I want to join a session with my selected identity and media state so that I can participate.

### Actor(s)

Participant; Session Service.

### Priority

High

### Trigger

The participant chooses Join from the preview interface.

### Pre-Condition(s)

PRE-1: The client displays a completed preview interface.

### Post-Condition(s)

POST-1: The client displays the joined session or a returned recovery state.
POST-2: The participant tile reflects the returned identity and media state.

### Basic Flow

Flow ID: BF-1

BF-1.1: The participant enters a display name and chooses Join.
BF-1.2: The client submits the join request.
BF-1.3: The system returns the joined participant and session summary.
BF-1.4: The client renders the active session and participant tile.

### Alternative Flow

AF-1: Change preview selections before joining

1a : The participant changes a preview control before choosing Join.
1b : The client submits the updated selections with the join request.

### Exception Flow

EF-1: Session cannot be joined

3a : The system returns that the session cannot be joined.
3b : The client displays the returned recovery state while preserving the preview context.

### Related UI

- Broadcaster Preview 6007:51245.
- Video Conferencing Desktop Preview 6066:89727.
- Live Streaming Mobile Preview 6012:44409.
- Video Conferencing Mobile Preview 6066:89005.

### Related API IDs

API-SESSION-JOIN.
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
enum LayoutMode {
  EQUAL_PROMINENCE
  SIDEBAR
  PRESENTER
}
enum MutationOutcome {
  COMPLETED
  REJECTED
}
enum IsolationLevel {
  SERIALIZABLE
}
class RequestContext {
  {static} principalId: String
  {static} sessionId: String
  {static} authenticated: Boolean
}
class TransactionContext {
  {static} lockedSessionId: String
  {static} isolation: IsolationLevel
  {static} atomicCommit: Boolean
}
class Principal {
  id: String
  userId: String
}
class Session {
  id: String
  kind: SessionKind
  status: SessionStatus
  designatedHostPrincipalId: String
  hostParticipantId: String
  version: Integer
  participants: Set(Participant)
}
class Participant {
  id: String
  sessionId: String
  principalId: String
  userId: String
  displayName: String
  role: ParticipantRole
  status: ParticipantStatus
  joinedAt: DateTime
  leftAt: DateTime
  microphoneEnabled: Boolean
  cameraEnabled: Boolean
  version: Integer
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
  layout: LayoutMode
  focusedParticipantId: String
  sidePanel: String
  pictureInPicture: Boolean
  updatedAt: DateTime
}
class VirtualBackground {
  id: String
  active: Boolean
}
class JoinCommand {
  sessionId: String
  principalId: String
  userId: String
  displayName: String
  microphoneEnabled: Boolean
  cameraEnabled: Boolean
  microphoneDeviceId: String
  cameraDeviceId: String
  speakerDeviceId: String
  virtualBackgroundId: String
  idempotencyKey: String
}
class MutationEnvelope {
  sessionId: String
  principalId: String
  operation: String
  idempotencyKey: String
  payloadHash: String
}
class MutationReceipt {
  responseReference: String
  outcome: MutationOutcome
  completedAt: DateTime
  dispatchCount: Integer
}
class IdempotencyRecord {
  principalId: String
  sessionId: String
  operation: String
  idempotencyKey: String
  payloadHash: String
  responseReference: String
  completedAt: DateTime
  expiresAt: DateTime
}
class SessionJoinService {
  join(command: JoinCommand, session: Session): Participant
}
class MutationGateway {
  execute(command: MutationEnvelope, session: Session): MutationReceipt
}
note right of RequestContext
Request-local trusted adapter data; not a process-global singleton.
Principal and session are decoded from the authenticated session access token.
end note
note right of TransactionContext: Describes the database transaction for the current operation.
@enduml
~~~
