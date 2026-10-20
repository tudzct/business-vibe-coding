---
artifact_type: business-rule-specification
status: Frozen
uc_id: UC-08
uc_name: "View Session Participants"
---

# UC-08: View Session Participants

## Business Rules

### OCL Utility Definitions

```text
Paging::latestRecording(sessionId: String): Recording
- Returns the record with the latest (createdAt, id) key, including terminal records, or null if none exists.

Paging::validCursor(sessionId: String, cursor: String, collection: String): Boolean
- Validates cursor decoding, signature, collection, and session binding.
- An absent cursor starts before the first row.

Paging::participants(sessionId: String, pageSize: Integer, cursor: String): ParticipantPage
- Returns a live keyset page ordered by immutable (joinedAt, id) ascending.
- The cursor encodes session, collection, and last key; nextCursor is null when the scan is exhausted.

Paging::reactions(sessionId: String, cursor: String): Sequence(ReactionEvent)
- Returns the next reaction-event page in ascending sequence.

Paging::nextReactionCursor(sessionId: String, cursor: String): String
- Returns the cursor for the next reaction read, retaining a high-water mark even when a page is empty.
```

### Rule Definitions

~~~text
BR-VSP-01 - Authenticated Membership
context CollaborationService::listParticipants(query: ParticipantListQuery, session: Session): ParticipantPage
pre BR_VSP_01_AuthenticatedMembership:
  RequestContext::authenticated and RequestContext::sessionId = query.sessionId and
  query.requesterParticipantId = RequestContext::participantId and
  Participant.allInstances()->exists(p | p.id = query.requesterParticipantId and
    p.principalId = RequestContext::principalId and p.sessionId = query.sessionId and
    p.status = ParticipantStatus::JOINED)

BR-VSP-02 - Page Input
context CollaborationService::listParticipants(query: ParticipantListQuery, session: Session): ParticipantPage
pre BR_VSP_02_PageInput:
  query.sessionId = session.id and session.status <> SessionStatus::ENDED and
  query.pageSize > 0 and query.pageSize <= 50 and Paging::validCursor(session.id, query.cursor, 'participants')

BR-VSP-03 - Participant Page
context CollaborationService::listParticipants(query: ParticipantListQuery, session: Session): ParticipantPage
post BR_VSP_03_ParticipantPage:
  result = Paging::participants(session.id, query.pageSize, query.cursor) and result.items->size() <= query.pageSize and
  result.items->forAll(p | p.sessionId = session.id and p.status = ParticipantStatus::JOINED)

BR-VSP-04 - State Reader
context SessionService::readState(session: Session, participant: Participant, reactionCursor: String): SessionState
pre BR_VSP_04_StateReader:
  RequestContext::authenticated and RequestContext::sessionId = session.id and
  participant.id = RequestContext::participantId and participant.principalId = RequestContext::principalId and participant.sessionId = session.id and
  (participant.status = ParticipantStatus::JOINED or session.status = SessionStatus::ENDED) and
  Paging::validCursor(session.id, reactionCursor, 'reactions')

BR-VSP-05 - State Snapshot
context SessionService::readState(session: Session, participant: Participant, reactionCursor: String): SessionState
post BR_VSP_05_StateSnapshot:
  result.session = session and result.selfParticipant = participant and
  result.stream = if LiveStream.allInstances()->exists(s | s.sessionId = session.id) then LiveStream.allInstances()->any(s | s.sessionId = session.id) else null endif and
  result.recording = Paging::latestRecording(session.id) and
  result.share = if ContentShare.allInstances()->exists(s | s.sessionId = session.id and s.status = ShareStatus::ACTIVE) then ContentShare.allInstances()->any(s | s.sessionId = session.id and s.status = ShareStatus::ACTIVE) else null endif and
  result.media = MediaPreference.allInstances()->any(m | m.participantId = participant.id) and
  result.view = ViewPreference.allInstances()->any(v | v.participantId = participant.id)

BR-VSP-06 - State Audience
context SessionService::readState(session: Session, participant: Participant, reactionCursor: String): SessionState
post BR_VSP_06_StateAudience:
  result.stageRequests = StageRequest.allInstances()->select(r | r.sessionId = session.id and
    (participant.role = ParticipantRole::HOST or r.participantId = participant.id)) and
  result.reactions = Paging::reactions(session.id, reactionCursor) and result.reactions->size() <= 50 and
  result.nextReactionCursor = Paging::nextReactionCursor(session.id, reactionCursor)

BR-VSP-07 - Unique Roster Entries
context CollaborationService::listParticipants(query: ParticipantListQuery, session: Session): ParticipantPage
post BR_VSP_07_UniqueRosterEntries:
  result.items->isUnique(id)
~~~
