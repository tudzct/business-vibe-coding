---
artifact_type: api-contract
status: Frozen
api_id: API-AUTH-REGISTER
related_uc_id: UC-01
---

# API-AUTH-REGISTER: User Registration

## General Information

### API ID

API-AUTH-REGISTER

### API Name

User Registration

### Related Use Case IDs

UC-01

### Method

POST

### Path

/api/auth/register

### Description

Create a new user account and issue a JWT token.

### Authentication

Public

### Authorization

None

## Business Rules / Validation Constraints

- BR-REG-01 - Valid registration full name: `fullName` shall not be null, undefined, empty, or whitespace-only; it shall be normalized using Unicode NFC and `trim()`, contain between 4 and 25 characters, and contain only Unicode letters separated by single spaces.
- BR-REG-02 - Valid registration email: `email` shall be non-empty, trimmed, no longer than 255 characters, and satisfy `class-validator` `IsEmail`; it shall be converted to lowercase before storage and comparison.
- BR-REG-03 - Unique registration email: A registration email shall not already identify a stored User, regardless of letter case; uniqueness shall be enforced at both the service and database layers.
- BR-REG-04 - Valid registration password: `password` shall be between 8 and 64 characters, contain no whitespace, and include at least one lowercase letter, one uppercase letter, one digit, and one permitted special character.
- BR-REG-05 - Permitted password characters: A registration password shall contain only Latin letters, digits, and the permitted special characters `! @ # $ % ^ & * ( ) { } - _ + = [ ] , . / < > ? \\ | : ;`.
- BR-REG-06 - Matching registration passwords: `confirmPassword` shall be non-empty and shall exactly equal `password`, including letter case.
- BR-REG-07 - Confirm password handling: `confirmPassword` shall not be stored in the database or written to application logs.
- BR-REG-08 - Invalid registration handling: If any registration field violates a validation or business rule, the system shall reject the request and shall not create a User record.
- BR-REG-09 - Bcrypt password storage: A registered password shall be hashed with bcrypt using 10 salt rounds before the User record is saved; the plaintext password shall not be stored, logged, or returned.
- BR-REG-10 - Concurrent registration conflict handling: If concurrent registration requests use the same normalized email, exactly one User record shall be created. Each conflicting request shall be rejected with HTTP 409 Conflict; no JWT shall be issued and no authenticated session shall be established for the rejected request.
- BR-REG-11 - Successful registration: After successful registration, the system shall create the User, issue a JWT access token, establish an authenticated session, and redirect the user to the home page.

## Request Header(s)

### headers.Content-Type

Type: string; Format: MIME type; Required: Yes; Nullable: No
Default: application/json
Allowed values: application/json
Validation: Request body must be JSON.
Trigger: Every request containing a JSON body.
Description: Declares the request body format.
Example: application/json

## Request Body

### fullName

Type: string; Required: Yes; Nullable: No
Validation: Must be a non-empty string.
Trigger: Registration request.
Description: User's full name.
Example: John Doe


### email

Type: string; Format: email; Required: Yes; Nullable: No
Validation: Must be a valid, non-empty email address.
Trigger: Registration request.
Description: Unique email address.
Example: user@example.com


### password

Type: string; Format: password; Required: Yes; Nullable: No
Validation: Must be a non-empty string.
Trigger: Registration request.
Description: New password.
Example: P@ssw0rd!


### confirmPassword

Type: string; Format: password; Required: Yes; Nullable: No
Validation: Must be a non-empty string and equal password.
Trigger: Registration request.
Description: Password confirmation.
Example: P@ssw0rd!

## Success Response — HTTP 201

### success

Type: boolean; Required: Yes; Nullable: No
Trigger: The account is created successfully.
Description: Indicates that registration succeeded.
Example: true


### message

Type: string; Required: Yes; Nullable: No
Trigger: The account is created successfully.
Description: Human-readable registration success message.
Example: Registration successful


### data.accessToken

Type: string; Required: Yes; Nullable: No
Trigger: The account is created successfully.
Description: JWT access token issued for the created user.
Example: eyJhbGciOiJIUzI1NiIs...


### data.user.id

Type: integer; Required: Yes; Nullable: No
Trigger: The account is created successfully.
Description: Created user identifier.
Example: 1


### data.user.fullName

Type: string; Required: Yes; Nullable: No
Trigger: The account is created successfully.
Description: Normalized full name of the created user.
Example: John Doe


### data.user.email

Type: string; Required: Yes; Nullable: No
Trigger: The account is created successfully.
Description: Normalized email address of the created user.
Example: user@example.com

## Error Response — HTTP 400

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: Input validation fails or password and confirmPassword do not match.
Description: Error description returned by the global HTTP exception filter.
Example: Bad Request / Passwords do not match.
Note: The error envelope also contains success=false and may contain an error field.

## Error Response — HTTP 409

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: The email address is already registered.
Description: Error description returned by the global HTTP exception filter.
Example: Conflict / This email is already registered.
Note: The error envelope also contains success=false and may contain an error field.

## Error Response — HTTP 500

### message

Type: string | string[]; Required: Yes; Nullable: No
Trigger: The user record or token cannot be created.
Description: Error description returned by the global HTTP exception filter.
Example: Internal Server Error
Note: The error envelope also contains success=false and may contain an error field.
