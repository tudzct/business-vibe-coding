---
artifact_type: api-contract
status: Frozen
api_id: API-LIVE-STREAM-CONTROL
related_uc_ids: ["UC-03", "UC-04"]
---

# API-LIVE-STREAM-CONTROL: Control a Live Stream

## General Information

### API ID

API-LIVE-STREAM-CONTROL

### API Name

Control a Live Stream

### Related Use Case IDs

- UC-03
- UC-04

### Method

POST

### Path

/api/v1/sessions/{sessionId}/live-stream/commands

### Description

Submits a stream command and returns its representation.

### Authentication

Bearer session access token, using the registered or guest form.

### Authorization

Required.

## Request Header(s)

### headers.Authorization

Type: string; Required: Yes; Nullable: No
Description: Bearer session access token.
Example: Bearer \<session-access-token\>

### headers.Content-Type

Type: string; Required: Yes; Nullable: No
Allowed values: application/json
Description: HTTP media-type header.
Example: application/json

### headers.Idempotency-Key

Type: string; Required: Yes; Nullable: No
Description: Opaque HTTP command token.
Example: command-22-01

## Path Parameter(s)

### sessionId

Type: string; Required: Yes; Nullable: No
Description: UUID identifier.
Example: 11111111-1111-4111-8111-111111111111

## Query Parameter(s)

None.

## Request Body

### action

Type: string; Required: Yes; Nullable: No
Allowed values: START, STOP
Validation: Must be a JSON string. String values must belong to the declared enum.
Description: action value.
Example: START

### expectedVersion

Type: integer; Required: Yes; Nullable: No
Validation: Must be a JSON integer.
Description: expectedVersion value.
Example: 1

## Success Response — HTTP 200

### data.stream

Type: object (Stream); Required: Yes; Nullable: No

### data.session

Type: object (SessionSummary); Required: Yes; Nullable: No

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

## Error Response — HTTP 409

### message

Trigger: The operation conflicts with the current resource response.
- Example message: The request could not be completed.

## Error Response — HTTP 422

### message

Trigger: The submitted command is rejected.
- Example message: The request could not be completed.

## Error Response — HTTP 503

### message

Trigger: A required service is temporarily unavailable.
- Example message: The request could not be completed.

## Notes

Subsequent representations are available from the session-state endpoint. Media delivery is outside this JSON endpoint.
