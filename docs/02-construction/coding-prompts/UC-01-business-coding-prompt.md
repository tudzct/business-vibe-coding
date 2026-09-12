---
artifact_type: business-coding-prompt
status: Draft
configuration_id: CFG-UC01-FULL-SOL-MEDIUM-R1-20260911
run_id: UC01-FULL-SOL-MEDIUM-R1-20260911
uc_id: UC-01
uc_name: "Register an Account"
source_use_case: docs/01-inception/use-cases/uc-01-register-account.md
api_contract: docs/01-inception/api-contracts/API-AUTH-REGISTER.md
business_rule_resource: docs/02-construction/business-rules/UC-01-business-rules.json
business_rule_baseline: docs/02-construction/implementation/UC-01/business-rule-baseline.json
figma_dataset_id: 2026-08-29-005
figma_node_id: "137:8071"
figma_manifest_sha256: sha256:41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1
generated_at: 2026-09-11T23:18:01.9285616+07:00
---

# UC-01 Business Coding Prompt - Register an Account

## Prompt A: Backend API

### Objective: Build the API endpoint, business logic, validation, and server-side error handling.

Create the public `POST /api/auth/register` endpoint in the NestJS authentication module under `finalsource/be/src/modules/auth`, integrating it through the existing application module and TypeORM infrastructure.

The request requires no JWT or other authentication.

### Request Format

Accept `Content-Type: application/json` with exactly the UC/API registration fields:

```json
{
  "fullName": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

Implement the main registration logic in `AuthService`, with controller/DTO validation plus authoritative service, persistence, and database enforcement for all applicable Prompt E rules.

### Logic

- Apply Unicode NFC normalization and trim to `fullName`; persist and return the normalized value.
- Trim and lowercase `email`; use that normalized value for lookup, uniqueness, persistence, and response mapping.
- Do not trim or normalize `password` or `confirmPassword`.
- Enforce BR-REG-01 through BR-REG-11 at their listed layers. Frontend validation never replaces backend validation.
- Reject invalid registration before persistence and create no authenticated session.
- Protect normalized email uniqueness with the existing database unique constraint and translate both pre-check and concurrent unique-constraint conflicts into HTTP 409 Conflict. Exactly one concurrent creation may succeed.
- Hash the plaintext password using bcrypt cost 10 before persisting the User. Never persist or log plaintext `password` or `confirmPassword`, and never return plaintext or the password hash.
- Persist exactly one valid User, then issue a signed JWT identifying that persisted User. Keep persistence and token issuance inside a failure-safe transaction boundary so a token-generation failure rolls back the new User; commit only after token issuance succeeds. Do not issue a JWT before persistence succeeds.
- The existing User entity contains required persistence fields not authorized by UC-01 or API-AUTH-REGISTER, notably `username`. Do not invent username-generation behavior or add request fields. If the exact four-field contract cannot be implemented without changing the schema/entity contract, prepare `docs/02-construction/implementation/UC-01/schema.json` and stop for explicit researcher approval before editing any entity or migration.
- Do not enable TypeORM `synchronize` or add dependencies, fields, routes, or schema behavior not authorized by the sources.

### Success Response

Return HTTP 201 Created with:

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "accessToken": "<signed JWT>",
    "user": {
      "id": 1,
      "fullName": "<normalized full name>",
      "email": "<normalized email>"
    }
  }
}
```

Preserve the source-defined fields and message semantics. Avoid nested or double response envelopes.

### Error Handling

- Invalid input or mismatched passwords: HTTP 400 through `{ "success": false, "statusCode": 400, "message": "<safe validation message>", "timestamp": "<ISO-8601>", "path": "/api/auth/register" }`; create no User or JWT.
- Existing or concurrent normalized-email conflict: HTTP 409 through the same standard error shape; create no additional User or JWT.
- User persistence or token creation failure: HTTP 500 with a safe message and the standard error shape; expose no credentials, hashes, database details, or sensitive payloads.

Follow the existing project architecture and secret-handling conventions. Do not create or run tests or test cases.

## Prompt B: Frontend UI

### Objective: Build the user interface according to the frozen Figma design.

Refine `finalsource/fe/src/pages/Register/Register.tsx` as the `/register` page and registration form using React 18, TypeScript, Vite, Tailwind CSS, React Router, and the existing reusable components where they can reproduce the design accurately.

The page MUST display:

- FINEbank.IO branding and the `Create an account` heading.
- `Name`, `Email Address`, `Password`, and `Confirm password` labeled inputs.
- Password visibility controls for password inputs.
- Field-level validation areas and one form-level API error area.
- A full-width teal `Sign up` submit button with disabled/loading state.
- The terms-of-service row, divider, Google signup row, and existing-account row from the design.

### Figma Design Scope

Frozen dataset `2026-08-29-005`, manifest `resource/figma-design-dataset/2026-08-29-005/manifest.json`, manifest SHA-256 `41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1`.

Exact target:

- Frame `102. Signup`, node `137:8071`, natural size 1440×1024.
- Snapshot `resource/figma-design-dataset/2026-08-29-005/nodes/137-8071`.
- Screenshot SHA-256 `91f47438e122563d9959ff46cf0c10fdb794c4a625e221707a02106b9ebe5151`.
- Background design token `Special/Main BG` / `#F4F5F7`.

### Implementation Requirements

- Reconstruct accessible interactive controls; do not use the flattened screenshot/export as the page UI.
- Match the centered desktop composition, spacing, typography, colors, borders, button treatment, and responsive behavior evidenced by the frozen frame.
- The Figma frame omits `confirmPassword`, but UC-01 requires it. Add the smallest design-consistent `Confirm password` field immediately after `Password`, using the same input dimensions, typography, border, spacing, and visibility-control treatment.
- Remove existing registration fields that are not authorized by UC-01/API-AUTH-REGISTER, including username and phone number. Use source field names `fullName`, `email`, `password`, and `confirmPassword`.
- Required states: default, field validation errors, submitting/disabled, duplicate-email error, generic/network error, and successful transition.
- `Sign up` is functional. Google signup is explicitly outside UC-01 scope; the Google row may remain a non-functional visual element but must not initiate authentication.
- Terms-of-service and sign-in destinations are not specified by the authoritative sources. Do not invent external URLs or navigation behavior for them.
- Keep the form usable on narrower viewports while retaining the 1440×1024 desktop composition as the primary visual reference.

Do not create or run tests or test cases.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect the frontend component to the API and implement the successful flow.

Connect the registration form to `POST /api/auth/register` using the existing Axios client and `finalsource/fe/src/api/auth.service.ts`.

### Request Payload

Send exactly:

```json
{
  "fullName": "<NFC-normalized and trimmed name>",
  "email": "<trimmed lowercase email>",
  "password": "<unchanged password>",
  "confirmPassword": "<unchanged confirmation>"
}
```

Update the typed request and response shapes to match API-AUTH-REGISTER. Do not omit `confirmPassword` from the request, and do not send legacy `full_name`, `username`, or `phone_number` fields.

### Success Response

Read the domain payload from the normalized Axios response at `response.data.data`:

```json
{
  "accessToken": "<signed JWT>",
  "user": {
    "id": 1,
    "fullName": "<normalized full name>",
    "email": "<normalized email>"
  }
}
```

When successful:

1. Verify that `accessToken` is non-empty and the returned user contains `id`, `fullName`, and `email`.
2. Store the token under the existing `token` localStorage key and the mapped user under the existing `user` key only after the complete response is valid.
3. Update `AuthContext` through a typed registration/session operation so the application becomes authenticated.
4. Navigate to `/` only after session storage and context state are established.

On every failure, remain on the form, write no token/user session, update no authenticated state, and do not navigate. Treat a malformed success payload as failure rather than establishing a partial session.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, loading state, and API error handling.

Refine the registration submit handler and supporting state in the registration page/form.

### Loading State

While registration is pending:

- Disable the `Sign up` button.
- Display an accessible loading indicator or loading text consistent with the design.
- Prevent duplicate submissions and allow at most one in-flight request.
- Always clear loading state after success or failure.

### API Error

- HTTP 400: display the safe backend validation message at the applicable field or form-level error area.
- HTTP 409: display the backend conflict message at the email or form-level error area.
- Network, HTTP 500, malformed success, or other unexpected failure: display the safe API message when present, otherwise `Registration failed`; remain on the form.
- Never log request bodies, plaintext passwords, `confirmPassword`, JWTs, or sensitive response content.

### Client-Side Validation

Before calling the API, enforce every frontend-applicable rule in Prompt E:

- `fullName` / BR-REG-01: required; NFC-normalize and trim; 4–25 characters; Unicode letters separated only by single spaces using the exact supplied pattern.
- `email` / BR-REG-02: required after trim; lowercase normalized value no longer than 255 characters; valid email format.
- `password` / BR-REG-04 and BR-REG-05: required; 8–64 characters; no whitespace; at least one lowercase letter, uppercase letter, digit, and permitted special character; reject every character outside the supplied allowlist.
- `confirmPassword` / BR-REG-06: required and exactly equal to the unchanged password.

Display field-level errors, preserve retry behavior, and do not call the API when validation fails. Backend/database validation remains authoritative.

## Prompt E: Business Rules Compliance

### Objective: Implement the complete frozen Business Rule set for this use case without changing its meaning.

The ordered Rule IDs below MUST exactly match the frozen Business Rule baseline. Every rule appears exactly once in this projection; one implementation control may enforce multiple rules when appropriate.

### Business Rule: BR-REG-01

- **Name:** Valid registration full name
- **Representation:** ocl_precondition
- **Expression / authoritative text:** context AuthService::register(
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
- **Context:** AuthService::register(dto : RegisterDto) : AuthResponse
- **Enforcement layer:** frontend, backend
- **Failure behavior:** Client field-level error and no API call for client-side validation failure; backend independently rejects invalid input through the standard error envelope.
- **Traceability:** Use cases!A5:B25, UC-01 Basic Flow 5, 7, 10, UC-01 AF-1, API-AUTH-REGISTER

### Business Rule: BR-REG-02

- **Name:** Valid registration email
- **Representation:** ocl_precondition
- **Expression / authoritative text:** context AuthService::register(
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
- **Context:** AuthService::register(dto : RegisterDto) : AuthResponse
- **Enforcement layer:** frontend, backend
- **Failure behavior:** Client field-level error and no API call for empty or invalid email; backend independently rejects invalid input through the standard error envelope.
- **Traceability:** Use cases!A5:B25, UC-01 Basic Flow 5, 7, 10, UC-01 AF-1, API-AUTH-REGISTER

### Business Rule: BR-REG-03

- **Name:** Unique registration email
- **Representation:** ocl_invariant
- **Expression / authoritative text:** context User

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
- **Context:** User; AuthService::register(dto : RegisterDto) : AuthResponse
- **Enforcement layer:** backend, database
- **Failure behavior:** HTTP 409 Conflict for an already registered normalized email; no authenticated frontend state is created.
- **Traceability:** Use cases!A5:B25, UC-01 Basic Flow 8, UC-01 AF-2, API-AUTH-REGISTER

### Business Rule: BR-REG-04

- **Name:** Valid registration password
- **Representation:** ocl_precondition
- **Expression / authoritative text:** context AuthService::register(
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
- **Context:** AuthService::register(dto : RegisterDto) : AuthResponse
- **Enforcement layer:** frontend, backend
- **Failure behavior:** Client field-level error and no API call for invalid password; backend independently rejects invalid input through the standard error envelope.
- **Traceability:** Use cases!A5:B25, UC-01 Basic Flow 5, 7, UC-01 AF-1, API-AUTH-REGISTER

### Business Rule: BR-REG-05

- **Name:** Permitted password characters
- **Representation:** ocl_precondition
- **Expression / authoritative text:** context AuthService::register(
  dto : RegisterDto
) : AuthResponse

pre BR_REG_05_AllowedCharacters:
  matches(
    dto.password,
    '^[A-Za-z0-9!@#$%^&*(){}_=+\[\],./<>?\\|:;\-]+$'
  )
- **Context:** AuthService::register(dto : RegisterDto) : AuthResponse
- **Enforcement layer:** frontend, backend
- **Failure behavior:** Client field-level error and no API call for invalid password characters; backend independently rejects invalid input through the standard error envelope.
- **Traceability:** Use cases!A5:B25, UC-01 Basic Flow 5, 7, UC-01 AF-1, API-AUTH-REGISTER

### Business Rule: BR-REG-06

- **Name:** Matching registration passwords
- **Representation:** ocl_precondition
- **Expression / authoritative text:** context AuthService::register(
  dto : RegisterDto
) : AuthResponse

pre BR_REG_06_ConfirmPasswordDefined:
  not dto.confirmPassword.oclIsUndefined()

pre BR_REG_06_PasswordsMatch:
  dto.confirmPassword = dto.password
- **Context:** AuthService::register(dto : RegisterDto) : AuthResponse
- **Enforcement layer:** frontend, backend
- **Failure behavior:** Client field-level error and no API call when passwords differ; backend independently rejects mismatched passwords through the standard error envelope.
- **Traceability:** Use cases!A5:B25, UC-01 Basic Flow 5, 8, UC-01 AF-1, API-AUTH-REGISTER

### Business Rule: BR-REG-07

- **Name:** Confirm password handling
- **Representation:** natural_language
- **Expression / authoritative text:** confirmPassword shall not be persisted or written to application logs.
- **Context:** Registration input handling
- **Enforcement layer:** backend, database
- **Failure behavior:** No separate source-backed runtime error is specified; confirmPassword must be excluded from persistence and logs.
- **Traceability:** Use cases!A5:B25, UC-01 RegisterDto, API-AUTH-REGISTER

### Business Rule: BR-REG-08

- **Name:** Invalid registration handling
- **Representation:** ocl_postcondition
- **Expression / authoritative text:** context AuthService::register(
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
- **Context:** AuthService::register(dto : RegisterDto) : AuthResponse
- **Enforcement layer:** backend, database
- **Failure behavior:** Reject invalid registration with success=false in the standard error envelope, create no User, and establish no authenticated frontend state.
- **Traceability:** Use cases!A5:B25, UC-01 POST-4, UC-01 Basic Flow 7, UC-01 AF-1, UC-01 EF-1, API-AUTH-REGISTER

### Business Rule: BR-REG-09

- **Name:** Bcrypt password storage
- **Representation:** ocl_postcondition
- **Expression / authoritative text:** context AuthService::register(
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
- **Context:** AuthService::register(dto : RegisterDto) : AuthResponse; password persistence and response handling
- **Enforcement layer:** backend, database
- **Failure behavior:** Registration must not succeed unless the password is hashed with bcrypt cost 10 before persistence; plaintext and passwordHash remain absent from persistence/log exposure and the API response.
- **Traceability:** Use cases!A5:B25, UC-01 POST-1, UC-01 Basic Flow 9-10, API-AUTH-REGISTER

### Business Rule: BR-REG-10

- **Name:** Concurrent registration conflict handling
- **Representation:** ocl_invariant
- **Expression / authoritative text:** context User

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
- **Context:** User; concurrent AuthService registration
- **Enforcement layer:** backend, database
- **Failure behavior:** Exactly one concurrent creation succeeds; each conflict returns HTTP 409, issues no JWT, creates no session, and leaves exactly one User for the normalized email.
- **Traceability:** Use cases!A5:B25, UC-01 AF-2, UC-01 POST-4, API-AUTH-REGISTER, BR-REG-03

### Business Rule: BR-REG-11

- **Name:** Successful registration
- **Representation:** ocl_postcondition
- **Expression / authoritative text:** context AuthService::register(
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
- **Context:** AuthService::register(dto : RegisterDto) : RegisterResponseDto; client authentication flow
- **Enforcement layer:** frontend, backend, database
- **Failure behavior:** Success requires a persisted unique User, non-empty message and accessToken, mapped user data, authenticated client session, and redirect to `/`; failure establishes no session and performs no navigation.
- **Traceability:** Use cases!A5:B25, UC-01 POST-1 through POST-4, UC-01 Basic Flow 9-12, UC-01 EF-1, API-AUTH-REGISTER

Preserve every Rule ID, OCL expression and authoritative natural-language constraint exactly.

Prompts A and D must reference applicable Rule IDs without redefining them. Backend/database enforcement remains authoritative across trust boundaries; frontend enforcement is an additional user-experience control.

Do not invent missing thresholds, statuses, ownership, schema, enforcement layers or failure behavior. Record unresolved source information and stop for the researcher when it changes implementation.

## Prompt F: Implementation Context

Use Prompts A–E together with these frozen and project sources:

Priority:

1. Frozen UC-01 functional/UML/Business Rule specification: `docs/01-inception/use-cases/uc-01-register-account.md`, `Use cases!A5:B25`, SHA-256 `945ed5b61774b7cc571ec1e61f135de13924e466cab6c7a8291e0980e58ad431`.
2. Exact Prompt E resource and baseline:
   - `docs/02-construction/business-rules/UC-01-business-rules.json`, baseline-recorded canonical-LF SHA-256 `069b7d84aa5f8fbe3f148b0fcdeb62e29335906f6cc7c76e57ea4e56811e9d2d`.
   - `docs/02-construction/implementation/UC-01/business-rule-baseline.json`, raw SHA-256 `9833f98edfcc982f25fc6e89319ff0f949fbab40d2c1204016ed226175c1333b`.
3. Frozen API contract: `docs/01-inception/api-contracts/API-AUTH-REGISTER.md`, raw SHA-256 `24544d60dd377cd9ef34485d04779f9b252cbb5018aeea329488b78d5630d277`.
4. Project contracts: API prefix `/api`; success `{ success: true, message, data }`; error `{ success: false, statusCode, message, timestamp, path }`; NestJS/TypeORM conventions; TypeORM `synchronize: false`; approved schema gate.
5. Frozen Figma dataset `2026-08-29-005`, frame `102. Signup`, node `137:8071`, manifest SHA-256 `41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1`, snapshot `resource/figma-design-dataset/2026-08-29-005/nodes/137-8071`.
6. Existing source conventions in `finalsource/fe` and `finalsource/be`, only where they do not conflict with items 1–5.

Implementation boundaries:

- Configuration `CFG-UC01-FULL-SOL-MEDIUM-R1-20260911` and run identity `UC01-FULL-SOL-MEDIUM-R1-20260911` bind this Draft.
- This Draft is not approval and does not authorize source mutation. Phase 2 requires this prompt to be Approved, prompt telemetry to be closed by a later Measure turn, and an immutable run-activation receipt.
- Modify only UC-01-required files under `finalsource/fe` and `finalsource/be`, plus authorized Phase 2 evidence artifacts.
- The current User persistence contract requires fields not supplied by UC-01. Do not invent username generation or extra registration inputs. If implementation requires entity or migration edits, first create a self-contained Draft `docs/02-construction/implementation/UC-01/schema.json` and stop for explicit researcher approval.
- Backend/database enforcement is authoritative across trust and concurrency boundaries; frontend validation is an additional user-experience control.
- Preserve JWT signing, bcrypt cost 10, normalized-email uniqueness, safe error envelopes, transaction/concurrency behavior, secret handling, and no-sensitive-logging controls.
- Do not implement Google signup, unrelated authentication endpoints, or unspecified terms/sign-in navigation.
- Do not add dependencies unless an approved requirement cannot be implemented using the pinned stack.
- Generate source only after the gates above. Do not create or run tests or test cases.
- Permitted later verification is limited to deterministic validators, source inspection, lint, typecheck, production build, Docker Compose health/reachability, and bounded manual runtime observation.
- Preserve first-pass evidence and stop after initial source generation for a later Measure turn before audit or repair.
