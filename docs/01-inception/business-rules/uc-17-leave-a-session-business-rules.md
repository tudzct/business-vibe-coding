---
artifact_type: business-rule-specification
status: Frozen
uc_id: UC-17
uc_name: "Leave a Session"
---

# UC-17: Leave a Session

## Business Rules

### OCL Utility Definitions

```text
String.trim(): String
- Removes leading and trailing whitespace; internal whitespace is unchanged.
```

### Rule Definitions

~~~text
BR-LS-01 - Authenticated Membership
context SessionService::leave(command: DepartureCommand, session: Session): Departure
pre BR_LS_01_AuthenticatedMembership:
  RequestContext::authenticated and RequestContext::sessionId = command.sessionId and
  command.actorParticipantId = RequestContext::participantId and
  Participant.allInstances()->exists(p | p.id = command.actorParticipantId and
    p.principalId = RequestContext::principalId and p.sessionId = command.sessionId and
    p.status = ParticipantStatus::JOINED)

BR-LS-02 - Target Session
context SessionService::leave(command: DepartureCommand, session: Session): Departure
pre BR_LS_02_TargetSession:
  command.sessionId = session.id and session.status <> SessionStatus::ENDED

BR-LS-03 - Command Key
context SessionService::leave(command: DepartureCommand, session: Session): Departure
pre BR_LS_03_CommandKey:
  command.idempotencyKey <> null and command.idempotencyKey.trim().size() > 0

BR-LS-04 - Departure Action
context SessionService::leave(command: DepartureCommand, session: Session): Departure
pre BR_LS_04_DepartureAction:
  command.kind = DepartureKind::LEAVE and command.expectedVersion = session.version

BR-LS-05 - Created Identity
context SessionService::leave(command: DepartureCommand, session: Session): Departure
post BR_LS_05_CreatedIdentity:
  result.oclIsNew() and result.id <> null and result.sessionId = command.sessionId and result.participantId = command.actorParticipantId and result.kind = DepartureKind::LEAVE and result.createdAt <> null

BR-LS-06 - Host Uses End
context SessionService::leave(command: DepartureCommand, session: Session): Departure
pre BR_LS_06_HostUsesEnd:
  Participant.allInstances()->any(p | p.id = command.actorParticipantId).role <> ParticipantRole::HOST

BR-LS-07 - Left Participant
context SessionService::leave(command: DepartureCommand, session: Session): Departure
post BR_LS_07_LeftParticipant:
  let p : Participant = Participant.allInstances()->any(p | p.id = command.actorParticipantId) in
  p.status = ParticipantStatus::LEFT and p.leftAt <> null and p.version = p.version@pre + 1 and
  not p.microphoneEnabled and not p.cameraEnabled and session.status = session.status@pre

BR-LS-08 - Demote Former Stage Participants
context SessionService::leave(command: DepartureCommand, session: Session): Departure
post BR_LS_08_DemoteFormerStageParticipants:
  Participant.allInstances()@pre->select(p | p.sessionId = command.sessionId and p.id = command.actorParticipantId and p.role@pre = ParticipantRole::STAGE_PARTICIPANT)->forAll(p |
    p.role = ParticipantRole::VIEWER and not p.microphoneEnabled and not p.cameraEnabled)

BR-LS-09 - Stop Content Shares
context SessionService::leave(command: DepartureCommand, session: Session): Departure
post BR_LS_09_StopContentShares:
  ContentShare.allInstances()@pre->select(cs | cs.sessionId = command.sessionId and cs.ownerParticipantId = command.actorParticipantId and cs.status@pre = ShareStatus::ACTIVE)->forAll(cs |
    cs.status = ShareStatus::STOPPED and cs.stoppedAt <> null and cs.version = cs.version@pre + 1)

BR-LS-10 - Cancel Pending Requests
context SessionService::leave(command: DepartureCommand, session: Session): Departure
post BR_LS_10_CancelPendingRequests:
  StageRequest.allInstances()@pre->select(r | r.sessionId = command.sessionId and r.participantId = command.actorParticipantId and r.status@pre = StageRequestStatus::PENDING)->forAll(r |
    r.status = StageRequestStatus::CANCELLED and r.decidedAt <> null and r.version = r.version@pre + 1)
~~~
