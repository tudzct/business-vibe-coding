---
artifact_type: business-rule-specification
status: Frozen
uc_id: UC-12
uc_name: "Configure Audio and Video Devices"
---

# UC-12: Configure Audio and Video Devices

## Business Rules

### OCL Utility Definitions

```text
String.trim(): String
- Removes leading and trailing whitespace; internal whitespace is unchanged.

DeviceCatalog::isAvailable(participantId: String, deviceId: String): Boolean
- Reports whether the named client device is available to the participant.
- This is a client device-discovery check, not a persisted server-device guarantee.
```

### Rule Definitions

~~~text
BR-CAVD-01 - Authenticated Membership
context PreferenceService::update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
pre BR_CAVD_01_AuthenticatedMembership:
  RequestContext::authenticated and RequestContext::sessionId = command.sessionId and
  command.participantId = RequestContext::participantId and
  Participant.allInstances()->exists(p | p.id = command.participantId and
    p.principalId = RequestContext::principalId and p.sessionId = command.sessionId and
    p.status = ParticipantStatus::JOINED)

BR-CAVD-02 - Command Key
context PreferenceService::update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
pre BR_CAVD_02_CommandKey:
  command.idempotencyKey <> null and command.idempotencyKey.trim().size() > 0

BR-CAVD-03 - Preference Target
context PreferenceService::update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
pre BR_CAVD_03_PreferenceTarget:
  media.participantId = command.participantId and view.participantId = command.participantId and
  Session.allInstances()->exists(s | s.id = command.sessionId and s.status <> SessionStatus::ENDED)

BR-CAVD-04 - Preference Identity
context PreferenceService::update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
post BR_CAVD_04_PreferenceIdentity:
  result.media = media and result.view = view and media.updatedAt <> null and view.updatedAt <> null

BR-CAVD-05 - microphone Device Id Syntax
context PreferenceService::update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
pre BR_CAVD_05_microphoneDeviceIdSyntax:
  command.hasMicrophoneDeviceId implies (command.microphoneDeviceId = null or command.microphoneDeviceId.trim().size() > 0)

BR-CAVD-06 - microphone Device Id Patch
context PreferenceService::update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
post BR_CAVD_06_microphoneDeviceIdPatch:
  media.microphoneDeviceId = if command.hasMicrophoneDeviceId then command.microphoneDeviceId else media.microphoneDeviceId@pre endif

BR-CAVD-07 - camera Device Id Syntax
context PreferenceService::update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
pre BR_CAVD_07_cameraDeviceIdSyntax:
  command.hasCameraDeviceId implies (command.cameraDeviceId = null or command.cameraDeviceId.trim().size() > 0)

BR-CAVD-08 - camera Device Id Patch
context PreferenceService::update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
post BR_CAVD_08_cameraDeviceIdPatch:
  media.cameraDeviceId = if command.hasCameraDeviceId then command.cameraDeviceId else media.cameraDeviceId@pre endif

BR-CAVD-09 - speaker Device Id Syntax
context PreferenceService::update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
pre BR_CAVD_09_speakerDeviceIdSyntax:
  command.hasSpeakerDeviceId implies (command.speakerDeviceId = null or command.speakerDeviceId.trim().size() > 0)

BR-CAVD-10 - speaker Device Id Patch
context PreferenceService::update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
post BR_CAVD_10_speakerDeviceIdPatch:
  media.speakerDeviceId = if command.hasSpeakerDeviceId then command.speakerDeviceId else media.speakerDeviceId@pre endif

BR-CAVD-11 - Other Media Unchanged
context PreferenceService::update(command: PreferencePatch, media: MediaPreference, view: ViewPreference): PreferencesResult
post BR_CAVD_11_OtherMediaUnchanged:
  MediaPreference.allInstances() = MediaPreference.allInstances()@pre and
  MediaPreference.allInstances()@pre->select(m | m.participantId <> command.participantId)->forAll(m |
    m.microphoneDeviceId = m.microphoneDeviceId@pre and m.cameraDeviceId = m.cameraDeviceId@pre and
    m.speakerDeviceId = m.speakerDeviceId@pre and m.virtualBackgroundId = m.virtualBackgroundId@pre and m.updatedAt = m.updatedAt@pre)

BR-CAVD-12 - Local Device Availability
context ClientPreferenceService::selectDevices(draft: PreviewDraft, microphone: String, camera: String, speaker: String): PreviewDraft
pre BR_CAVD_12_LocalDeviceAvailability:
  (microphone = null or DeviceCatalog::isAvailable(draft.participantKey, microphone)) and
  (camera = null or DeviceCatalog::isAvailable(draft.participantKey, camera)) and
  (speaker = null or DeviceCatalog::isAvailable(draft.participantKey, speaker))

BR-CAVD-13 - Local Device Draft
context ClientPreferenceService::selectDevices(draft: PreviewDraft, microphone: String, camera: String, speaker: String): PreviewDraft
post BR_CAVD_13_LocalDeviceDraft:
  result = draft and draft.microphoneDeviceId = microphone and draft.cameraDeviceId = camera and
  draft.speakerDeviceId = speaker and draft.virtualBackgroundId = draft.virtualBackgroundId@pre
~~~
