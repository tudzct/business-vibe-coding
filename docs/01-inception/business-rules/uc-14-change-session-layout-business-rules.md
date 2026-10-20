---
artifact_type: business-rule-specification
status: Frozen
uc_id: UC-14
uc_name: "Change Session Layout"
---

# UC-14: Change Session Layout

## Business Rules

### OCL Utility Definitions

None.

### Rule Definitions

~~~text
BR-CSL-01 - Non Null Layout And Pi P
context PreferenceService::update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
pre BR_CSL_01_NonNullLayoutAndPiP:
  (command.hasLayout implies command.layout <> null) and (command.hasPictureInPicture implies command.pictureInPicture <> null)

BR-CSL-02 - Presenter Layout
context PreferenceService::update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
pre BR_CSL_02_PresenterLayout:
  (command.hasLayout and command.layout = LayoutMode::PRESENTER) implies
  ContentShare.allInstances()->exists(s | s.sessionId = command.sessionId and s.status = ShareStatus::ACTIVE)

BR-CSL-03 - Panel Values
context PreferenceService::update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
pre BR_CSL_03_PanelValues:
  command.hasSidePanel implies (command.sidePanel = null or command.sidePanel = 'CHAT' or command.sidePanel = 'PARTICIPANTS' or command.sidePanel = 'SETTINGS')

BR-CSL-04 - Layout Patch
context PreferenceService::update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
post BR_CSL_04_LayoutPatch:
  view.layout = if command.hasLayout then command.layout else view.layout@pre endif

BR-CSL-05 - Pi P Patch
context PreferenceService::update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
post BR_CSL_05_PiPPatch:
  view.pictureInPicture = if command.hasPictureInPicture then command.pictureInPicture else view.pictureInPicture@pre endif

BR-CSL-06 - Pi P Clears Panel
context PreferenceService::update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
post BR_CSL_06_PiPClearsPanel:
  view.pictureInPicture implies view.sidePanel = null

BR-CSL-07 - Panel Patch
context PreferenceService::update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
post BR_CSL_07_PanelPatch:
  not view.pictureInPicture implies
    view.sidePanel = if command.hasSidePanel then command.sidePanel else view.sidePanel@pre endif
~~~
