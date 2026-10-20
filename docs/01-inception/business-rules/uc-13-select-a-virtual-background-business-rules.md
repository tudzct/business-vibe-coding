---
artifact_type: business-rule-specification
status: Frozen
uc_id: UC-13
uc_name: "Select a Virtual Background"
---

# UC-13: Select a Virtual Background

## Business Rules

### OCL Utility Definitions

```text
String.trim(): String
- Removes leading and trailing whitespace; internal whitespace is unchanged.
```

### Rule Definitions

~~~text
BR-SVB-01 - Available Background
context PreferenceService::update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
pre BR_SVB_01_AvailableBackground:
  command.hasVirtualBackgroundId implies (command.virtualBackgroundId = null or
    VirtualBackground.allInstances()->exists(b | b.id = command.virtualBackgroundId and b.active))

BR-SVB-02 - Background Patch
context PreferenceService::update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
post BR_SVB_02_BackgroundPatch:
  media.virtualBackgroundId = if command.hasVirtualBackgroundId then command.virtualBackgroundId else media.virtualBackgroundId@pre endif

BR-SVB-03 - Local Background
context ClientPreferenceService::selectBackground(draft: PreviewDraft, backgroundId: String): PreviewDraft
pre BR_SVB_03_LocalBackground:
  backgroundId = null or VirtualBackground.allInstances()->exists(b | b.id = backgroundId and b.active)

BR-SVB-04 - Local Background Draft
context ClientPreferenceService::selectBackground(draft: PreviewDraft, backgroundId: String): PreviewDraft
post BR_SVB_04_LocalBackgroundDraft:
  result = draft and draft.virtualBackgroundId = backgroundId and
  draft.microphoneDeviceId = draft.microphoneDeviceId@pre and draft.cameraDeviceId = draft.cameraDeviceId@pre and draft.speakerDeviceId = draft.speakerDeviceId@pre

BR-SVB-05 - Catalog Reader
context PreferenceService::listBackgrounds(): Set(VirtualBackground)
pre BR_SVB_05_CatalogReader:
  RequestContext::authenticated

BR-SVB-06 - Catalog Result
context PreferenceService::listBackgrounds(): Set(VirtualBackground)
post BR_SVB_06_CatalogResult:
  result = VirtualBackground.allInstances()->select(b | b.active)

BR-SVB-07 - Catalog Identity
context PreferenceService::listBackgrounds(): Set(VirtualBackground)
post BR_SVB_07_CatalogIdentity:
  result->isUnique(id) and result->forAll(b | b.assetReference <> null and b.assetReference.trim().size() > 0)
~~~
