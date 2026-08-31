---
artifact_type: business-rule-resource
status: Frozen
uc_id: UC-02
source_use_case: docs/01-inception/use-cases/uc-02-login.md
source_use_case_sha256: sha256:d6534cff0161f6d65d4b4a9f786e4e78f75afdc4d66be0b80aaf36223c3d237e
---

# UC-02 Business Rule Resource

## Source provenance

- Spreadsheet: `1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM`
- Tab/range: `Use cases!A26:B44`
- OCL utilities: `Use cases!A2:B2`
- Retrieved at: `2026-08-27T03:49:28.570Z`

## Ordered Business Rules

### BR-LOG-01 - Valid login email

- Representation: `ocl_precondition`
- Expression / authoritative text:

~~~text
context AuthService::login(
  dto : LoginDto
) : LoginResponseDto

pre BR_LOG_01_Defined:
  not dto.email.oclIsUndefined()

pre BR_LOG_01_NotEmpty:
  trim(dto.email).size() > 0

pre BR_LOG_01_ValidFormat:
  let normalizedEmail : String =
    lower(trim(dto.email))
  in
    isEmail(normalizedEmail)
~~~

- Context: `AuthService::login(dto : LoginDto) : LoginResponseDto`
- Enforcement layer(s): `frontend`, `backend`
- Failure behavior: Client field-level error and no API call when email is empty or invalid; backend independently rejects invalid input through the standard error envelope.
- Traceability: `Use cases!A26:B44`; UC-02 Basic Flow 5, 7; UC-02 AF-1; `API-AUTH-LOGIN`

### BR-LOG-02 - Non-empty login password

- Representation: `ocl_precondition`
- Expression / authoritative text:

~~~text
context AuthService::login(
  dto : LoginDto
) : LoginResponseDto

pre BR_LOG_02_Defined:
  not dto.password.oclIsUndefined()

pre BR_LOG_02_NotEmpty:
  dto.password.size() > 0
~~~

- Context: `AuthService::login(dto : LoginDto) : LoginResponseDto`
- Enforcement layer(s): `frontend`, `backend`
- Failure behavior: Client field-level error and no API call when password is empty; backend independently rejects invalid input through the standard error envelope.
- Traceability: `Use cases!A26:B44`; UC-02 Basic Flow 5, 7; UC-02 AF-1; `API-AUTH-LOGIN`

### BR-LOG-03 - Existing login account

- Representation: `ocl_postcondition`
- Expression / authoritative text:

~~~text
context AuthService::login(
  dto : LoginDto
) : LoginResponseDto

post BR_LOG_03_SuccessRequiresExistingUser:
  result.success implies
    User.allInstances()->exists(
      user |
        lower(trim(user.email)) =
        lower(trim(dto.email))
    )
~~~

- Context: `AuthService::login(dto : LoginDto) : LoginResponseDto`
- Enforcement layer(s): `backend`
- Failure behavior: Login succeeds only for an existing account; a nonexistent email is handled as invalid credentials with the same HTTP 401 authentication error used for an incorrect password.
- Traceability: `Use cases!A26:B44`; UC-02 PRE-1; UC-02 Basic Flow 8; UC-02 EF-1; `API-AUTH-LOGIN`

### BR-LOG-04 - Credential verification

- Representation: `ocl_postcondition`
- Expression / authoritative text:

~~~text
context AuthService::login(
  dto : LoginDto
) : LoginResponseDto

post BR_LOG_04_SuccessRequiresValidCredentials:
  result.success implies
    User.allInstances()->exists(
      user |
        lower(trim(user.email)) =
          lower(trim(dto.email))
        and
        self.passwordHasher.matches(
          dto.password,
          user.passwordHash
        )
    )
~~~

- Context: `AuthService::login(dto : LoginDto) : LoginResponseDto`
- Enforcement layer(s): `backend`
- Failure behavior: Login succeeds only after the submitted password matches the stored bcrypt hash; a mismatch returns the same HTTP 401 authentication error as a nonexistent email.
- Traceability: `Use cases!A26:B44`; UC-02 Basic Flow 8; UC-02 EF-1; `API-AUTH-LOGIN`

### BR-LOG-05 - Invalid credential handling

- Representation: `ocl_postcondition`
- Expression / authoritative text:

~~~text
context AuthService::login(
  dto : LoginDto
) : LoginResponseDto

post BR_LOG_05_InvalidCredentialsRejected:
  let credentialsValid : Boolean =
    User.allInstances()->exists(
      user |
        lower(trim(user.email)) =
          lower(trim(dto.email))
        and
        self.passwordHasher.matches(
          dto.password,
          user.passwordHash
        )
    )
  in
    result.success = credentialsValid

Technical constraints:

If credentialsValid = false, the backend shall return HTTP 401 Unauthorized.
The same authentication error shall be returned when the email does not exist or when the password is incorrect.
~~~

- Context: `AuthService::login(dto : LoginDto) : LoginResponseDto`
- Enforcement layer(s): `backend`
- Failure behavior: Invalid credentials return HTTP 401 Unauthorized with the same authentication error for a nonexistent email and an incorrect password; no authenticated client state is created.
- Traceability: `Use cases!A26:B44`; UC-02 POST-4; UC-02 EF-1; `API-AUTH-LOGIN`

### BR-LOG-06 - Successful login

- Representation: `ocl_postcondition`
- Expression / authoritative text:

~~~text
context AuthService::login(
  dto : LoginDto
) : LoginResponseDto

post BR_LOG_06_SuccessResponse:
  result.success implies
    not result.data.oclIsUndefined() and
    not result.data.accessToken.oclIsUndefined() and
    result.data.accessToken.size() > 0 and
    not result.data.user.oclIsUndefined()

post BR_LOG_06_CorrectAuthenticatedUser:
  result.success implies
    User.allInstances()->exists(
      user |
        user.id = result.data.user.id and
        lower(trim(user.email)) =
          lower(trim(dto.email)) and
        result.data.user.fullName = user.fullName and
        result.data.user.email = user.email
    )

Technical constraints:

The backend shall issue a signed JWT access token after successful authentication.
Neither the submitted plaintext password nor the stored password hash shall be included in the API response.
After receiving a successful response, the client shall establish the authenticated session using the returned access token and user information.
~~~

- Context: `AuthService::login(dto : LoginDto) : LoginResponseDto; client authentication flow`
- Enforcement layer(s): `frontend`, `backend`
- Failure behavior: Success returns a signed non-empty JWT and the matching basic user without plaintext or hashed password data; the client then stores the token and user, updates AuthContext, and navigates to `/`.
- Traceability: `Use cases!A26:B44`; UC-02 POST-1 through POST-3; UC-02 Basic Flow 9-12; `API-AUTH-LOGIN`

## Unresolved items

None.

This artifact contains every BR in source order. It does not select, paraphrase or add rules, and it does not generate tests.
