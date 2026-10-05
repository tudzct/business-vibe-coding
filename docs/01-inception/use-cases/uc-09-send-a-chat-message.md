---
artifact_type: business-use-case-specification
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

1. The participant opens the chat panel.
2. The client displays the returned message history.
3. The participant enters a message and chooses Send.
4. The client submits the message.
5. The system returns the created message.
6. The client appends it to the visible conversation.

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

Local projection of exactly the vocabulary needed by the Business Rules below, including signature and helper types. Enum domains are retained in full to preserve their value semantics.

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
class Paging {
  {static} messages(sessionId: String, pageSize: Integer, cursor: String): MessagePage
  {static} validCursor(sessionId: String, cursor: String, collection: String): Boolean
}
class CollaborationService {
  sendMessage(command: ChatCommand, session: Session): ChatMessage
  listMessages(query: MessageQuery, session: Session): MessagePage
}
note right of String
Removes leading and trailing whitespace; internal whitespace is unchanged.
end note
note right of Paging
Returns messages ordered by sequence ascending, using a session-bound cursor.
end note
note right of Paging
Validates cursor decoding, signature, collection, and session binding.
An absent cursor starts before the first row.
end note
note right of RequestContext
Request-local trusted adapter data; not a process-global singleton.
Principal and session are decoded from the authenticated session access token.
participantId resolves the principal's membership.
end note
@enduml
~~~

## Business Rules

~~~text
BR-SCM-01 - Authenticated Membership
context CollaborationService::sendMessage(command: ChatCommand, session: Session): ChatMessage
pre BR_SCM_01_AuthenticatedMembership:
  RequestContext::authenticated and RequestContext::sessionId = command.sessionId and
  command.senderParticipantId = RequestContext::participantId and
  Participant.allInstances()->exists(p | p.id = command.senderParticipantId and
    p.principalId = RequestContext::principalId and p.sessionId = command.sessionId and
    p.status = ParticipantStatus::JOINED)

BR-SCM-02 - Target Session
context CollaborationService::sendMessage(command: ChatCommand, session: Session): ChatMessage
pre BR_SCM_02_TargetSession:
  command.sessionId = session.id and session.status <> SessionStatus::ENDED

BR-SCM-03 - Command Key
context CollaborationService::sendMessage(command: ChatCommand, session: Session): ChatMessage
pre BR_SCM_03_CommandKey:
  command.idempotencyKey <> null and command.idempotencyKey.trim().size() > 0

BR-SCM-04 - Message Body
context CollaborationService::sendMessage(command: ChatCommand, session: Session): ChatMessage
pre BR_SCM_04_MessageBody:
  command.body <> null and command.body.trim().size() > 0 and command.body.trim().size() <= 1000

BR-SCM-05 - Created Identity
context CollaborationService::sendMessage(command: ChatCommand, session: Session): ChatMessage
post BR_SCM_05_CreatedIdentity:
  result.oclIsNew() and result.id <> null and result.sessionId = command.sessionId and result.senderParticipantId = command.senderParticipantId

BR-SCM-06 - Message Value
context CollaborationService::sendMessage(command: ChatCommand, session: Session): ChatMessage
post BR_SCM_06_MessageValue:
  result.body = command.body.trim() and result.sentAt <> null and result.sequence = session.version@pre + 1

BR-SCM-07 - Authenticated Membership
context CollaborationService::listMessages(query: MessageQuery, session: Session): MessagePage
pre BR_SCM_07_AuthenticatedMembership:
  RequestContext::authenticated and RequestContext::sessionId = query.sessionId and
  query.requesterParticipantId = RequestContext::participantId and
  Participant.allInstances()->exists(p | p.id = query.requesterParticipantId and
    p.principalId = RequestContext::principalId and p.sessionId = query.sessionId and
    p.status = ParticipantStatus::JOINED)

BR-SCM-08 - Message Page Input
context CollaborationService::listMessages(query: MessageQuery, session: Session): MessagePage
pre BR_SCM_08_MessagePageInput:
  query.sessionId = session.id and session.status <> SessionStatus::ENDED and query.pageSize > 0 and query.pageSize <= 50 and
  Paging::validCursor(session.id, query.cursor, 'messages')

BR-SCM-09 - Message History
context CollaborationService::listMessages(query: MessageQuery, session: Session): MessagePage
post BR_SCM_09_MessageHistory:
  result = Paging::messages(session.id, query.pageSize, query.cursor) and result.items->forAll(m | m.sessionId = session.id)
~~~
