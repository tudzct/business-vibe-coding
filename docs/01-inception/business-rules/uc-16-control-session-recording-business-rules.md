---
artifact_type: business-rule-specification
status: Frozen
uc_id: UC-16
uc_name: "Control Session Recording"
---

# UC-16: Control Session Recording

## Business Rules

### OCL Utility Definitions

```text
String.trim(): String
- Removes leading and trailing whitespace; internal whitespace is unchanged.
```

### Rule Definitions

~~~text
BR-CSR-01 - Authenticated Membership
context RecordingService::control(command: RecordingCommand, session: Session): Recording
pre BR_CSR_01_AuthenticatedMembership:
  RequestContext::authenticated and RequestContext::sessionId = command.sessionId and
  command.actorParticipantId = RequestContext::participantId and
  Participant.allInstances()->exists(p | p.id = command.actorParticipantId and
    p.principalId = RequestContext::principalId and p.sessionId = command.sessionId and
    p.status = ParticipantStatus::JOINED and p.role = ParticipantRole::HOST)

BR-CSR-02 - Target Session
context RecordingService::control(command: RecordingCommand, session: Session): Recording
pre BR_CSR_02_TargetSession:
  command.sessionId = session.id and session.status <> SessionStatus::ENDED

BR-CSR-03 - Command Key
context RecordingService::control(command: RecordingCommand, session: Session): Recording
pre BR_CSR_03_CommandKey:
  command.idempotencyKey <> null and command.idempotencyKey.trim().size() > 0

BR-CSR-04 - Start Recording
context RecordingService::control(command: RecordingCommand, session: Session): Recording
pre BR_CSR_04_StartRecording:
  command.action = RecordingAction::START implies command.expectedVersion = null and session.status = SessionStatus::LIVE and
  not Recording.allInstances()->exists(r | r.sessionId = session.id and (r.status = RecordingStatus::STARTING or r.status = RecordingStatus::RECORDING))

BR-CSR-05 - Stop Recording
context RecordingService::control(command: RecordingCommand, session: Session): Recording
pre BR_CSR_05_StopRecording:
  command.action = RecordingAction::STOP implies Recording.allInstances()->one(r | r.sessionId = session.id and
    (r.status = RecordingStatus::STARTING or r.status = RecordingStatus::RECORDING) and r.version = command.expectedVersion)

BR-CSR-06 - Recording Effect
context RecordingService::control(command: RecordingCommand, session: Session): Recording
post BR_CSR_06_RecordingEffect:
  result.sessionId = session.id and
  if command.action = RecordingAction::START then result.oclIsNew() and result.status = RecordingStatus::STARTING and
    result.startedByParticipantId = command.actorParticipantId and result.createdAt <> null and result.startedAt = null and result.version = 1 and result.stoppedAt = null
  else result = Recording.allInstances()@pre->any(r | r.sessionId = session.id and
      (r.status@pre = RecordingStatus::STARTING or r.status@pre = RecordingStatus::RECORDING)) and
    result.status = RecordingStatus::STOPPED and result.version = command.expectedVersion + 1 and result.stoppedAt <> null endif

BR-CSR-07 - Recording Callback
context RecordingService::complete(command: ProviderCompletion, recording: Recording, session: Session): Recording
pre BR_CSR_07_RecordingCallback:
  RequestContext::providerAuthenticated and command.sessionId = session.id and recording.sessionId = session.id and
  command.resourceId = recording.id and command.expectedVersion = recording.version and recording.status = RecordingStatus::STARTING and
  session.status = SessionStatus::LIVE and TransactionContext::lockedSessionId = session.id and TransactionContext::atomicCommit

BR-CSR-08 - Recording Callback Effect
context RecordingService::complete(command: ProviderCompletion, recording: Recording, session: Session): Recording
post BR_CSR_08_RecordingCallbackEffect:
  result = recording and recording.version = recording.version@pre + 1 and session.version = session.version@pre + 1 and
  if command.succeeded then recording.status = RecordingStatus::RECORDING and recording.startedAt <> null
  else recording.status = RecordingStatus::FAILED and recording.stoppedAt <> null endif

BR-CSR-09 - One Active Recording
context Recording
inv BR_CSR_09_OneActiveRecording:
  Recording.allInstances()->select(r | r.sessionId = self.sessionId and (r.status = RecordingStatus::STARTING or r.status = RecordingStatus::RECORDING))->size() <= 1
~~~
