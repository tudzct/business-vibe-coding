---
artifact_type: business-rule-specification
status: Frozen
uc_id: UC-18
uc_name: "End a Session for Everyone"
---

# UC-18: End a Session for Everyone

## Business Rules

### OCL Utility Definitions

```text
String.trim(): String
- Removes leading and trailing whitespace; internal whitespace is unchanged.
```

### Rule Definitions

~~~text
BR-ESE-01 - Authenticated Membership
context SessionService::end(command: DepartureCommand, session: Session): Departure
pre BR_ESE_01_AuthenticatedMembership:
  RequestContext::authenticated and RequestContext::sessionId = command.sessionId and
  command.actorParticipantId = RequestContext::participantId and
  Participant.allInstances()->exists(p | p.id = command.actorParticipantId and
    p.principalId = RequestContext::principalId and p.sessionId = command.sessionId and
    p.status = ParticipantStatus::JOINED and p.role = ParticipantRole::HOST)

BR-ESE-02 - Target Session
context SessionService::end(command: DepartureCommand, session: Session): Departure
pre BR_ESE_02_TargetSession:
  command.sessionId = session.id and session.status <> SessionStatus::ENDED

BR-ESE-03 - Command Key
context SessionService::end(command: DepartureCommand, session: Session): Departure
pre BR_ESE_03_CommandKey:
  command.idempotencyKey <> null and command.idempotencyKey.trim().size() > 0

BR-ESE-04 - Departure Action
context SessionService::end(command: DepartureCommand, session: Session): Departure
pre BR_ESE_04_DepartureAction:
  command.kind = DepartureKind::END and command.expectedVersion = session.version

BR-ESE-05 - Created Identity
context SessionService::end(command: DepartureCommand, session: Session): Departure
post BR_ESE_05_CreatedIdentity:
  result.oclIsNew() and result.id <> null and result.sessionId = command.sessionId and result.participantId = command.actorParticipantId and result.kind = DepartureKind::END and result.createdAt <> null

BR-ESE-06 - Session Ended
context SessionService::end(command: DepartureCommand, session: Session): Departure
post BR_ESE_06_SessionEnded:
  session.status = SessionStatus::ENDED and session.endedAt <> null and session.version = session.version@pre + 1

BR-ESE-07 - All Participants Leave
context SessionService::end(command: DepartureCommand, session: Session): Departure
post BR_ESE_07_AllParticipantsLeave:
  Participant.allInstances()@pre->select(p | p.sessionId = session.id and p.status@pre = ParticipantStatus::JOINED)->forAll(p |
    p.status = ParticipantStatus::LEFT and p.leftAt <> null and p.version = p.version@pre + 1 and not p.microphoneEnabled and not p.cameraEnabled)

BR-ESE-08 - Stream Terminated
context SessionService::end(command: DepartureCommand, session: Session): Departure
post BR_ESE_08_StreamTerminated:
  LiveStream.allInstances()@pre->select(s | s.sessionId = session.id and s.status@pre <> StreamStatus::ENDED)->forAll(s |
    s.status = StreamStatus::ENDED and s.endedAt <> null and s.version = s.version@pre + 1)

BR-ESE-09 - Stop Content Shares
context SessionService::end(command: DepartureCommand, session: Session): Departure
post BR_ESE_09_StopContentShares:
  ContentShare.allInstances()@pre->select(cs | cs.sessionId = command.sessionId and cs.status@pre = ShareStatus::ACTIVE)->forAll(cs |
    cs.status = ShareStatus::STOPPED and cs.stoppedAt <> null and cs.version = cs.version@pre + 1)

BR-ESE-10 - Cancel Pending Requests
context SessionService::end(command: DepartureCommand, session: Session): Departure
post BR_ESE_10_CancelPendingRequests:
  StageRequest.allInstances()@pre->select(r | r.sessionId = command.sessionId and r.status@pre = StageRequestStatus::PENDING)->forAll(r |
    r.status = StageRequestStatus::CANCELLED and r.decidedAt <> null and r.version = r.version@pre + 1)

BR-ESE-11 - Stop Recordings
context SessionService::end(command: DepartureCommand, session: Session): Departure
post BR_ESE_11_StopRecordings:
  Recording.allInstances()@pre->select(r | r.sessionId = command.sessionId and
    (r.status@pre = RecordingStatus::STARTING or r.status@pre = RecordingStatus::RECORDING))->forAll(r |
    r.status = RecordingStatus::STOPPED and r.stoppedAt <> null and r.version = r.version@pre + 1)
~~~
