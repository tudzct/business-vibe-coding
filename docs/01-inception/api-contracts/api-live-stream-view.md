---
artifact_type: api-contract
status: Frozen
api_id: API-LIVE-STREAM-VIEW
related_uc_id: UC-05
---

# API-LIVE-STREAM-VIEW: View a Live Stream

## General Information

### API ID

API-LIVE-STREAM-VIEW

### API Name

View a Live Stream

### Related Use Case IDs

- UC-05

### Method

GET

### Path

/api/v1/sessions/{sessionId}/live-stream/view

### Description

Returns the viewer-facing stream representation.

### Authentication

Bearer session access token, using the registered or guest form.

### Authorization

Required.

## Request Header(s)

### headers.Authorization

Type: string; Required: Yes; Nullable: No
Description: Bearer session access token.
Example: Bearer \<session-access-token\>

### headers.Accept

Type: string; Required: Yes; Nullable: No
Allowed values: application/json
Description: HTTP media-type header.
Example: application/json

## Path Parameter(s)

### sessionId

Type: string; Required: Yes; Nullable: No
Description: UUID identifier.
Example: 11111111-1111-4111-8111-111111111111

## Query Parameter(s)

None.

## Request Body

None.

## Success Response — HTTP 200

### data.sessionId

Type: string; Required: Yes; Nullable: No
Description: UUID identifier.
Example: 11111111-1111-4111-8111-111111111111

### data.participantId

Type: string; Required: Yes; Nullable: No
Description: UUID identifier.
Example: 11111111-1111-4111-8111-111111111111

### data.viewerRole

Type: string; Required: Yes; Nullable: No
Allowed values: VIEWER, STAGE_PARTICIPANT
Description: viewerRole value.
Example: VIEWER

### data.streamStatus

Type: string; Required: Yes; Nullable: No
Allowed values: READY, STARTING, LIVE, ENDED
Description: streamStatus value.
Example: READY

### data.streamVersion

Type: integer; Required: Yes; Nullable: No
Description: streamVersion value.
Example: 1

### data.sessionVersion

Type: integer; Required: Yes; Nullable: No
Description: sessionVersion value.
Example: 1

### data.canPlayMedia

Type: boolean; Required: Yes; Nullable: No
Description: canPlayMedia value.
Example: false

### data.canPublishMedia

Type: boolean; Required: Yes; Nullable: No
Description: canPublishMedia value.
Example: false

### data.initialAudioMuted

Type: boolean; Required: Yes; Nullable: No
Description: initialAudioMuted value.
Example: false

## Error Response — HTTP 400

### message

Trigger: The request cannot be decoded or does not match the declared wire schema.
- Example message: The request could not be completed.

## Error Response — HTTP 401

### message

Trigger: The authentication context is rejected.
- Example message: The request could not be completed.

## Error Response — HTTP 403

### message

Trigger: The operation is rejected for the supplied access context.
- Example message: The request could not be completed.

## Error Response — HTTP 404

### message

Trigger: The requested resource is unavailable.
- Example message: The request could not be completed.

## Error Response — HTTP 503

### message

Trigger: A required service is temporarily unavailable.
- Example message: The request could not be completed.

## Notes

Media playback is delivered through the media adapter.
