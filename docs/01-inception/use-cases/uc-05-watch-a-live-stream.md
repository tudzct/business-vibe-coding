---
artifact_type: use-case-specification
status: Frozen
uc_id: UC-05
uc_name: "Watch a Live Stream"
---

# UC-05: Watch a Live Stream

## Functional Use-Case Specification

### Use Case ID

UC-05

### Use Case Name

Watch a Live Stream

### Description

As a viewer, I want to open the live session so that I can watch the broadcast and access viewer controls.

### Actor(s)

Viewer; Live Stream Service.

### Priority

High

### Trigger

The viewer opens the live-session interface.

### Pre-Condition(s)

PRE-1: The client has a live-session destination to display.

### Post-Condition(s)

POST-1: The client displays the live-session experience using the returned session and stream snapshot.

### Basic Flow

Flow ID: BF-1

BF-1.1: The viewer opens the live session.
BF-1.2: The client requests the current session representation.
BF-1.3: The system returns the viewer-facing stream state.
BF-1.4: The client renders the live-session experience.

### Alternative Flow

AF-1: Open the viewer session menu

4a : The viewer opens the session menu.
4b : The client displays the viewer actions shown by the design.

### Exception Flow

EF-1: Live-session representation unavailable

3a : The live-session representation cannot be returned.
3b : The client displays the visible loading or unavailable state.

### Related UI

- Live Streaming Viewer 6007:51397.
- Live Streaming Mobile Preview 6012:44409.

### Related API IDs

API-LIVE-STREAM-VIEW.
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
enum StreamStatus {
  READY
  STARTING
  LIVE
  ENDED
}
class String <<datatype>> {
}
note right of String: Identifier value type.
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
  version: Integer
}
class Participant {
  id: String
  sessionId: String
  principalId: String
  role: ParticipantRole
  status: ParticipantStatus
}
class LiveStream {
  sessionId: String
  status: StreamStatus
  version: Integer
}
class ViewerSession {
  sessionId: String
  participantId: String
  role: ParticipantRole
  streamStatus: StreamStatus
  streamVersion: Integer
  sessionVersion: Integer
}
class LiveStreamService {
  view(sessionId: String, participantId: String, session: Session, stream: LiveStream): ViewerSession
}
note right of RequestContext
Request-local trusted adapter data; not a process-global singleton.
Principal and session are decoded from the authenticated session access token.
participantId resolves the principal's membership.
end note
@enduml
~~~
