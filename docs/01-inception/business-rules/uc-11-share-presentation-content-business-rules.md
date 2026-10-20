---
artifact_type: business-rule-specification
status: Frozen
uc_id: UC-11
uc_name: "Share Presentation Content"
---

# UC-11: Share Presentation Content

## Business Rules

### OCL Utility Definitions

```text
String.trim(): String
- Removes leading and trailing whitespace; internal whitespace is unchanged.
```

### Rule Definitions

~~~text
BR-SPC-01 - Authenticated Membership
context ContentShareService::control(command: ContentShareCommand, session: Session): ContentShare
pre BR_SPC_01_AuthenticatedMembership:
  RequestContext::authenticated and RequestContext::sessionId = command.sessionId and
  command.ownerParticipantId = RequestContext::participantId and
  Participant.allInstances()->exists(p | p.id = command.ownerParticipantId and
    p.principalId = RequestContext::principalId and p.sessionId = command.sessionId and
    p.status = ParticipantStatus::JOINED)

BR-SPC-02 - Target Session
context ContentShareService::control(command: ContentShareCommand, session: Session): ContentShare
pre BR_SPC_02_TargetSession:
  command.sessionId = session.id and session.status <> SessionStatus::ENDED

BR-SPC-03 - Command Key
context ContentShareService::control(command: ContentShareCommand, session: Session): ContentShare
pre BR_SPC_03_CommandKey:
  command.idempotencyKey <> null and command.idempotencyKey.trim().size() > 0

BR-SPC-04 - Start Share
context ContentShareService::control(command: ContentShareCommand, session: Session): ContentShare
pre BR_SPC_04_StartShare:
  command.action = ShareAction::START implies session.status = SessionStatus::LIVE and command.expectedVersion = null and
  command.kind <> null and command.sourceReference <> null and command.sourceReference.trim().size() > 0 and
  not ContentShare.allInstances()->exists(s | s.sessionId = session.id and s.status = ShareStatus::ACTIVE) and
  (session.kind <> SessionKind::LIVE_STREAM or Participant.allInstances()->exists(p | p.id = command.ownerParticipantId and p.role <> ParticipantRole::VIEWER))

BR-SPC-05 - Stop Share
context ContentShareService::control(command: ContentShareCommand, session: Session): ContentShare
pre BR_SPC_05_StopShare:
  command.action = ShareAction::STOP implies ContentShare.allInstances()->one(s |
    s.sessionId = session.id and s.status = ShareStatus::ACTIVE and s.version = command.expectedVersion and
    (s.ownerParticipantId = command.ownerParticipantId or Participant.allInstances()->exists(p | p.id = command.ownerParticipantId and p.role = ParticipantRole::HOST)))

BR-SPC-06 - Share Effect
context ContentShareService::control(command: ContentShareCommand, session: Session): ContentShare
post BR_SPC_06_ShareEffect:
  result.sessionId = session.id and
  if command.action = ShareAction::START then result.oclIsNew() and result.status = ShareStatus::ACTIVE and
    result.ownerParticipantId = command.ownerParticipantId and result.kind = command.kind and result.sourceReference = command.sourceReference and
    result.version = 1 and result.startedAt <> null and result.stoppedAt = null
  else result = ContentShare.allInstances()@pre->any(s | s.sessionId = session.id and s.status@pre = ShareStatus::ACTIVE) and
    result.status = ShareStatus::STOPPED and result.version = command.expectedVersion + 1 and result.stoppedAt <> null endif

BR-SPC-07 - One Active Share
context ContentShare
inv BR_SPC_07_OneActiveShare:
  ContentShare.allInstances()->select(s | s.sessionId = self.sessionId and s.status = ShareStatus::ACTIVE)->size() <= 1
~~~
