---
artifact_type: api-contract
status: Frozen
api_id: API-CHAT-MESSAGE-LIST
related_uc_id: UC-09
---

# API-CHAT-MESSAGE-LIST: Read Session Chat

## General Information

### API ID

API-CHAT-MESSAGE-LIST

### API Name

Read Session Chat

### Related Use Case IDs

- UC-09

### Method

GET

### Path

/api/v1/sessions/{sessionId}/chat/messages

### Description

Returns a page of chat messages and a continuation token.

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

Type: array (Message); Required: Yes; Nullable: No
Example: []

### data.nextCursor

Type: string; Required: Yes; Nullable: No
Description: Opaque continuation token, including for an empty page.

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
