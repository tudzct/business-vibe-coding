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

Type: string; Format: Bearer token; Required: Yes; Nullable: No
Trigger: Included in every request.
Description: Bearer session access token.
Example: Bearer \<session-access-token\>
Note: Not specified.

### headers.Content-Type

Type: string; Format: Media type; Required: Yes; Nullable: No
Trigger: Included in every request.
Description: HTTP media-type header.
Example: application/json
Note: Allowed values: application/json

### headers.Idempotency-Key

Type: string; Format: Not specified; Required: Yes; Nullable: No
Trigger: Included in every request.
Description: Opaque HTTP command token.
Example: command-22-01
Note: Not specified.

## Path Parameter(s)

### path.sessionId

Type: string; Required: Yes; Nullable: No
Trigger: Included in the request path.
Description: UUID identifier.
Example: 11111111-1111-4111-8111-111111111111

## Query Parameter(s)

None.

## Request Body

### displayName

Type: string; Required: Yes; Nullable: No
Trigger: When supplied in the request.
Description: displayName value.
Example: Alex Morgan
Note: Validation: Must be a JSON string.

### microphoneEnabled

Type: boolean; Required: Yes; Nullable: No
Trigger: When supplied in the request.
Description: microphoneEnabled value.
Example: false
Note: Validation: Must be a JSON boolean.

### cameraEnabled

Type: boolean; Required: Yes; Nullable: No
Trigger: When supplied in the request.
Description: cameraEnabled value.
Example: false
Note: Validation: Must be a JSON boolean.

### microphoneDeviceId

Type: string; Required: No; Nullable: Yes
Trigger: When supplied in the request.
Description: microphoneDeviceId value.
Example: device-reference
Note: Validation: Must be null or a JSON string.

### cameraDeviceId

Type: string; Required: No; Nullable: Yes
Trigger: When supplied in the request.
Description: cameraDeviceId value.
Example: device-reference
Note: Validation: Must be null or a JSON string.

### speakerDeviceId

Type: string; Required: No; Nullable: Yes
Trigger: When supplied in the request.
Description: speakerDeviceId value.
Example: device-reference
Note: Validation: Must be null or a JSON string.

### virtualBackgroundId

Type: string; Required: No; Nullable: Yes
Trigger: When supplied in the request.
Description: UUID identifier.
Example: 11111111-1111-4111-8111-111111111111
Note: Validation: Must be null or a JSON string.

## Success Response — HTTP 201

### data.participant

Type: object (Participant); Required: Yes; Nullable: No
Trigger: Returned with the HTTP 201 success response.
Description: Participant representation.
Example: Not specified.

### data.session

Type: object (SessionSummary); Required: Yes; Nullable: No
Trigger: Returned with the HTTP 201 success response.
Description: SessionSummary representation.
Example: Not specified.

### data.stream

Type: object (Stream); Required: Yes; Nullable: Yes
Trigger: Returned with the HTTP 201 success response.
Description: Stream representation.
Example: Not specified.

### data.media

Type: object (MediaPreference); Required: Yes; Nullable: No
Trigger: Returned with the HTTP 201 success response.
Description: MediaPreference representation.
Example: Not specified.

### data.view

Type: object (ViewPreference); Required: Yes; Nullable: No
Trigger: Returned with the HTTP 201 success response.
Description: ViewPreference representation.
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

## Error Response — HTTP 409

### message

Type: Not specified; Required: Not specified; Nullable: Not specified
Trigger: The operation conflicts with the current resource response.
Description: Error message returned with HTTP 409.
Example: The request could not be completed.
Note: The source contract does not specify the type, requiredness or nullability of this field.

## Error Response — HTTP 422

### message

Type: Not specified; Required: Not specified; Nullable: Not specified
Trigger: The submitted command is rejected.
Description: Error message returned with HTTP 422.
Example: The request could not be completed.
Note: The source contract does not specify the type, requiredness or nullability of this field.

## Error Response — HTTP 503

### message

Type: Not specified; Required: Not specified; Nullable: Not specified
Trigger: A required service is temporarily unavailable.
Description: Error message returned with HTTP 503.
Example: The request could not be completed.
Note: The source contract does not specify the type, requiredness or nullability of this field.
