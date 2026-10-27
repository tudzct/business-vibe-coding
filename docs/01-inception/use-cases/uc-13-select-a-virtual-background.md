---
artifact_type: use-case-specification
status: Frozen
uc_id: UC-13
uc_name: "Select a Virtual Background"
---

# UC-13: Select a Virtual Background

## Functional Use-Case Specification

### Use Case ID

UC-13

### Use Case Name

Select a Virtual Background

### Description

As a participant, I want to select a virtual background so that my preview uses the chosen appearance.

### Actor(s)

Participant; Preference Service.

### Priority

Low

### Trigger

The participant opens virtual-background choices.

### Pre-Condition(s)

PRE-1: The client displays a camera preview.

### Post-Condition(s)

POST-1: The client displays the returned background preference in the preview.

### Basic Flow

Flow ID: BF-1

BF-1.1: The participant opens virtual-background choices.
BF-1.2: The client presents the available background previews.
BF-1.3: The participant selects a background.
BF-1.4: The client applies the selection locally in preview, or submits the preference update from the joined session.
BF-1.5: The client receives the local result or the returned media preference.
BF-1.6: The client renders the selected background in the preview.

### Alternative Flow

AF-1: Select no background

3a : The participant selects the no-background choice.
3b : The client removes the background treatment from the preview.

### Exception Flow

EF-1: Background preference cannot be applied

4a : The preference cannot be applied.
4b : The client displays the returned failure state and retains the previous preview.

### Related UI

- Virtual Background 6026:1184329.

### Related API IDs

API-PREFERENCES-UPDATE.
API-SESSION-JOIN.
API-BACKGROUND-LIST.
API-SESSION-STATE.

### Notes

The shared model defines trusted context, persistence mapping, and query helpers. Server mutation execution uses MutationGateway. API command dispatch selects the named operation. Read operations have no domain writes.

Preference updates are handled by PreferenceService.update. Field-presence guards determine which values change. Client-local preview operations do not call this server operation.

## UML Model

~~~plantuml
@startuml
hide empty members
class RequestContext {
  {static} authenticated: Boolean
}
class MediaPreference {
  virtualBackgroundId: String
}
class ViewPreference <<opaque>> {
}
note right of ViewPreference: Used only as a type.
class VirtualBackground {
  id: String
  assetReference: String
  active: Boolean
}
class PreviewDraft {
  microphoneDeviceId: String
  cameraDeviceId: String
  speakerDeviceId: String
  virtualBackgroundId: String
}
class PreferencePatch {
  hasVirtualBackgroundId: Boolean
  virtualBackgroundId: String
}
class PreferencesResult <<opaque>> {
}
note right of PreferencesResult: Used only as a type.
class PreferenceService {
  update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
  listBackgrounds(): Set(VirtualBackground)
}
class ClientPreferenceService {
  selectBackground(draft: PreviewDraft, backgroundId: String): PreviewDraft
}
note right of RequestContext
Request-local trusted adapter data; not a process-global singleton.
Principal and session are decoded from the authenticated session access token.
end note
@enduml
~~~
