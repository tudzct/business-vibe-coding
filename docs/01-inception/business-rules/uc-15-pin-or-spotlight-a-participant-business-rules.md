---
artifact_type: business-rule-specification
status: Frozen
uc_id: UC-15
uc_name: "Pin or Spotlight a Participant"
---

# UC-15: Pin or Spotlight a Participant

## Business Rules

### OCL Utility Definitions

```text
String.trim(): String
- Removes leading and trailing whitespace; internal whitespace is unchanged.
```

### Rule Definitions

~~~text
BR-PSP-01 - Focus Target
context PreferenceService::update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
pre BR_PSP_01_FocusTarget:
  (command.hasFocusedParticipantId and command.focusedParticipantId <> null) implies
  Participant.allInstances()->exists(p | p.id = command.focusedParticipantId and p.sessionId = command.sessionId and p.status = ParticipantStatus::JOINED)

BR-PSP-02 - Pin Patch
context PreferenceService::update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
post BR_PSP_02_PinPatch:
  view.focusedParticipantId = if command.hasFocusedParticipantId then command.focusedParticipantId else view.focusedParticipantId@pre endif

BR-PSP-03 - Pin Is Personal
context PreferenceService::update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
post BR_PSP_03_PinIsPersonal:
  ViewPreference.allInstances() = ViewPreference.allInstances()@pre and
  ViewPreference.allInstances()@pre->select(v | v.participantId <> command.participantId)->forAll(v |
    v.layout = v.layout@pre and v.focusedParticipantId = v.focusedParticipantId@pre and
    v.sidePanel = v.sidePanel@pre and v.pictureInPicture = v.pictureInPicture@pre and v.updatedAt = v.updatedAt@pre)

BR-PSP-04 - Authenticated Membership
context SpotlightService::update(command: SpotlightCommand, session: Session): Session
pre BR_PSP_04_AuthenticatedMembership:
  RequestContext::authenticated and RequestContext::sessionId = command.sessionId and
  command.actorParticipantId = RequestContext::participantId and
  Participant.allInstances()->exists(p | p.id = command.actorParticipantId and
    p.principalId = RequestContext::principalId and p.sessionId = command.sessionId and
    p.status = ParticipantStatus::JOINED)

BR-PSP-05 - Command Key
context SpotlightService::update(command: SpotlightCommand, session: Session): Session
pre BR_PSP_05_CommandKey:
  command.idempotencyKey <> null and command.idempotencyKey.trim().size() > 0

BR-PSP-06 - Spotlight Target
context SpotlightService::update(command: SpotlightCommand, session: Session): Session
pre BR_PSP_06_SpotlightTarget:
  command.targetParticipantId = null or Participant.allInstances()->exists(p |
    p.id = command.targetParticipantId and p.sessionId = command.sessionId and p.status = ParticipantStatus::JOINED)

BR-PSP-07 - Spotlight Actor
context SpotlightService::update(command: SpotlightCommand, session: Session): Session
pre BR_PSP_07_SpotlightActor:
  Participant.allInstances()->exists(p | p.id = command.actorParticipantId and
    (p.role = ParticipantRole::HOST or p.role = ParticipantRole::BROADCASTER or p.role = ParticipantRole::STAGE_PARTICIPANT))

BR-PSP-08 - Session Version
context SpotlightService::update(command: SpotlightCommand, session: Session): Session
pre BR_PSP_08_SessionVersion:
  command.sessionId = session.id and session.status = SessionStatus::LIVE and command.expectedVersion = session.version

BR-PSP-09 - Shared Spotlight
context SpotlightService::update(command: SpotlightCommand, session: Session): Session
post BR_PSP_09_SharedSpotlight:
  result.id = session.id and result.spotlightedParticipantId = command.targetParticipantId and
  result.version = session.version@pre + 1

BR-PSP-10 - Personal Pins Unaffected
context SpotlightService::update(command: SpotlightCommand, session: Session): Session
post BR_PSP_10_PersonalPinsUnaffected:
  ViewPreference.allInstances() = ViewPreference.allInstances()@pre
~~~
