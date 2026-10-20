---
artifact_type: use-case-specification
status: Frozen
uc_id: UC-08
uc_name: "View Session Participants"
---

# UC-08: View Session Participants

## Functional Use-Case Specification

### Use Case ID

UC-08

### Use Case Name

View Session Participants

### Description

As a participant, I want to view the people in the session so that I can understand who is present and their visible roles.

### Actor(s)

Participant; Collaboration Service.

### Priority

High

### Trigger

The participant opens the participants panel.

### Pre-Condition(s)

PRE-1: The participant is viewing a joined-session interface.

### Post-Condition(s)

POST-1: The client displays the returned participant list and visible participant states.

### Basic Flow

Flow ID: BF-1

BF-1.1: The participant opens the participants panel.
BF-1.2: The client requests the session participant list.
BF-1.3: The system returns public participant representations.
BF-1.4: The client displays the list and visible roles.

### Alternative Flow

AF-1: Close the participant panel

4a : The participant closes the panel.
4b : The client restores the session layout.

### Exception Flow

EF-1: Participant list unavailable

3a : The participant list cannot be returned.
3b : The client displays the returned unavailable state without closing the session.

### Related UI

- Live Streaming Desktop Features 6007:86770.
- Video Conferencing Desktop Features 6007:55138.
- Live Streaming Mobile Features 6012:90506.
- Video Conferencing Mobile Features 6012:52233.

### Related API IDs

API-PARTICIPANT-LIST.
API-SESSION-STATE.

### Notes

The shared model defines trusted context, persistence mapping, and query helpers. Server mutation execution uses MutationGateway and its common OCL constraints in UC-02. API command dispatch selects the named operation; it does not combine the preconditions of different operations. Read operations have no domain writes.

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
enum ShareStatus {
  ACTIVE
  STOPPED
}
class String <<datatype>> {
}
note right of String: Used only as a type; no structural member is accessed by these BRs.
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
  role: ParticipantRole
  status: ParticipantStatus
  joinedAt: DateTime
}
class LiveStream {
  sessionId: String
}
class StageRequest {
  sessionId: String
  participantId: String
}
class ReactionEvent {
  sessionId: String
  sequence: Integer
}
class ContentShare {
  sessionId: String
  status: ShareStatus
}
class Recording {
  createdAt: DateTime
  id: String
  sessionId: String
}
class MediaPreference {
  participantId: String
}
class ViewPreference {
  participantId: String
}
class ParticipantListQuery {
  sessionId: String
  requesterParticipantId: String
  pageSize: Integer
  cursor: String
}
class ParticipantPage {
  items: Sequence(Participant)
  nextCursor: String
}
class SessionState {
  session: Session
  selfParticipant: Participant
  stream: LiveStream
  recording: Recording
  share: ContentShare
  media: MediaPreference
  view: ViewPreference
  stageRequests: Set(StageRequest)
  reactions: Sequence(ReactionEvent)
  nextReactionCursor: String
}
class CollaborationService {
  listParticipants(query: ParticipantListQuery, session: Session): ParticipantPage
}
class SessionService {
  readState(session: Session, participant: Participant, reactionCursor: String): SessionState
}
note right of RequestContext
Request-local trusted adapter data; not a process-global singleton.
Principal and session are decoded from the authenticated session access token.
participantId resolves the principal's membership.
end note
@enduml
~~~
