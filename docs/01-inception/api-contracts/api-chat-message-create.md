---
artifact_type: api-contract
status: Frozen
api_id: API-CHAT-MESSAGE-CREATE
related_uc_id: UC-09
---

# API-CHAT-MESSAGE-CREATE: Send a Chat Message

## General Information

### API ID

API-CHAT-MESSAGE-CREATE

### API Name

Send a Chat Message

### Related Use Case IDs

- UC-09

### Method

POST

### Path

/api/v1/sessions/{sessionId}/chat/messages

### Description

Returns the created message representation.

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

### body

Type: string; Required: Yes; Nullable: No
Validation: Must be a JSON string.
Description: body value.
Example: Hello everyone!

## Success Response — HTTP 201

### data.message

Type: object (Message); Required: Yes; Nullable: No

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
