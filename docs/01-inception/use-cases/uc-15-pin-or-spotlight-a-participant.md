---
artifact_type: business-use-case-specification
status: Frozen
uc_id: UC-15
uc_name: "Pin or Spotlight a Participant"
---

# UC-15: Pin or Spotlight a Participant

## Functional Use-Case Specification

### Use Case ID

UC-15

### Use Case Name

Pin or Spotlight a Participant

### Description

As a participant, I want to pin a tile for myself or spotlight a tile for everyone so that the intended audience receives the selected visual focus.

### Actor(s)

Participant; Preference Service; Spotlight Service.

### Priority

Low

### Trigger

The participant chooses a pin or spotlight action on a visible tile.

### Pre-Condition(s)

PRE-1: The client displays participant tiles in a joined session.

### Post-Condition(s)

POST-1: The client renders a pinned tile in the caller's view or a spotlighted tile in the shared session view.

### Basic Flow

1. The participant opens the controls for a participant tile.
2. The client presents the visible pin or spotlight action.
3. The participant chooses the personal pin action.
4. The client submits the preference update.
5. The system returns the caller's updated focused view.
6. The client renders the selected tile with visual prominence.

### Alternative Flow

AF-1: Remove the personal pin

3a : The participant removes the personal pin.
3b : The client submits the update and restores the returned general layout.

AF-2: Spotlight a participant

3a : The participant chooses the session spotlight action.
3b : The client submits the session control update.
3c : The system returns the updated shared session representation.
3d : Session clients render the selected tile with shared prominence.

AF-3: Remove the session spotlight

3a : The participant removes the session spotlight.
3b : The client submits the session control update.
3c : Session clients restore the shared layout returned by the system.

### Exception Flow

EF-1: Focus preference update fails

5a : The preference update cannot be completed.
5b : The client displays the returned failure state and retains the prior focus.

### Related UI

- Video Conferencing Desktop Features 6007:55138.
- Video Conferencing Mobile Layouts 6012:78022.
- Component evidence: Panel/Tile Menu 6073:15912, including Pin Tile for Myself and Spotlight Tile for Everyone.

### Related API IDs

API-PREFERENCES-UPDATE.
API-SPOTLIGHT-UPDATE.
API-PARTICIPANT-LIST.
API-SESSION-STATE.

### Notes

The shared model defines trusted context, persistence mapping, and query helpers. Server mutation execution uses MutationGateway and its common OCL constraints in UC-02. API command dispatch selects the named operation; it does not combine the preconditions of different operations. Read operations have no domain writes.

BR-PSP-01 through BR-PSP-03 constrain the personal pin stored by PreferenceService.update. BR-PSP-04 through BR-PSP-10 constrain the shared session spotlight stored by SpotlightService.update. Client-local preview operations do not call either server operation.

## UML Model

Local projection of exactly the vocabulary needed by the Business Rules below, including signature and helper types. Enum domains are retained in full to preserve their value semantics.

~~~plantuml
@startuml
hide empty members
enum SessionStatus {
  LOBBY
  LIVE
  ENDED
}
enum ParticipantRole {
  HOST
  BROADCASTER
  VIEWER
  STAGE_PARTICIPANT
}
enum ParticipantStatus {
  JOINED
  LEFT
}
enum LayoutMode {
  EQUAL_PROMINENCE
  SIDEBAR
  PRESENTER
}
class String {
  trim(): String
}
class DateTime <<datatype>> {
}
note right of DateTime: Used only as a type; no structural member is accessed by these BRs.
class RequestContext {
  {static} principalId: String
  {static} participantId: String
  {static} sessionId: String
  {static} authenticated: Boolean
}
class Session {
  id: String
  status: SessionStatus
  spotlightedParticipantId: String
  version: Integer
}
class Participant {
  id: String
  sessionId: String
  principalId: String
  role: ParticipantRole
  status: ParticipantStatus
}
class MediaPreference <<opaque>> {
}
note right of MediaPreference: Used only as a type; no structural member is accessed by these BRs.
class ViewPreference {
  participantId: String
  layout: LayoutMode
  focusedParticipantId: String
  sidePanel: String
  pictureInPicture: Boolean
  updatedAt: DateTime
}
class PreferencePatch {
  sessionId: String
  participantId: String
  hasFocusedParticipantId: Boolean
  focusedParticipantId: String
}
class SpotlightCommand {
  sessionId: String
  actorParticipantId: String
  targetParticipantId: String
  expectedVersion: Integer
  idempotencyKey: String
}
class PreferencesResult <<opaque>> {
}
note right of PreferencesResult: Used only as a type; no structural member is accessed by these BRs.
class PreferenceService {
  update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
}
class SpotlightService {
  update(command: SpotlightCommand, session: Session): Session
}
note right of String
Removes leading and trailing whitespace; internal whitespace is unchanged.
end note
note right of RequestContext
Request-local trusted adapter data; not a process-global singleton.
Principal and session are decoded from the authenticated session access token.
participantId resolves the principal's membership.
end note
@enduml
~~~

## Business Rules

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
