---
artifact_type: api-contract
status: Frozen
api_id: API-BACKGROUND-LIST
related_uc_id: UC-13
---

# API-BACKGROUND-LIST: List Virtual Backgrounds

## General Information

### API ID

API-BACKGROUND-LIST

### API Name

List Virtual Backgrounds

### Related Use Case IDs

- UC-13

### Method

GET

### Path

/api/v1/virtual-backgrounds

### Description

Returns the virtual-background catalog.

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

None.

## Query Parameter(s)

None.

## Request Body

None.

## Success Response — HTTP 200

### data.items

Type: array (Background); Required: Yes; Nullable: No
Example: []

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
