---
artifact_type: business-rule-specification
status: Frozen
uc_id: UC-02
uc_name: "Join a Session"
---

# UC-02: Join a Session

## Business Rules

### OCL Utility Definitions

```text
String.trim(): String
- Removes leading and trailing whitespace; internal whitespace is unchanged.

DateTime::now(): DateTime
- Returns the transaction-clock instant.

DateTime::addHours(value: DateTime, hours: Integer): DateTime
- Returns the instant after the specified number of elapsed hours.

DateTime::isAfter(value: DateTime, other: DateTime): Boolean
- True when value is later than other as an instant.

DomainState::snapshot(sessionId: String): String
- Canonically serializes the session and all session-owned domain rows.
- Excludes the command journal and immutable response storage; equality checks detect domain effects on replay or rejection.
```

### Rule Definitions

~~~text
BR-JS-01 - Trusted Join Principal
context SessionJoinService::join(command: JoinCommand, session: Session): Participant
pre BR_JS_01_TrustedJoinPrincipal:
  RequestContext::authenticated and command.sessionId = RequestContext::sessionId and
  command.principalId = RequestContext::principalId and
  Principal.allInstances()->exists(p | p.id = command.principalId and p.userId = command.userId)

BR-JS-02 - Target Session
context SessionJoinService::join(command: JoinCommand, session: Session): Participant
pre BR_JS_02_TargetSession:
  command.sessionId = session.id and session.status <> SessionStatus::ENDED

BR-JS-03 - Command Key
context SessionJoinService::join(command: JoinCommand, session: Session): Participant
pre BR_JS_03_CommandKey:
  command.idempotencyKey <> null and command.idempotencyKey.trim().size() > 0

BR-JS-04 - Name
context SessionJoinService::join(command: JoinCommand, session: Session): Participant
pre BR_JS_04_Name:
  command.displayName <> null and command.displayName.trim().size() > 0 and command.displayName.trim().size() <= 50

BR-JS-05 - No Duplicate Membership
context SessionJoinService::join(command: JoinCommand, session: Session): Participant
pre BR_JS_05_NoDuplicateMembership:
  not session.participants->exists(p | p.principalId = command.principalId and p.status = ParticipantStatus::JOINED)

BR-JS-06 - Capacity
context SessionJoinService::join(command: JoinCommand, session: Session): Participant
pre BR_JS_06_Capacity:
  let count : Integer = session.participants->select(p | p.status = ParticipantStatus::JOINED)->size() in
  (session.kind = SessionKind::VIDEO_CONFERENCE implies count < 100) and
  (session.kind = SessionKind::LIVE_STREAM implies count < 1000)

BR-JS-07 - Created Identity
context SessionJoinService::join(command: JoinCommand, session: Session): Participant
post BR_JS_07_CreatedIdentity:
  result.oclIsNew() and result.id <> null and result.sessionId = command.sessionId and result.principalId = command.principalId and result.userId = command.userId

BR-JS-08 - Joined Participant
context SessionJoinService::join(command: JoinCommand, session: Session): Participant
post BR_JS_08_JoinedParticipant:
  result.status = ParticipantStatus::JOINED and result.displayName = command.displayName.trim() and
  result.joinedAt <> null and result.leftAt = null and result.version = 1 and
  session.participants = session.participants@pre->including(result)

BR-JS-09 - Exclusive Role
context SessionJoinService::join(command: JoinCommand, session: Session): Participant
post BR_JS_09_ExclusiveRole:
  result.role = if command.principalId = session.designatedHostPrincipalId
    then ParticipantRole::HOST
    else if session.kind = SessionKind::LIVE_STREAM then ParticipantRole::VIEWER
      else ParticipantRole::BROADCASTER endif endif

BR-JS-10 - Effective Media
context SessionJoinService::join(command: JoinCommand, session: Session): Participant
post BR_JS_10_EffectiveMedia:
  result.microphoneEnabled = (result.role <> ParticipantRole::VIEWER and command.microphoneEnabled) and
  result.cameraEnabled = (result.role <> ParticipantRole::VIEWER and command.cameraEnabled)

BR-JS-11 - Host Opens Session
context SessionJoinService::join(command: JoinCommand, session: Session): Participant
post BR_JS_11_HostOpensSession:
  if result.role = ParticipantRole::HOST then
    session.hostParticipantId = result.id and session.status = SessionStatus::LIVE
  else session.hostParticipantId = session.hostParticipantId@pre and session.status = session.status@pre endif

BR-JS-12 - Draft Background
context SessionJoinService::join(command: JoinCommand, session: Session): Participant
pre BR_JS_12_DraftBackground:
  command.virtualBackgroundId = null or VirtualBackground.allInstances()->exists(b | b.id = command.virtualBackgroundId and b.active)

BR-JS-13 - Initialize Preferences
context SessionJoinService::join(command: JoinCommand, session: Session): Participant
post BR_JS_13_InitializePreferences:
  MediaPreference.allInstances()->one(m | m.participantId = result.id and m.oclIsNew() and
    m.microphoneDeviceId = command.microphoneDeviceId and m.cameraDeviceId = command.cameraDeviceId and
    m.speakerDeviceId = command.speakerDeviceId and m.virtualBackgroundId = command.virtualBackgroundId and m.updatedAt <> null) and
  ViewPreference.allInstances()->one(v | v.participantId = result.id and v.oclIsNew() and
    v.layout = LayoutMode::EQUAL_PROMINENCE and v.focusedParticipantId = null and v.sidePanel = null and
    not v.pictureInPicture and v.updatedAt <> null)

BR-JS-14 - Gateway Identity And Transaction
context MutationGateway::execute(command: MutationEnvelope, session: Session): MutationReceipt
pre BR_JS_14_GatewayIdentityAndTransaction:
  RequestContext::authenticated and command.principalId = RequestContext::principalId and
  command.sessionId = RequestContext::sessionId and command.sessionId = session.id and
  TransactionContext::lockedSessionId = session.id and TransactionContext::isolation = IsolationLevel::SERIALIZABLE and
  TransactionContext::atomicCommit and command.idempotencyKey <> null and command.idempotencyKey.trim().size() > 0

BR-JS-15 - Replay Or Dispatch
context MutationGateway::execute(command: MutationEnvelope, session: Session): MutationReceipt
post BR_JS_15_ReplayOrDispatch:
  let previous : Set(IdempotencyRecord) = IdempotencyRecord.allInstances()@pre->select(r |
    r.principalId = command.principalId and r.sessionId = command.sessionId and r.operation = command.operation and
    r.idempotencyKey = command.idempotencyKey and DateTime::isAfter(r.expiresAt, DateTime::now())) in
  if previous->notEmpty() then
    result.dispatchCount = 0 and session.version = session.version@pre and
    if previous->any(true).payloadHash = command.payloadHash then
      result.outcome = MutationOutcome::COMPLETED and result.responseReference = previous->any(true).responseReference
    else result.outcome = MutationOutcome::REJECTED endif
  else
    result.dispatchCount = 1 and
    if result.outcome = MutationOutcome::COMPLETED then session.version = session.version@pre + 1
    else session.version = session.version@pre endif
  endif

BR-JS-16 - Persist Receipt
context MutationGateway::execute(command: MutationEnvelope, session: Session): MutationReceipt
post BR_JS_16_PersistReceipt:
  (result.dispatchCount = 1 and result.outcome = MutationOutcome::COMPLETED) implies
  IdempotencyRecord.allInstances()->one(r | r.principalId = command.principalId and r.sessionId = command.sessionId and
    r.operation = command.operation and r.idempotencyKey = command.idempotencyKey and
    r.payloadHash = command.payloadHash and r.responseReference = result.responseReference and
    r.completedAt = result.completedAt and r.expiresAt = DateTime::addHours(r.completedAt, 24))

BR-JS-17 - No Effects On Replay Or Rejection
context MutationGateway::execute(command: MutationEnvelope, session: Session): MutationReceipt
post BR_JS_17_NoEffectsOnReplayOrRejection:
  (result.dispatchCount = 0 or result.outcome = MutationOutcome::REJECTED) implies
  DomainState::snapshot(session.id) = DomainState::snapshot@pre(session.id)

BR-JS-18 - Session Participant Bindings
context Session
inv BR_JS_18_SessionParticipantBindings:
  self.participants = Participant.allInstances()->select(p | p.sessionId = self.id) and
  self.participants->select(p | p.status = ParticipantStatus::JOINED)->isUnique(principalId) and
  self.participants->select(p | p.status = ParticipantStatus::JOINED and p.role = ParticipantRole::HOST)->size() <= 1

BR-JS-19 - Session Capacity Invariant
context Session
inv BR_JS_19_SessionCapacityInvariant:
  let joined : Set(Participant) = self.participants->select(p | p.status = ParticipantStatus::JOINED) in
  (self.kind = SessionKind::VIDEO_CONFERENCE implies joined->size() <= 100) and
  (self.kind = SessionKind::LIVE_STREAM implies joined->size() <= 1000 and
    joined->select(p | p.role <> ParticipantRole::VIEWER)->size() <= 10)
~~~
