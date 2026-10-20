---
artifact_type: business-rule-specification
status: Frozen
uc_id: UC-07
uc_name: "Respond to a Stage Request"
---

# UC-07: Respond to a Stage Request

## Business Rules

### OCL Utility Definitions

```text
String.trim(): String
- Removes leading and trailing whitespace; internal whitespace is unchanged.
```

### Rule Definitions

~~~text
BR-RSR-01 - Authenticated Membership
context StageService::decide(command: StageCommand, session: Session, stream: LiveStream, request: StageRequest): StageRequest
pre BR_RSR_01_AuthenticatedMembership:
  RequestContext::authenticated and RequestContext::sessionId = command.sessionId and
  command.actorParticipantId = RequestContext::participantId and
  Participant.allInstances()->exists(p | p.id = command.actorParticipantId and
    p.principalId = RequestContext::principalId and p.sessionId = command.sessionId and
    p.status = ParticipantStatus::JOINED and p.role = ParticipantRole::HOST)

BR-RSR-02 - Target Session
context StageService::decide(command: StageCommand, session: Session, stream: LiveStream, request: StageRequest): StageRequest
pre BR_RSR_02_TargetSession:
  command.sessionId = session.id and session.status <> SessionStatus::ENDED

BR-RSR-03 - Command Key
context StageService::decide(command: StageCommand, session: Session, stream: LiveStream, request: StageRequest): StageRequest
pre BR_RSR_03_CommandKey:
  command.idempotencyKey <> null and command.idempotencyKey.trim().size() > 0

BR-RSR-04 - Stream Binding
context StageService::decide(command: StageCommand, session: Session, stream: LiveStream, request: StageRequest): StageRequest
pre BR_RSR_04_StreamBinding:
  stream.sessionId = session.id and session.kind = SessionKind::LIVE_STREAM and stream.status = StreamStatus::LIVE

BR-RSR-05 - Pending Request Target
context StageService::decide(command: StageCommand, session: Session, stream: LiveStream, request: StageRequest): StageRequest
pre BR_RSR_05_PendingRequestTarget:
  (command.action = StageRequestAction::ACCEPT or command.action = StageRequestAction::REJECT) and
  request.id = command.requestId and request.sessionId = session.id and request.status = StageRequestStatus::PENDING and
  request.version = command.expectedVersion and Participant.allInstances()->exists(p | p.id = request.participantId and
    p.sessionId = session.id and p.status = ParticipantStatus::JOINED and p.role = ParticipantRole::VIEWER)

BR-RSR-06 - Stage Capacity
context StageService::decide(command: StageCommand, session: Session, stream: LiveStream, request: StageRequest): StageRequest
pre BR_RSR_06_StageCapacity:
  command.action = StageRequestAction::ACCEPT implies session.participants->select(p |
    p.status = ParticipantStatus::JOINED and p.role <> ParticipantRole::VIEWER)->size() < 10

BR-RSR-07 - Decision
context StageService::decide(command: StageCommand, session: Session, stream: LiveStream, request: StageRequest): StageRequest
post BR_RSR_07_Decision:
  result = request and request.version = request.version@pre + 1 and request.decidedAt <> null and
  request.decidedByParticipantId = command.actorParticipantId and
  request.status = if command.action = StageRequestAction::ACCEPT then StageRequestStatus::ACCEPTED else StageRequestStatus::REJECTED endif

BR-RSR-08 - Stage Admission
context StageService::decide(command: StageCommand, session: Session, stream: LiveStream, request: StageRequest): StageRequest
post BR_RSR_08_StageAdmission:
  let p : Participant = Participant.allInstances()->any(p | p.id = request.participantId) in
  if command.action = StageRequestAction::ACCEPT then p.role = ParticipantRole::STAGE_PARTICIPANT and p.version = p.version@pre + 1
  else p.role = p.role@pre and p.version = p.version@pre endif
~~~
