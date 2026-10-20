---
artifact_type: business-rule-specification
status: Frozen
uc_id: UC-04
uc_name: "Stop a Live Stream"
---

# UC-04: Stop a Live Stream

## Business Rules

### OCL Utility Definitions

```text
String.trim(): String
- Removes leading and trailing whitespace; internal whitespace is unchanged.
```

### Rule Definitions

~~~text
BR-STLS-01 - Authenticated Membership
context LiveStreamService::stop(command: StreamControlCommand, stream: LiveStream, session: Session): LiveStream
pre BR_STLS_01_AuthenticatedMembership:
  RequestContext::authenticated and RequestContext::sessionId = command.sessionId and
  command.actorParticipantId = RequestContext::participantId and
  Participant.allInstances()->exists(p | p.id = command.actorParticipantId and
    p.principalId = RequestContext::principalId and p.sessionId = command.sessionId and
    p.status = ParticipantStatus::JOINED and p.role = ParticipantRole::HOST)

BR-STLS-02 - Target Session
context LiveStreamService::stop(command: StreamControlCommand, stream: LiveStream, session: Session): LiveStream
pre BR_STLS_02_TargetSession:
  command.sessionId = session.id and session.status <> SessionStatus::ENDED

BR-STLS-03 - Command Key
context LiveStreamService::stop(command: StreamControlCommand, stream: LiveStream, session: Session): LiveStream
pre BR_STLS_03_CommandKey:
  command.idempotencyKey <> null and command.idempotencyKey.trim().size() > 0

BR-STLS-04 - Stream Target And Version
context LiveStreamService::stop(command: StreamControlCommand, stream: LiveStream, session: Session): LiveStream
pre BR_STLS_04_StreamTargetAndVersion:
  command.action = StreamAction::STOP and session.kind = SessionKind::LIVE_STREAM and
  session.status = SessionStatus::LIVE and stream.sessionId = session.id and command.expectedVersion = stream.version

BR-STLS-05 - Same Stream Version
context LiveStreamService::stop(command: StreamControlCommand, stream: LiveStream, session: Session): LiveStream
post BR_STLS_05_SameStreamVersion:
  result = stream and stream.version = stream.version@pre + 1

BR-STLS-06 - Running Only
context LiveStreamService::stop(command: StreamControlCommand, stream: LiveStream, session: Session): LiveStream
pre BR_STLS_06_RunningOnly:
  stream.status = StreamStatus::LIVE or stream.status = StreamStatus::STARTING

BR-STLS-07 - Ended Stream
context LiveStreamService::stop(command: StreamControlCommand, stream: LiveStream, session: Session): LiveStream
post BR_STLS_07_EndedStream:
  stream.status = StreamStatus::ENDED and stream.endedAt <> null and session.status = session.status@pre

BR-STLS-08 - Demote Former Stage Participants
context LiveStreamService::stop(command: StreamControlCommand, stream: LiveStream, session: Session): LiveStream
post BR_STLS_08_DemoteFormerStageParticipants:
  Participant.allInstances()@pre->select(p | p.sessionId = command.sessionId and p.role@pre = ParticipantRole::STAGE_PARTICIPANT)->forAll(p |
    p.role = ParticipantRole::VIEWER and not p.microphoneEnabled and not p.cameraEnabled)

BR-STLS-09 - Stop Content Shares
context LiveStreamService::stop(command: StreamControlCommand, stream: LiveStream, session: Session): LiveStream
post BR_STLS_09_StopContentShares:
  ContentShare.allInstances()@pre->select(cs | cs.sessionId = command.sessionId and cs.status@pre = ShareStatus::ACTIVE)->forAll(cs |
    cs.status = ShareStatus::STOPPED and cs.stoppedAt <> null and cs.version = cs.version@pre + 1)

BR-STLS-10 - Cancel Pending Requests
context LiveStreamService::stop(command: StreamControlCommand, stream: LiveStream, session: Session): LiveStream
post BR_STLS_10_CancelPendingRequests:
  StageRequest.allInstances()@pre->select(r | r.sessionId = command.sessionId and r.status@pre = StageRequestStatus::PENDING)->forAll(r |
    r.status = StageRequestStatus::CANCELLED and r.decidedAt <> null and r.version = r.version@pre + 1)

BR-STLS-11 - Stop Recordings
context LiveStreamService::stop(command: StreamControlCommand, stream: LiveStream, session: Session): LiveStream
post BR_STLS_11_StopRecordings:
  Recording.allInstances()@pre->select(r | r.sessionId = command.sessionId and
    (r.status@pre = RecordingStatus::STARTING or r.status@pre = RecordingStatus::RECORDING))->forAll(r |
    r.status = RecordingStatus::STOPPED and r.stoppedAt <> null and r.version = r.version@pre + 1)
~~~
