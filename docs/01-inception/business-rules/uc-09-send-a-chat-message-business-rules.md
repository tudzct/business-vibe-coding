---
artifact_type: business-rule-specification
status: Frozen
uc_id: UC-09
uc_name: "Send a Chat Message"
---

# UC-09: Send a Chat Message

## Business Rules

### OCL Utility Definitions

```text
String.trim(): String
- Removes leading and trailing whitespace; internal whitespace is unchanged.

Paging::validCursor(sessionId: String, cursor: String, collection: String): Boolean
- Validates cursor decoding, signature, collection, and session binding.
- An absent cursor starts before the first row.

Paging::messages(sessionId: String, pageSize: Integer, cursor: String): MessagePage
- Returns messages ordered by sequence ascending, using a session-bound cursor.
```

### Rule Definitions

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
