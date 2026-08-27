---
artifact_type: business-rule-resource
status: Frozen
uc_id: UC-01
source_use_case: docs/01-inception/use-cases/uc-01-register-account.md
source_use_case_sha256: sha256:bbdfcf7d3d1dd36d17b0e133368b52d7d11ee9267d911454396a0bfc609450fe
---

# UC-01 Business Rule Resource

## Source provenance

- Spreadsheet: `1b6nG8slHLf2CtXZwVHHsNrogvhHNg3lceK6f3B7mKIM`
- Tab/range: `Use cases!A5:B25`
- OCL utilities: `Use cases!A2:B2`
- Retrieved at: `2026-08-27T03:49:28.570Z`

## Ordered Business Rules

The canonical machine-readable resource is `docs/02-construction/business-rules/UC-01-business-rules.json`. The expressions and authoritative text below are exact projections from the frozen UC.

### BR-REG-01 - Valid registration full name

- Representation: `ocl_precondition`
- Context: `AuthService::register(dto : RegisterDto) : AuthResponse`
- Enforcement layers: `frontend`, `backend`
- Failure behavior: Client field-level error and no API call for client-side validation failure; backend independently rejects invalid input through the standard error envelope.
- Traceability: `Use cases!A5:B25`; UC-01 Basic Flow 5, 7, 10; UC-01 AF-1; API-AUTH-REGISTER

~~~text
context AuthService::register(
  dto : RegisterDto
) : AuthResponse

pre BR_REG_01_Defined:
  not dto.fullName.oclIsUndefined()

pre BR_REG_01_Length:
  let normalizedName : String = trim(nfc(dto.fullName))
  in
    normalizedName.size() >= 4 and
    normalizedName.size() <= 25

pre BR_REG_01_Pattern:
  let normalizedName : String = trim(nfc(dto.fullName))
  in
    matches(
      normalizedName,
      '^[\p{L}]+(?: [\p{L}]+)*$'
    )

post BR_REG_01_Normalized:
  let normalizedName : String = trim(nfc(dto.fullName))
  in
    result.success implies
      not result.data.oclIsUndefined() and
      not result.data.user.oclIsUndefined() and
      result.data.user.fullName = normalizedName
~~~

### BR-REG-02 - Valid registration email

- Representation: `ocl_precondition`
- Context: `AuthService::register(dto : RegisterDto) : AuthResponse`
- Enforcement layers: `frontend`, `backend`
- Failure behavior: Client field-level error and no API call for empty or invalid email; backend independently rejects invalid input through the standard error envelope.
- Traceability: `Use cases!A5:B25`; UC-01 Basic Flow 5, 7, 10; UC-01 AF-1; API-AUTH-REGISTER

~~~text
context AuthService::register(
  dto : RegisterDto
) : AuthResponse

pre BR_REG_02_Defined:
  not dto.email.oclIsUndefined()

pre BR_REG_02_NotEmpty:
  trim(dto.email).size() > 0

pre BR_REG_02_MaxLength:
  let normalizedEmail : String = lower(trim(dto.email))
  in
    normalizedEmail.size() <= 255

pre BR_REG_02_ValidFormat:
  let normalizedEmail : String = lower(trim(dto.email))
  in
    isEmail(normalizedEmail)

post BR_REG_02_Normalized:
  let normalizedEmail : String = lower(trim(dto.email))
  in
    result.success implies
      not result.data.oclIsUndefined() and
      not result.data.user.oclIsUndefined() and
      result.data.user.email = normalizedEmail
~~~

### BR-REG-03 - Unique registration email

- Representation: `ocl_invariant`
- Context: `User; AuthService::register(dto : RegisterDto) : AuthResponse`
- Enforcement layers: `backend`, `database`
- Failure behavior: HTTP 409 Conflict for an already registered normalized email; no authenticated frontend state is created.
- Traceability: `Use cases!A5:B25`; UC-01 Basic Flow 8; UC-01 AF-2; API-AUTH-REGISTER

~~~text
context User

inv BR_REG_03_UniqueNormalizedEmail:
  User.allInstances()->isUnique(
    user | lower(trim(user.email))
  )

context AuthService::register(
  dto : RegisterDto
) : AuthResponse

pre BR_REG_03_EmailNotRegistered:
  not User.allInstances()->exists(
    user |
      lower(trim(user.email)) =
      lower(trim(dto.email))
  )
~~~

### BR-REG-04 - Valid registration password

- Representation: `ocl_precondition`
- Context: `AuthService::register(dto : RegisterDto) : AuthResponse`
- Enforcement layers: `frontend`, `backend`
- Failure behavior: Client field-level error and no API call for invalid password; backend independently rejects invalid input through the standard error envelope.
- Traceability: `Use cases!A5:B25`; UC-01 Basic Flow 5, 7; UC-01 AF-1; API-AUTH-REGISTER

~~~text
context AuthService::register(
  dto : RegisterDto
) : AuthResponse

pre BR_REG_04_Defined:
  not dto.password.oclIsUndefined()

pre BR_REG_04_Length:
  dto.password.size() >= 8 and
  dto.password.size() <= 64

pre BR_REG_04_NoWhitespace:
  not matches(
    dto.password,
    '.*\s.*'
  )

pre BR_REG_04_ContainsLowercase:
  matches(
    dto.password,
    '.*[a-z].*'
  )

pre BR_REG_04_ContainsUppercase:
  matches(
    dto.password,
    '.*[A-Z].*'
  )

pre BR_REG_04_ContainsDigit:
  matches(
    dto.password,
    '.*[0-9].*'
  )

pre BR_REG_04_ContainsSpecialCharacter:
  matches(
    dto.password,
    '.*[!@#$%^&*(){}\-_+=\[\],./<>?\\|:;].*'
  )
~~~

### BR-REG-05 - Permitted password characters

- Representation: `ocl_precondition`
- Context: `AuthService::register(dto : RegisterDto) : AuthResponse`
- Enforcement layers: `frontend`, `backend`
- Failure behavior: Client field-level error and no API call for invalid password characters; backend independently rejects invalid input through the standard error envelope.
- Traceability: `Use cases!A5:B25`; UC-01 Basic Flow 5, 7; UC-01 AF-1; API-AUTH-REGISTER

~~~text
context AuthService::register(
  dto : RegisterDto
) : AuthResponse

pre BR_REG_05_AllowedCharacters:
  matches(
    dto.password,
    '^[A-Za-z0-9!@#$%^&*(){}_=+\[\],./<>?\\|:;\-]+$'
  )
~~~

### BR-REG-06 - Matching registration passwords

- Representation: `ocl_precondition`
- Context: `AuthService::register(dto : RegisterDto) : AuthResponse`
- Enforcement layers: `frontend`, `backend`
- Failure behavior: Client field-level error and no API call when passwords differ; backend independently rejects mismatched passwords through the standard error envelope.
- Traceability: `Use cases!A5:B25`; UC-01 Basic Flow 5, 8; UC-01 AF-1; API-AUTH-REGISTER

~~~text
context AuthService::register(
  dto : RegisterDto
) : AuthResponse

pre BR_REG_06_ConfirmPasswordDefined:
  not dto.confirmPassword.oclIsUndefined()

pre BR_REG_06_PasswordsMatch:
  dto.confirmPassword = dto.password
~~~

### BR-REG-07 - Confirm password handling

- Representation: `natural_language`
- Context: `Registration input handling`
- Enforcement layers: `backend`, `database`
- Failure behavior: No separate source-backed runtime error is specified; confirmPassword must be excluded from persistence and logs.
- Traceability: `Use cases!A5:B25`; UC-01 RegisterDto; API-AUTH-REGISTER

~~~text
confirmPassword shall not be persisted or written to application logs.
~~~

### BR-REG-08 - Invalid registration handling

- Representation: `ocl_postcondition`
- Context: `AuthService::register(dto : RegisterDto) : AuthResponse`
- Enforcement layers: `backend`, `database`
- Failure behavior: Reject invalid registration with success=false in the standard error envelope, create no User, and establish no authenticated frontend state.
- Traceability: `Use cases!A5:B25`; UC-01 POST-4; UC-01 Basic Flow 7; UC-01 AF-1; UC-01 EF-1; API-AUTH-REGISTER

~~~text
context AuthService::register(
  dto : RegisterDto
) : AuthResponse

post BR_REG_08_InvalidRequestRejected:
  not self.isRegistrationInputValid(dto)
  implies
    result.success = false

post BR_REG_08_NoUserCreated:
  not self.isRegistrationInputValid(dto)
  implies
    User.allInstances()->size() =
    User.allInstances()@pre->size()
~~~

### BR-REG-09 - Bcrypt password storage

- Representation: `ocl_postcondition`
- Context: `AuthService::register(dto : RegisterDto) : AuthResponse; password persistence and response handling`
- Enforcement layers: `backend`, `database`
- Failure behavior: Registration must not succeed unless the password is hashed with bcrypt cost 10 before persistence; plaintext and passwordHash remain absent from persistence/log exposure and the API response.
- Traceability: `Use cases!A5:B25`; UC-01 POST-1; UC-01 Basic Flow 9-10; API-AUTH-REGISTER

~~~text
context AuthService::register(
  dto : RegisterDto
) : AuthResponse

post BR_REG_09_PasswordHashed:
  result.success implies
    let createdUser : User =
      User.allInstances()->any(
        user |
          lower(trim(user.email)) =
          lower(trim(dto.email))
      )
    in
      not createdUser.oclIsUndefined() and
      createdUser.passwordHash <> dto.password and
      bcryptMatches(
        dto.password,
        createdUser.passwordHash
      ) and
      bcryptCost(createdUser.passwordHash) = 10
Technical constraints:
- The plaintext password shall not be persisted or logged.
- Neither the plaintext password nor passwordHash shall be included in the API response.
- The bcrypt hash shall be generated before the User record is persisted.
~~~

### BR-REG-10 - Concurrent registration conflict handling

- Representation: `ocl_invariant`
- Context: `User; concurrent AuthService registration`
- Enforcement layers: `backend`, `database`
- Failure behavior: Exactly one concurrent creation succeeds; each conflict returns HTTP 409, issues no JWT, creates no session, and leaves exactly one User for the normalized email.
- Traceability: `Use cases!A5:B25`; UC-01 AF-2; UC-01 POST-4; API-AUTH-REGISTER; BR-REG-03

~~~text
context User

inv BR_REG_10_AtMostOneUserPerNormalizedEmail:
  User.allInstances()->forAll(user |
    User.allInstances()
      ->select(other |
        lower(trim(other.email)) =
        lower(trim(user.email))
      )
      ->size() = 1
  )
Technical constraints:
- User.email shall be protected by the database unique constraint defined in BR-REG-03.
- If multiple concurrent registration requests contain the same normalized email, exactly one User creation shall succeed.
- Each conflicting request shall be rejected with HTTP 409 Conflict.
- A rejected request shall not issue a JWT or establish an authenticated session.
- After all concurrent requests complete, exactly one User shall exist for the normalized email.
~~~

### BR-REG-11 - Successful registration

- Representation: `ocl_postcondition`
- Context: `AuthService::register(dto : RegisterDto) : RegisterResponseDto; client authentication flow`
- Enforcement layers: `frontend`, `backend`, `database`
- Failure behavior: Success requires a persisted unique User, non-empty message and accessToken, mapped user data, authenticated client session, and redirect to `/`; failure establishes no session and performs no navigation.
- Traceability: `Use cases!A5:B25`; UC-01 POST-1 through POST-4; UC-01 Basic Flow 9-12; UC-01 EF-1; API-AUTH-REGISTER

~~~text
context AuthService::register(
  dto : RegisterDto
) : RegisterResponseDto

post BR_REG_11_SuccessResponse:
  result.success implies
    result.message.size() > 0 and
    not result.data.oclIsUndefined() and
    not result.data.user.oclIsUndefined() and
    not result.data.accessToken.oclIsUndefined() and
    result.data.accessToken.size() > 0

post BR_REG_11_UserCreated:
  result.success implies
    User.allInstances()->one(user |
      user.id = result.data.user.id and
      lower(trim(user.email)) =
        lower(trim(dto.email))
    )
Technical constraints:
- After the User has been successfully persisted, the backend shall issue a signed JWT access token identifying that User.
- The successful response shall contain the created user information and access token inside the data object.
- After receiving the successful response, the client shall establish an authenticated session using the returned token.
- The client shall redirect the authenticated user to the home page.
- A session shall not be established and navigation shall not occur when registration fails.
~~~

## Unresolved items

None.

This artifact contains every BR in source order. It does not select, paraphrase or add rules, and it does not generate tests.
