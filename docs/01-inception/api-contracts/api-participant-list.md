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

### query.cursor

Type: string; Required: No; Nullable: No
Trigger: When supplied in the request.
Description: URI-encoded opaque continuation token.
Example: cursor-reference
Note: Validation: Must be a JSON string.

### query.pageSize

Type: integer; Required: No; Nullable: No
Trigger: When supplied in the request.
Description: pageSize value.
Example: 50
Note: Validation: Must be a JSON integer. Default: 50

## Request Body

None.

## Success Response — HTTP 200

### data.items

Type: array (Participant); Required: Yes; Nullable: No
Trigger: Returned with the HTTP 200 success response.
Description: Collection of Participant representations.
Example: []

### data.nextCursor

Type: string; Required: Yes; Nullable: Yes
Trigger: Returned with the HTTP 200 success response.
Description: Opaque continuation token or null.
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
