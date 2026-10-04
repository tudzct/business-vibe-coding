---
artifact_type: api-contract
status: Frozen
api_id: API-SESSION-STATE
related_uc_ids: ["UC-02", "UC-03", "UC-04", "UC-05", "UC-06", "UC-07", "UC-08", "UC-10", "UC-11", "UC-12", "UC-13", "UC-14", "UC-15", "UC-16", "UC-17", "UC-18"]
---

# API-SESSION-STATE: Read Session State

## General Information

### API ID

API-SESSION-STATE

### API Name

Read Session State

### Related Use Case IDs

- UC-02
- UC-03
- UC-04
- UC-05
- UC-06
- UC-07
- UC-08
- UC-10
- UC-11
- UC-12
- UC-13
- UC-14
- UC-15
- UC-16
- UC-17
- UC-18

### Method

GET

### Path

/api/v1/sessions/{sessionId}/state

### Description

Returns the current session and caller representations, stage requests, and a page of reaction events.

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

### reactionCursor

Type: string; Required: No; Nullable: No
Validation: Must be a JSON string.
Description: URI-encoded opaque reaction continuation token.

## Request Body

None.

## Success Response — HTTP 200

### data.session

Type: object (SessionSummary); Required: Yes; Nullable: No

### data.selfParticipant

Type: object (Participant); Required: Yes; Nullable: No

### data.stream

Type: object (Stream); Required: Yes; Nullable: Yes

### data.recording

Type: object (Recording); Required: Yes; Nullable: Yes

### data.share

Type: object (Share); Required: Yes; Nullable: Yes

### data.media

Type: object (MediaPreference); Required: Yes; Nullable: No

### data.view

Type: object (ViewPreference); Required: Yes; Nullable: No

### data.stageRequests

Type: array (StageRequest); Required: Yes; Nullable: No
Example: []

### data.reactions

Type: array (Reaction); Required: Yes; Nullable: No
Example: []

### data.nextReactionCursor

Type: string; Required: Yes; Nullable: No
Description: Opaque continuation token, including for an empty event page.

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

The client can repeat this request to refresh its representation. Chat and participant collections have separate list endpoints.
