---
artifact_type: business-coding-prompt
prompt_variant: full
status: Approved
uc_id: UC-01
uc_name: Register an Account
source_use_case: docs/01-inception/use-cases/uc-01-register-account.md
business_rule_resource: docs/02-construction/business-rules/UC-01-business-rules.json
business_rule_baseline: docs/02-construction/implementation/UC-01/business-rule-baseline.json
figma_dataset_version: 2026-09-12-001
figma_manifest_checksum: sha256:ed37b9d34bc23df2647b4cd50e2d1abde800722f7923b6b979591921c0efb82d
generated_at: 2026-09-13T21:08:23+07:00
---

# UC-01 Business Coding Prompt - Register an Account

Implement the Basic Flow BF-1, Alternative Flows AF-1 and AF-2, and Exception Flow EF-1 through Prompts A-D. Preserve each specified terminal outcome. This use case covers email/password registration only; the Google sign-up control visible in the design has no behavior in this use case.

Frozen flow terminal outcomes:

- **BF-1:** A new user account is created and persisted, an authenticated session is established, and the user is redirected to the home page (/)
- **AF-1:** Form submission halts without calling the API, field-level error messages are displayed, and no account is created.
- **AF-2:** The backend rejects registration due to policy conflict (e.g., duplicate email), frontend displays the error message, and no duplicate account is created.
- **EF-1:** The frontend displays a failure notification and remains on the registration form without creating an account or establishing a session.

## Prompt A: Backend API

### Objective: Build the API endpoint, business logic, validation, and server-side error handling.

Create the public `POST /api/auth/register` endpoint for `API-AUTH-REGISTER` using the existing NestJS auth controller/service and TypeORM User mapping. Accept JSON `{ fullName, email, password, confirmPassword }` with all four fields required. Use the existing API prefix `/api`; registration requires no prior authentication.

### Logic

Validate the request on the backend regardless of frontend validation. Implement the persisted-user and signed-JWT success flow in the existing auth service, applying Prompt E rules BR-REG-01 through BR-REG-11 at their specified layers. In particular, enforce normalized email uniqueness at the database boundary, handle a conflicting concurrent create as HTTP 409, hash the password before persistence, issue a JWT only after persistence succeeds, and exclude password material and confirmation from returned user data. Treat any required User schema change as subject to the researcher-approved schema proposal gate; do not edit entities or migrations before that approval.

### Success Response

Return HTTP 201 with `{ "success": true, "message": "Registration successful", "data": { "accessToken": "<signed JWT>", "user": { "id": 1, "fullName": "<normalized name>", "email": "<normalized email>" } } }`. Preserve the API contract's domain fields and success message; never return `password`, `confirmPassword`, or `passwordHash`.

### Error Handling

Return HTTP 400 for invalid input or mismatched passwords; HTTP 409 for an already registered normalized email, including a concurrent uniqueness conflict; and HTTP 500 if account persistence or token issuance fails. Preserve the API contract's status and message semantics through the project-wide error envelope `{ "success": false, "statusCode": <HTTP status>, "message": <source message>, "timestamp": "<ISO-8601>", "path": "/api/auth/register" }`. A failed registration creates no authenticated session or JWT. Keep errors safe and avoid logging sensitive fields. Follow the existing architecture and approved schema conventions.

## Prompt B: Frontend UI

### Objective: Build the user interface according to the Figma design.

Create the `/register` page and `SignUpForm` in the existing React 18, TypeScript, Vite, and Tailwind frontend. The page is accessible to a visitor from the Create an account link.

### Figma Design Scope

Use the checksum-valid frozen dataset `resource/figma-design-dataset/2026-09-12-001`, manifest SHA-256 `ed37b9d34bc23df2647b4cd50e2d1abde800722f7923b6b979591921c0efb82d`. The identified UC-01 frame is **102. Signup**, node `137:8071`, snapshot `resource/figma-design-dataset/2026-09-12-001/nodes/137-8071/` (1440 × 1024). Its screenshot, export, metadata, local assets, and design context are the design evidence.

Recreate the centered signup panel on the pale background, FINEbank.IO wordmark, Create an account heading, labeled Name, Email Address, and Password fields, password visibility control, terms text, primary Sign up button, divider, visual Google sign-up control, and Sign in link. Include loading, field-error, API-error, and failure-notification states consistent with the design. The UC and API require `confirmPassword`, absent from the frame; add the smallest design-consistent labeled confirmation field. Keep the Google sign-up control visual only because the UC explicitly excludes that flow. Do not invent behavior for a terms destination or sign-in destination beyond existing application routes/contracts.

Use the project's styling and component conventions while matching the frozen frame's layout, spacing, typography, colors, components, and responsive behavior.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect the frontend component to the API and implement the successful flow.

Use existing form, API client, routing, and AuthContext conventions in `SignUpForm`. Hold `fullName`, `email`, `password`, `confirmPassword`, field errors, request error, and loading state. On valid submission, send one JSON `POST /api/auth/register` request with those four fields. Read `{ accessToken, user }` from the normalized success response's `data` object.

For BF-1, establish the authenticated user session in AuthContext from the returned token and user, then navigate to `/` only after HTTP 201 success. Keep authentication state unchanged on any failure. The client does not infer success from request dispatch alone.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, loading state, and API error handling.

Before the API call, apply the frontend-applicable Prompt E rules BR-REG-01, BR-REG-02, BR-REG-04, BR-REG-05, and BR-REG-06. For AF-1, show field-level messages beside invalid inputs and halt submission with no API call. Backend validation remains authoritative.

While a registration request is pending, disable Sign up, show a loading state, and prevent duplicate submissions. For AF-2, show the backend's HTTP 409 conflict message on the form; create no authenticated client state and remain on `/register`. Show backend HTTP 400 validation messages without navigating. For EF-1, on an unexpected network or server failure show a failure notification, retain the form and route, and establish no session. Clear or update error state on a subsequent valid attempt without exposing sensitive values in logs or notifications.

## Prompt E: Business Rules Compliance

### Objective: Implement the complete frozen Business Rule set for this use case without changing its meaning.

The following projection is rendered from the frozen resource in its exact source order. Each expression and authoritative natural-language constraint is verbatim. Backend/database enforcement is authoritative across trust boundaries; frontend checks improve feedback.

### Business Rule: `BR-REG-01`

- **Name:** Valid registration full name
- **Representation:** `ocl_precondition`
- **Context:** AuthService::register(dto : RegisterDto) : AuthResponse
- **Enforcement layer:** frontend, backend
- **Failure behavior:** Client field-level error and no API call for client-side validation failure; backend independently rejects invalid input through the standard error envelope.
- **Traceability:** Use cases!A5:B25; UC-01 Basic Flow 5, 7, 10; UC-01 AF-1; API-AUTH-REGISTER

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

### Business Rule: `BR-REG-02`

- **Name:** Valid registration email
- **Representation:** `ocl_precondition`
- **Context:** AuthService::register(dto : RegisterDto) : AuthResponse
- **Enforcement layer:** frontend, backend
- **Failure behavior:** Client field-level error and no API call for empty or invalid email; backend independently rejects invalid input through the standard error envelope.
- **Traceability:** Use cases!A5:B25; UC-01 Basic Flow 5, 7, 10; UC-01 AF-1; API-AUTH-REGISTER

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

### Business Rule: `BR-REG-03`

- **Name:** Unique registration email
- **Representation:** `ocl_invariant`
- **Context:** User; AuthService::register(dto : RegisterDto) : AuthResponse
- **Enforcement layer:** backend, database
- **Failure behavior:** HTTP 409 Conflict for an already registered normalized email; no authenticated frontend state is created.
- **Traceability:** Use cases!A5:B25; UC-01 Basic Flow 8; UC-01 AF-2; API-AUTH-REGISTER

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

### Business Rule: `BR-REG-04`

- **Name:** Valid registration password
- **Representation:** `ocl_precondition`
- **Context:** AuthService::register(dto : RegisterDto) : AuthResponse
- **Enforcement layer:** frontend, backend
- **Failure behavior:** Client field-level error and no API call for invalid password; backend independently rejects invalid input through the standard error envelope.
- **Traceability:** Use cases!A5:B25; UC-01 Basic Flow 5, 7; UC-01 AF-1; API-AUTH-REGISTER

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

### Business Rule: `BR-REG-05`

- **Name:** Permitted password characters
- **Representation:** `ocl_precondition`
- **Context:** AuthService::register(dto : RegisterDto) : AuthResponse
- **Enforcement layer:** frontend, backend
- **Failure behavior:** Client field-level error and no API call for invalid password characters; backend independently rejects invalid input through the standard error envelope.
- **Traceability:** Use cases!A5:B25; UC-01 Basic Flow 5, 7; UC-01 AF-1; API-AUTH-REGISTER

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

### Business Rule: `BR-REG-06`

- **Name:** Matching registration passwords
- **Representation:** `ocl_precondition`
- **Context:** AuthService::register(dto : RegisterDto) : AuthResponse
- **Enforcement layer:** frontend, backend
- **Failure behavior:** Client field-level error and no API call when passwords differ; backend independently rejects mismatched passwords through the standard error envelope.
- **Traceability:** Use cases!A5:B25; UC-01 Basic Flow 5, 8; UC-01 AF-1; API-AUTH-REGISTER

~~~text
context AuthService::register(
  dto : RegisterDto
) : AuthResponse

pre BR_REG_06_ConfirmPasswordDefined:
  not dto.confirmPassword.oclIsUndefined()

pre BR_REG_06_PasswordsMatch:
  dto.confirmPassword = dto.password
~~~

### Business Rule: `BR-REG-07`

- **Name:** Confirm password handling
- **Representation:** `natural_language`
- **Context:** Registration input handling
- **Enforcement layer:** backend, database
- **Failure behavior:** No separate source-backed runtime error is specified; confirmPassword must be excluded from persistence and logs.
- **Traceability:** Use cases!A5:B25; UC-01 RegisterDto; API-AUTH-REGISTER

~~~text
confirmPassword shall not be persisted or written to application logs.
~~~

### Business Rule: `BR-REG-08`

- **Name:** Invalid registration handling
- **Representation:** `ocl_postcondition`
- **Context:** AuthService::register(dto : RegisterDto) : AuthResponse
- **Enforcement layer:** backend, database
- **Failure behavior:** Reject invalid registration with success=false in the standard error envelope, create no User, and establish no authenticated frontend state.
- **Traceability:** Use cases!A5:B25; UC-01 POST-4; UC-01 Basic Flow 7; UC-01 AF-1; UC-01 EF-1; API-AUTH-REGISTER

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

### Business Rule: `BR-REG-09`

- **Name:** Bcrypt password storage
- **Representation:** `ocl_postcondition`
- **Context:** AuthService::register(dto : RegisterDto) : AuthResponse; password persistence and response handling
- **Enforcement layer:** backend, database
- **Failure behavior:** Registration must not succeed unless the password is hashed with bcrypt cost 10 before persistence; plaintext and passwordHash remain absent from persistence/log exposure and the API response.
- **Traceability:** Use cases!A5:B25; UC-01 POST-1; UC-01 Basic Flow 9-10; API-AUTH-REGISTER

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

### Business Rule: `BR-REG-10`

- **Name:** Concurrent registration conflict handling
- **Representation:** `ocl_invariant`
- **Context:** User; concurrent AuthService registration
- **Enforcement layer:** backend, database
- **Failure behavior:** Exactly one concurrent creation succeeds; each conflict returns HTTP 409, issues no JWT, creates no session, and leaves exactly one User for the normalized email.
- **Traceability:** Use cases!A5:B25; UC-01 AF-2; UC-01 POST-4; API-AUTH-REGISTER; BR-REG-03

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

### Business Rule: `BR-REG-11`

- **Name:** Successful registration
- **Representation:** `ocl_postcondition`
- **Context:** AuthService::register(dto : RegisterDto) : RegisterResponseDto; client authentication flow
- **Enforcement layer:** frontend, backend, database
- **Failure behavior:** Success requires a persisted unique User, non-empty message and accessToken, mapped user data, authenticated client session, and redirect to `/`; failure establishes no session and performs no navigation.
- **Traceability:** Use cases!A5:B25; UC-01 POST-1 through POST-4; UC-01 Basic Flow 9-12; UC-01 EF-1; API-AUTH-REGISTER

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

## Prompt F: Implementation Context

Use Prompts A-E together with the frozen UC/UML model, `API-AUTH-REGISTER`, the approved database contract, project rules, target manifests and lockfiles, the explicit Figma snapshot above, and existing source conventions. The UC's `/register` entry, success redirect to `/`, BF-1, AF-1, AF-2, and EF-1 are all required.

Priority: (1) requirements explicitly present in this approved prompt, (2) approved API and database/project contracts, (3) frozen Figma evidence, (4) existing source conventions. Preserve the project-wide success and error envelopes while retaining source-defined status, fields, and message semantics. Generate source only in `finalsource/fe` and `finalsource/be` as required; do not create or run tests or test cases. Do not make unapproved schema, public API, ownership, dependency, or destructive changes. If schema enforcement required by Prompt E needs an entity or migration edit, first produce the self-contained UC-01 `schema.json` proposal and await explicit researcher approval of that proposal.
