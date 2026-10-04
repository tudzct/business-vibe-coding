---
artifact_type: api-contract
status: Frozen
api_id: API-REACTION-CREATE
related_uc_id: UC-10
---

# API-REACTION-CREATE: Send a Reaction

## General Information

### API ID

API-REACTION-CREATE

### API Name

Send a Reaction

### Related Use Case IDs

- UC-10

### Method

POST

### Path

/api/v1/sessions/{sessionId}/reactions

### Description

Returns the created reaction event.

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

### reaction

Type: string; Required: Yes; Nullable: No
Allowed values: LIKE, CLAP, HEART, CELEBRATE, HAND, SURPRISE
Validation: Must be a JSON string. String values must belong to the declared enum.
Description: reaction value.
Example: LIKE

## Success Response — HTTP 201

### data.reaction

Type: object (Reaction); Required: Yes; Nullable: No

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

Client display mapping: LIKE = thumbs up; CLAP = applause; HEART = heart; CELEBRATE = celebration; HAND = raised hand; SURPRISE = surprise.
