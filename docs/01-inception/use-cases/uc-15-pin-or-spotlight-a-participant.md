---
artifact_type: use-case-specification
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

Flow ID: BF-1

BF-1.1: The participant opens the controls for a participant tile.
BF-1.2: The client presents the visible pin or spotlight action.
BF-1.3: The participant chooses the personal pin action.
BF-1.4: The client submits the preference update.
BF-1.5: The system returns the caller's updated focused view.
BF-1.6: The client renders the selected tile with visual prominence.

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

The shared model defines trusted context, persistence mapping, and query helpers. Server mutation execution uses MutationGateway. API command dispatch selects the named operation. Read operations have no domain writes.

Personal pin updates are handled by PreferenceService.update. Shared session spotlight updates are handled by SpotlightService.update. Client-local preview operations do not call either server operation.

## UML Model

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
class DateTime <<datatype>> {
}
note right of DateTime: Used only as a type.
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
note right of MediaPreference: Used only as a type.
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
note right of PreferencesResult: Used only as a type.
class PreferenceService {
  update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
}
class SpotlightService {
  update(command: SpotlightCommand, session: Session): Session
}
note right of RequestContext
Request-local trusted adapter data; not a process-global singleton.
Principal and session are decoded from the authenticated session access token.
participantId resolves the principal's membership.
end note
@enduml
~~~
