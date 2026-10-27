---
artifact_type: use-case-specification
status: Frozen
uc_id: UC-10
uc_name: "Send an Emoji Reaction"
---

# UC-10: Send an Emoji Reaction

## Functional Use-Case Specification

### Use Case ID

UC-10

### Use Case Name

Send an Emoji Reaction

### Description

As a participant, I want to send an emoji reaction so that I can respond without interrupting the session.

### Actor(s)

Participant; Collaboration Service.

### Priority

Low

### Trigger

The participant opens the reaction controls and chooses an emoji.

### Pre-Condition(s)

PRE-1: The participant is viewing a joined-session interface.

### Post-Condition(s)

POST-1: The client renders the reaction event returned by the system.

### Basic Flow

Flow ID: BF-1

BF-1.1: The participant opens the emoji reaction controls.
BF-1.2: The client presents the available reaction choices.
BF-1.3: The participant chooses a reaction.
BF-1.4: The client submits the reaction.
BF-1.5: The system returns the created event.
BF-1.6: The client renders the reaction in the session.

### Alternative Flow

AF-1: Close reaction controls without selecting

3a : The participant closes the reaction controls without selecting an item.
3b : The client restores the session controls.

### Exception Flow

EF-1: Reaction creation fails

5a : The reaction cannot be created.
5b : The client displays the returned failure notice without closing the session.

### Related UI

- Video Conferencing Desktop Features 6007:55138.
- Component evidence: Modal/Emoji Reactions.

### Related API IDs

API-REACTION-CREATE.
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
enum ParticipantStatus {
  JOINED
  LEFT
}
enum ReactionCode {
  LIKE
  CLAP
  HEART
  CELEBRATE
  HAND
  SURPRISE
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
}
class Participant {
  id: String
  sessionId: String
  principalId: String
  status: ParticipantStatus
}
class StageRequest <<extent>> {
  {static} allInstances(): Set(StageRequest)
}
class ReactionEvent {
  id: String
  sessionId: String
  participantId: String
  reaction: ReactionCode
  createdAt: DateTime
  sequence: Integer
}
class ReactionCommand {
  sessionId: String
  participantId: String
  reaction: ReactionCode
  idempotencyKey: String
}
class CollaborationService {
  sendReaction(command: ReactionCommand, session: Session): ReactionEvent
}
note "allInstances() represents the classifier extent.\nAn extent-only classifier has no structural properties in this UC projection." as ExtentSemantics
note right of RequestContext
Request-local trusted adapter data; not a process-global singleton.
Principal and session are decoded from the authenticated session access token.
participantId resolves the principal's membership.
end note
@enduml
~~~
