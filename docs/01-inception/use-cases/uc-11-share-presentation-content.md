---
artifact_type: use-case-specification
status: Frozen
uc_id: UC-11
uc_name: "Share Presentation Content"
---

# UC-11: Share Presentation Content

## Functional Use-Case Specification

### Use Case ID

UC-11

### Use Case Name

Share Presentation Content

### Description

As a participant, I want to share my screen or a PDF so that other participants can see presentation content.

### Actor(s)

Participant; Content Share Service.

### Priority

High

### Trigger

The participant chooses the visible screen-share or PDF-share action.

### Pre-Condition(s)

PRE-1: The participant is viewing the session controls.

### Post-Condition(s)

POST-1: The client displays the returned content-share representation.

### Basic Flow

Flow ID: BF-1

BF-1.1: The participant opens the share action.
BF-1.2: The client presents the screen and PDF choices shown by the design.
BF-1.3: The participant selects a source and confirms sharing.
BF-1.4: The client submits the content-share request.
BF-1.5: The system returns the content-share representation.
BF-1.6: The client renders the shared content and presenter view.

### Alternative Flow

AF-1: Share PDF content

3a : The participant chooses PDF instead of screen content.
3b : The client presents the selected PDF in the share layout.

AF-2: Stop the active share

6a : The participant chooses to stop the active share.
6b : The client submits the stop action and restores the returned session layout.

### Exception Flow

EF-1: Content sharing fails

5a : The system cannot complete the share action.
5b : The client displays the returned failure state and retains the session view.

### Related UI

- Live Streaming Desktop Features 6007:86770.
- Video Conferencing Desktop Features 6007:55138.
- Video Conferencing Desktop Layouts 6007:77656.
- Video Conferencing Mobile Features 6012:52233.

### Related API IDs

API-CONTENT-SHARE-CONTROL.
API-SESSION-STATE.

### Notes

The shared model defines trusted context, persistence mapping, and query helpers. Server mutation execution uses MutationGateway. API command dispatch selects the named operation. Read operations have no domain writes.

## UML Model

~~~plantuml
@startuml
hide empty members
enum SessionKind {
  LIVE_STREAM
  VIDEO_CONFERENCE
}
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
enum ShareKind {
  SCREEN
  PDF
}
enum ShareStatus {
  ACTIVE
  STOPPED
}
enum ShareAction {
  START
  STOP
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
  kind: SessionKind
  status: SessionStatus
}
class Participant {
  id: String
  sessionId: String
  principalId: String
  role: ParticipantRole
  status: ParticipantStatus
}
class ContentShare {
  sessionId: String
  ownerParticipantId: String
  kind: ShareKind
  status: ShareStatus
  sourceReference: String
  version: Integer
  startedAt: DateTime
  stoppedAt: DateTime
}
class ContentShareCommand {
  sessionId: String
  ownerParticipantId: String
  action: ShareAction
  kind: ShareKind
  sourceReference: String
  expectedVersion: Integer
  idempotencyKey: String
}
class ContentShareService {
  control(command: ContentShareCommand, session: Session): ContentShare
}
note right of RequestContext
Request-local trusted adapter data; not a process-global singleton.
Principal and session are decoded from the authenticated session access token.
participantId resolves the principal's membership.
end note
@enduml
~~~
