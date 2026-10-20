---
artifact_type: business-rule-specification
status: Frozen
uc_id: UC-05
uc_name: "Watch a Live Stream"
---

# UC-05: Watch a Live Stream

## Business Rules

### OCL Utility Definitions

None.

### Rule Definitions

~~~text
BR-WLS-01 - Authenticated Membership
context LiveStreamService::view(sessionId: String, participantId: String, session: Session, stream: LiveStream): ViewerSession
pre BR_WLS_01_AuthenticatedMembership:
  RequestContext::authenticated and RequestContext::sessionId = sessionId and
  participantId = RequestContext::participantId and
  Participant.allInstances()->exists(p | p.id = participantId and
    p.principalId = RequestContext::principalId and p.sessionId = sessionId and
    p.status = ParticipantStatus::JOINED)

BR-WLS-02 - Viewer Target
context LiveStreamService::view(sessionId: String, participantId: String, session: Session, stream: LiveStream): ViewerSession
pre BR_WLS_02_ViewerTarget:
  session.id = sessionId and stream.sessionId = sessionId and session.kind = SessionKind::LIVE_STREAM and
  session.status <> SessionStatus::ENDED and Participant.allInstances()->exists(p | p.id = participantId and
    (p.role = ParticipantRole::VIEWER or p.role = ParticipantRole::STAGE_PARTICIPANT))

BR-WLS-03 - Viewer Representation
context LiveStreamService::view(sessionId: String, participantId: String, session: Session, stream: LiveStream): ViewerSession
post BR_WLS_03_ViewerRepresentation:
  result.sessionId = session.id and result.participantId = participantId and
  result.role = Participant.allInstances()->any(p | p.id = participantId).role

BR-WLS-04 - Stream Snapshot
context LiveStreamService::view(sessionId: String, participantId: String, session: Session, stream: LiveStream): ViewerSession
post BR_WLS_04_StreamSnapshot:
  result.streamStatus = stream.status and result.streamVersion = stream.version and result.sessionVersion = session.version

BR-WLS-05 - Playback Availability
context LiveStreamService::view(sessionId: String, participantId: String, session: Session, stream: LiveStream): ViewerSession
post BR_WLS_05_PlaybackAvailability:
  result.canPlayMedia = (stream.status = StreamStatus::LIVE)

BR-WLS-06 - Publishing Availability
context LiveStreamService::view(sessionId: String, participantId: String, session: Session, stream: LiveStream): ViewerSession
post BR_WLS_06_PublishingAvailability:
  result.canPublishMedia = (stream.status = StreamStatus::LIVE and result.role = ParticipantRole::STAGE_PARTICIPANT)

BR-WLS-07 - Muted Playback Start
context LiveStreamService::view(sessionId: String, participantId: String, session: Session, stream: LiveStream): ViewerSession
post BR_WLS_07_MutedPlaybackStart:
  result.initialAudioMuted
~~~
