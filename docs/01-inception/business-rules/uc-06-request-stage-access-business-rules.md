---
artifact_type: business-rule-specification
status: Frozen
uc_id: UC-06
uc_name: "Request Stage Access"
---

# UC-06: Request Stage Access

## Business Rules

### OCL Utility Definitions

```text
String.trim(): String
- Removes leading and trailing whitespace; internal whitespace is unchanged.
```

### Rule Definitions

~~~text
BR-RSA-01 - Authenticated Membership
context StageService::submitRequest(command: StageCommand, session: Session, stream: LiveStream): StageRequest
pre BR_RSA_01_AuthenticatedMembership:
  RequestContext::authenticated and RequestContext::sessionId = command.sessionId and
  command.actorParticipantId = RequestContext::participantId and
  Participant.allInstances()->exists(p | p.id = command.actorParticipantId and
    p.principalId = RequestContext::principalId and p.sessionId = command.sessionId and
    p.status = ParticipantStatus::JOINED)

BR-RSA-02 - Target Session
context StageService::submitRequest(command: StageCommand, session: Session, stream: LiveStream): StageRequest
pre BR_RSA_02_TargetSession:
  command.sessionId = session.id and session.status <> SessionStatus::ENDED

BR-RSA-03 - Command Key
context StageService::submitRequest(command: StageCommand, session: Session, stream: LiveStream): StageRequest
pre BR_RSA_03_CommandKey:
  command.idempotencyKey <> null and command.idempotencyKey.trim().size() > 0

BR-RSA-04 - Stream Binding
context StageService::submitRequest(command: StageCommand, session: Session, stream: LiveStream): StageRequest
pre BR_RSA_04_StreamBinding:
  stream.sessionId = session.id and session.kind = SessionKind::LIVE_STREAM and stream.status = StreamStatus::LIVE

BR-RSA-05 - Request Actions
context StageService::submitRequest(command: StageCommand, session: Session, stream: LiveStream): StageRequest
pre BR_RSA_05_RequestActions:
  command.action = StageRequestAction::CREATE or command.action = StageRequestAction::CANCEL

BR-RSA-06 - Create Viewer
context StageService::submitRequest(command: StageCommand, session: Session, stream: LiveStream): StageRequest
pre BR_RSA_06_CreateViewer:
  command.action = StageRequestAction::CREATE implies
  command.requestId = null and command.expectedVersion = null and
  Participant.allInstances()->exists(p | p.id = command.actorParticipantId and p.role = ParticipantRole::VIEWER) and
  not StageRequest.allInstances()->exists(r | r.sessionId = session.id and r.participantId = command.actorParticipantId and r.status = StageRequestStatus::PENDING)

BR-RSA-07 - Cancel Owned Pending
context StageService::submitRequest(command: StageCommand, session: Session, stream: LiveStream): StageRequest
pre BR_RSA_07_CancelOwnedPending:
  command.action = StageRequestAction::CANCEL implies StageRequest.allInstances()->one(r |
    r.id = command.requestId and r.sessionId = session.id and r.participantId = command.actorParticipantId and
    r.status = StageRequestStatus::PENDING and r.version = command.expectedVersion)

BR-RSA-08 - Request Outcome
context StageService::submitRequest(command: StageCommand, session: Session, stream: LiveStream): StageRequest
post BR_RSA_08_RequestOutcome:
  result.sessionId = session.id and result.participantId = command.actorParticipantId and
  if command.action = StageRequestAction::CREATE then result.oclIsNew() and result.status = StageRequestStatus::PENDING and
    result.version = 1 and result.createdAt <> null and result.decidedAt = null and result.decidedByParticipantId = null
  else result.id = command.requestId and not result.oclIsNew() and result.status = StageRequestStatus::CANCELLED and
    result.version = command.expectedVersion + 1 and result.decidedAt <> null and result.decidedByParticipantId = null endif

BR-RSA-09 - One Pending Request
context StageRequest
inv BR_RSA_09_OnePendingRequest:
  StageRequest.allInstances()->select(r | r.sessionId = self.sessionId and r.participantId = self.participantId and r.status = StageRequestStatus::PENDING)->size() <= 1
~~~
