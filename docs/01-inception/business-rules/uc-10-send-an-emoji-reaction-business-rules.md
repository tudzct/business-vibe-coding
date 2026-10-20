---
artifact_type: business-rule-specification
status: Frozen
uc_id: UC-10
uc_name: "Send an Emoji Reaction"
---

# UC-10: Send an Emoji Reaction

## Business Rules

### OCL Utility Definitions

```text
String.trim(): String
- Removes leading and trailing whitespace; internal whitespace is unchanged.
```

### Rule Definitions

~~~text
BR-SER-01 - Authenticated Membership
context CollaborationService::sendReaction(command: ReactionCommand, session: Session): ReactionEvent
pre BR_SER_01_AuthenticatedMembership:
  RequestContext::authenticated and RequestContext::sessionId = command.sessionId and
  command.participantId = RequestContext::participantId and
  Participant.allInstances()->exists(p | p.id = command.participantId and
    p.principalId = RequestContext::principalId and p.sessionId = command.sessionId and
    p.status = ParticipantStatus::JOINED)

BR-SER-02 - Target Session
context CollaborationService::sendReaction(command: ReactionCommand, session: Session): ReactionEvent
pre BR_SER_02_TargetSession:
  command.sessionId = session.id and session.status <> SessionStatus::ENDED

BR-SER-03 - Command Key
context CollaborationService::sendReaction(command: ReactionCommand, session: Session): ReactionEvent
pre BR_SER_03_CommandKey:
  command.idempotencyKey <> null and command.idempotencyKey.trim().size() > 0

BR-SER-04 - Created Identity
context CollaborationService::sendReaction(command: ReactionCommand, session: Session): ReactionEvent
post BR_SER_04_CreatedIdentity:
  result.oclIsNew() and result.id <> null and result.sessionId = command.sessionId and result.participantId = command.participantId

BR-SER-05 - Reaction Value
context CollaborationService::sendReaction(command: ReactionCommand, session: Session): ReactionEvent
post BR_SER_05_ReactionValue:
  result.reaction = command.reaction and result.createdAt <> null and result.sequence = session.version@pre + 1

BR-SER-06 - Participation Unaffected
context CollaborationService::sendReaction(command: ReactionCommand, session: Session): ReactionEvent
post BR_SER_06_ParticipationUnaffected:
  Participant.allInstances() = Participant.allInstances()@pre

BR-SER-07 - No Implicit Stage Request
context CollaborationService::sendReaction(command: ReactionCommand, session: Session): ReactionEvent
post BR_SER_07_NoImplicitStageRequest:
  StageRequest.allInstances() = StageRequest.allInstances()@pre
~~~
