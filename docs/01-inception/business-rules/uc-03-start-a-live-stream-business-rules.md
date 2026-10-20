---
artifact_type: business-rule-specification
status: Frozen
uc_id: UC-03
uc_name: "Start a Live Stream"
---

# UC-03: Start a Live Stream

## Business Rules

### OCL Utility Definitions

```text
String.trim(): String
- Removes leading and trailing whitespace; internal whitespace is unchanged.
```

### Rule Definitions

~~~text
BR-SLS-01 - Authenticated Membership
context LiveStreamService::start(command: StreamControlCommand, stream: LiveStream, session: Session): LiveStream
pre BR_SLS_01_AuthenticatedMembership:
  RequestContext::authenticated and RequestContext::sessionId = command.sessionId and
  command.actorParticipantId = RequestContext::participantId and
  Participant.allInstances()->exists(p | p.id = command.actorParticipantId and
    p.principalId = RequestContext::principalId and p.sessionId = command.sessionId and
    p.status = ParticipantStatus::JOINED and p.role = ParticipantRole::HOST)

BR-SLS-02 - Target Session
context LiveStreamService::start(command: StreamControlCommand, stream: LiveStream, session: Session): LiveStream
pre BR_SLS_02_TargetSession:
  command.sessionId = session.id and session.status <> SessionStatus::ENDED

BR-SLS-03 - Command Key
context LiveStreamService::start(command: StreamControlCommand, stream: LiveStream, session: Session): LiveStream
pre BR_SLS_03_CommandKey:
  command.idempotencyKey <> null and command.idempotencyKey.trim().size() > 0

BR-SLS-04 - Stream Target And Version
context LiveStreamService::start(command: StreamControlCommand, stream: LiveStream, session: Session): LiveStream
pre BR_SLS_04_StreamTargetAndVersion:
  command.action = StreamAction::START and session.kind = SessionKind::LIVE_STREAM and
  session.status = SessionStatus::LIVE and stream.sessionId = session.id and command.expectedVersion = stream.version

BR-SLS-05 - Same Stream Version
context LiveStreamService::start(command: StreamControlCommand, stream: LiveStream, session: Session): LiveStream
post BR_SLS_05_SameStreamVersion:
  result = stream and stream.version = stream.version@pre + 1

BR-SLS-06 - Ready Only
context LiveStreamService::start(command: StreamControlCommand, stream: LiveStream, session: Session): LiveStream
pre BR_SLS_06_ReadyOnly:
  stream.status = StreamStatus::READY

BR-SLS-07 - Starting
context LiveStreamService::start(command: StreamControlCommand, stream: LiveStream, session: Session): LiveStream
post BR_SLS_07_Starting:
  stream.status = StreamStatus::STARTING and stream.endedAt = null

BR-SLS-08 - Provider Completion Target
context LiveStreamService::complete(command: ProviderCompletion, stream: LiveStream, session: Session): LiveStream
pre BR_SLS_08_ProviderCompletionTarget:
  RequestContext::providerAuthenticated and command.sessionId = session.id and stream.sessionId = session.id and
  command.resourceId = stream.id and command.expectedVersion = stream.version and stream.status = StreamStatus::STARTING and
  session.status = SessionStatus::LIVE and TransactionContext::lockedSessionId = session.id and TransactionContext::atomicCommit

BR-SLS-09 - Provider Completion State
context LiveStreamService::complete(command: ProviderCompletion, stream: LiveStream, session: Session): LiveStream
post BR_SLS_09_ProviderCompletionState:
  result = stream and stream.version = stream.version@pre + 1 and session.version = session.version@pre + 1 and
  if command.succeeded then stream.status = StreamStatus::LIVE and stream.startedAt <> null
  else stream.status = StreamStatus::READY endif
~~~
