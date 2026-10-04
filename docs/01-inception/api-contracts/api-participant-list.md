---
artifact_type: api-contract
status: Frozen
api_id: API-PARTICIPANT-LIST
related_uc_ids: ["UC-08", "UC-15"]
---

# API-PARTICIPANT-LIST: List Session Participants

## General Information

### API ID

API-PARTICIPANT-LIST

### API Name

List Session Participants

### Related Use Case IDs

- UC-08
- UC-15

### Method

GET

### Path

/api/v1/sessions/{sessionId}/participants

### Description

Returns a page of participant representations.

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

### cursor

Type: string; Required: No; Nullable: No
Validation: Must be a JSON string.
Description: URI-encoded opaque continuation token.
Example: cursor-reference

### pageSize

Type: integer; Required: No; Nullable: No
Default: 50
Validation: Must be a JSON integer.
Description: pageSize value.
Example: 50

## Request Body

None.

## Success Response — HTTP 200

### data.items

Type: array (Participant); Required: Yes; Nullable: No
Example: []

### data.nextCursor

Type: string; Required: Yes; Nullable: Yes
Description: Opaque continuation token or null.

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
