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

Type: string; Format: Bearer token; Required: Yes; Nullable: No
Trigger: Included in every request.
Description: Bearer session access token.
Example: Bearer \<session-access-token\>
Note: Not specified.

### headers.Accept

Type: string; Format: Media type; Required: Yes; Nullable: No
Trigger: Included in every request.
Description: HTTP media-type header.
Example: application/json
Note: Allowed values: application/json

## Path Parameter(s)

### path.sessionId

Type: string; Required: Yes; Nullable: No
Trigger: Included in the request path.
Description: UUID identifier.
Example: 11111111-1111-4111-8111-111111111111

## Query Parameter(s)

### query.reactionCursor

Type: string; Required: No; Nullable: No
Trigger: When supplied in the request.
Description: URI-encoded opaque reaction continuation token.
Example: Not specified.
Note: Validation: Must be a JSON string.

## Request Body

None.

## Success Response — HTTP 200

### data.session

Type: object (SessionSummary); Required: Yes; Nullable: No
Trigger: Returned with the HTTP 200 success response.
Description: SessionSummary representation.
Example: Not specified.

### data.selfParticipant

Type: object (Participant); Required: Yes; Nullable: No
Trigger: Returned with the HTTP 200 success response.
Description: Participant representation.
Example: Not specified.

### data.stream

Type: object (Stream); Required: Yes; Nullable: Yes
Trigger: Returned with the HTTP 200 success response.
Description: Stream representation.
Example: Not specified.

### data.recording

Type: object (Recording); Required: Yes; Nullable: Yes
Trigger: Returned with the HTTP 200 success response.
Description: Recording representation.
Example: Not specified.

### data.share

Type: object (Share); Required: Yes; Nullable: Yes
Trigger: Returned with the HTTP 200 success response.
Description: Share representation.
Example: Not specified.

### data.media

Type: object (MediaPreference); Required: Yes; Nullable: No
Trigger: Returned with the HTTP 200 success response.
Description: MediaPreference representation.
Example: Not specified.

### data.view

Type: object (ViewPreference); Required: Yes; Nullable: No
Trigger: Returned with the HTTP 200 success response.
Description: ViewPreference representation.
Example: Not specified.

### data.stageRequests

Type: array (StageRequest); Required: Yes; Nullable: No
Trigger: Returned with the HTTP 200 success response.
Description: Collection of StageRequest representations.
Example: []

### data.reactions

Type: array (Reaction); Required: Yes; Nullable: No
Trigger: Returned with the HTTP 200 success response.
Description: Collection of Reaction representations.
Example: []

### data.nextReactionCursor

Type: string; Required: Yes; Nullable: No
Trigger: Returned with the HTTP 200 success response.
Description: Opaque continuation token, including for an empty event page.
Example: Not specified.

## Error Response — HTTP 400

### message

Type: Not specified; Required: Not specified; Nullable: Not specified
Trigger: The request cannot be decoded or does not match the declared wire schema.
Description: Error message returned with HTTP 400.
Example: The request could not be completed.
Note: The source contract does not specify the type, requiredness or nullability of this field.

## Error Response — HTTP 401

### message

Type: Not specified; Required: Not specified; Nullable: Not specified
Trigger: The authentication context is rejected.
Description: Error message returned with HTTP 401.
Example: The request could not be completed.
Note: The source contract does not specify the type, requiredness or nullability of this field.

## Error Response — HTTP 403

### message

Type: Not specified; Required: Not specified; Nullable: Not specified
Trigger: The operation is rejected for the supplied access context.
Description: Error message returned with HTTP 403.
Example: The request could not be completed.
Note: The source contract does not specify the type, requiredness or nullability of this field.

## Error Response — HTTP 404

### message

Type: Not specified; Required: Not specified; Nullable: Not specified
Trigger: The requested resource is unavailable.
Description: Error message returned with HTTP 404.
Example: The request could not be completed.
Note: The source contract does not specify the type, requiredness or nullability of this field.

## Error Response — HTTP 503

### message

Type: Not specified; Required: Not specified; Nullable: Not specified
Trigger: A required service is temporarily unavailable.
Description: Error message returned with HTTP 503.
Example: The request could not be completed.
Note: The source contract does not specify the type, requiredness or nullability of this field.

## Notes

The client can repeat this request to refresh its representation. Chat and participant collections have separate list endpoints.
