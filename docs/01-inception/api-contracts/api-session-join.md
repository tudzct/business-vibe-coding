---
artifact_type: api-contract
status: Frozen
api_id: API-SESSION-JOIN
related_uc_ids: ["UC-02", "UC-12", "UC-13"]
---

# API-SESSION-JOIN: Join a Session

## General Information

### API ID

API-SESSION-JOIN

### API Name

Join a Session

### Related Use Case IDs

- UC-02
- UC-12
- UC-13

### Method

POST

### Path

/api/v1/sessions/{sessionId}/participants

### Description

Submits preview identity, media selections, and draft preferences.

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

### displayName

Type: string; Required: Yes; Nullable: No
Validation: Must be a JSON string.
Description: displayName value.
Example: Alex Morgan

### microphoneEnabled

Type: boolean; Required: Yes; Nullable: No
Validation: Must be a JSON boolean.
Description: microphoneEnabled value.
Example: false

### cameraEnabled

Type: boolean; Required: Yes; Nullable: No
Validation: Must be a JSON boolean.
Description: cameraEnabled value.
Example: false

### microphoneDeviceId

Type: string; Required: No; Nullable: Yes
Validation: Must be null or a JSON string.
Description: microphoneDeviceId value.
Example: device-reference

### cameraDeviceId

Type: string; Required: No; Nullable: Yes
Validation: Must be null or a JSON string.
Description: cameraDeviceId value.
Example: device-reference

### speakerDeviceId

Type: string; Required: No; Nullable: Yes
Validation: Must be null or a JSON string.
Description: speakerDeviceId value.
Example: device-reference

### virtualBackgroundId

Type: string; Required: No; Nullable: Yes
Validation: Must be null or a JSON string.
Description: UUID identifier.
Example: 11111111-1111-4111-8111-111111111111

## Success Response — HTTP 201

### data.participant

Type: object (Participant); Required: Yes; Nullable: No

### data.session

Type: object (SessionSummary); Required: Yes; Nullable: No

### data.stream

Type: object (Stream); Required: Yes; Nullable: Yes

### data.media

Type: object (MediaPreference); Required: Yes; Nullable: No

### data.view

Type: object (ViewPreference); Required: Yes; Nullable: No

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
