---
artifact_type: use-case-specification
status: Frozen
uc_id: UC-14
uc_name: "Change Session Layout"
---

# UC-14: Change Session Layout

## Functional Use-Case Specification

### Use Case ID

UC-14

### Use Case Name

Change Session Layout

### Description

As a participant, I want to change my session layout or picture-in-picture view so that I can focus on the content that matters to me.

### Actor(s)

Participant; Preference Service.

### Priority

Low

### Trigger

The participant chooses a layout or picture-in-picture control.

### Pre-Condition(s)

PRE-1: The client displays a joined-session interface.

### Post-Condition(s)

POST-1: The client renders the returned view preference.

### Basic Flow

Flow ID: BF-1

BF-1.1: The participant opens the view controls.
BF-1.2: The client presents the layouts shown by the design.
BF-1.3: The participant selects a layout.
BF-1.4: The client submits the preference update.
BF-1.5: The system returns the updated view preference.
BF-1.6: The client renders the selected layout.

### Alternative Flow

AF-1: Enable picture-in-picture

3a : The participant enables picture-in-picture.
3b : The client renders the returned picture-in-picture view.

AF-2: Open or close a side panel

3a : The participant opens or closes a side panel.
3b : The client adjusts the returned session layout.

### Exception Flow

EF-1: Layout preference update fails

5a : The preference update cannot be completed.
5b : The client displays the returned failure state and retains the previous layout.

### Related UI

- Live Streaming Desktop Layouts 6007:96234.
- Live Streaming Mobile Layouts 6012:102740.
- Video Conferencing Desktop Layouts 6007:77656.
- Video Conferencing Mobile Layouts 6012:78022.

### Related API IDs

API-PREFERENCES-UPDATE.
API-SESSION-STATE.

### Notes

The shared model defines trusted context, persistence mapping, and query helpers. Server mutation execution uses MutationGateway and its common OCL constraints in UC-02. API command dispatch selects the named operation; it does not combine the preconditions of different operations. Read operations have no domain writes.

UC-12 through UC-14 and the personal-pin rules in UC-15 constrain one atomic PreferenceService.update operation. Field-presence guards determine which values change. Client-local preview operations do not call this server operation.

## UML Model

~~~plantuml
@startuml
hide empty members
enum ShareStatus {
  ACTIVE
  STOPPED
}
enum LayoutMode {
  EQUAL_PROMINENCE
  SIDEBAR
  PRESENTER
}
class String <<datatype>> {
}
note right of String: Used only as a type; no structural member is accessed by these BRs.
class ContentShare {
  sessionId: String
  status: ShareStatus
}
class MediaPreference <<opaque>> {
}
note right of MediaPreference: Used only as a type; no structural member is accessed by these BRs.
class ViewPreference {
  layout: LayoutMode
  sidePanel: String
  pictureInPicture: Boolean
}
class PreferencePatch {
  sessionId: String
  hasLayout: Boolean
  layout: LayoutMode
  hasSidePanel: Boolean
  sidePanel: String
  hasPictureInPicture: Boolean
  pictureInPicture: Boolean
}
class PreferencesResult <<opaque>> {
}
note right of PreferencesResult: Used only as a type; no structural member is accessed by these BRs.
class PreferenceService {
  update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
}
@enduml
~~~
