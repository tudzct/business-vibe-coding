---
artifact_type: use-case-specification
status: Frozen
uc_id: UC-09
uc_name: "Send a Chat Message"
---

# UC-09: Send a Chat Message

## Functional Use-Case Specification

### Use Case ID

UC-09

### Use Case Name

Send a Chat Message

### Description

As a participant, I want to send a chat message so that I can communicate with people in the session.

### Actor(s)

Participant; Collaboration Service.

### Priority

High

### Trigger

The participant opens chat, enters text, and chooses Send.

### Pre-Condition(s)

PRE-1: The client displays the session chat panel.

### Post-Condition(s)

POST-1: The client displays the message returned by the system.

### Basic Flow

Flow ID: BF-1

BF-1.1: The participant opens the chat panel.
BF-1.2: The client displays the returned message history.
BF-1.3: The participant enters a message and chooses Send.
BF-1.4: The client submits the message.
BF-1.5: The system returns the created message.
BF-1.6: The client appends it to the visible conversation.

### Alternative Flow

AF-1: Close chat without sending

3a : The participant closes chat without sending.
3b : The client restores the session layout.

### Exception Flow

EF-1: Message creation fails

5a : The collaboration service cannot create the message.
5b : The client displays a failure notice and preserves the entered text.

### Related UI

- Live Streaming Desktop Features 6007:86770.
- Video Conferencing Desktop Features 6007:55138.
- Live Streaming Mobile Features 6012:90506.
- Video Conferencing Mobile Features 6012:52233.

### Related API IDs

API-CHAT-MESSAGE-CREATE.
API-CHAT-MESSAGE-LIST.

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
enum ParticipantStatus {
  JOINED
  LEFT
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
  status: SessionStatus
  version: Integer
}
class Participant {
  id: String
  sessionId: String
  principalId: String
  status: ParticipantStatus
}
class ChatMessage {
  id: String
  sessionId: String
  senderParticipantId: String
  body: String
  sentAt: DateTime
  sequence: Integer
}
class ChatCommand {
  sessionId: String
  senderParticipantId: String
  body: String
  idempotencyKey: String
}
class MessageQuery {
  sessionId: String
  requesterParticipantId: String
  pageSize: Integer
  cursor: String
}
class MessagePage {
  items: Sequence(ChatMessage)
  nextCursor: String
}
class CollaborationService {
  sendMessage(command: ChatCommand, session: Session): ChatMessage
  listMessages(query: MessageQuery, session: Session): MessagePage
}
note right of RequestContext
Request-local trusted adapter data; not a process-global singleton.
Principal and session are decoded from the authenticated session access token.
participantId resolves the principal's membership.
end note
@enduml
~~~
