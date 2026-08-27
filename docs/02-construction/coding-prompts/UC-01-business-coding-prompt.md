---
artifact_type: business-coding-prompt
status: Approved
uc_id: UC-01
uc_name: "Register an Account"
source_use_case: docs/01-inception/use-cases/uc-01-register-account.md
business_rule_resource: docs/02-construction/business-rules/UC-01-business-rules.json
business_rule_baseline: docs/02-construction/implementation/UC-01/business-rule-baseline.json
figma_dataset_id: 2026-08-27-001
figma_node_id: "137:8071"
figma_manifest_sha256: sha256:9b5512c7a99f4e79020dd8e47f7453daaf1fd581889684a3a9f06b349cd29768
generated_at: 2026-08-27T11:20:46.7892574Z
---

# UC-01 Business Coding Prompt - Register an Account

## Prompt A: Backend API

Build public `POST /api/auth/register` in `finalsource/be/src/modules/auth` for UC-01 / API-AUTH-REGISTER using NestJS 11, TypeScript, TypeORM/MySQL, class-validator, bcrypt and JWT.

- Access: `PUBLIC`; successful registration creates the authenticated session credentials, but the request itself requires no JWT.
- Request body: `{ fullName: string, email: string, password: string, confirmPassword: string }`.
- DTO and normalization:
  - Apply Unicode NFC and trim to `fullName`, then enforce length 4–25 and the exact BR-REG-01 Unicode-letter/single-space pattern.
  - Trim and lowercase `email`, enforce non-empty, maximum length 255 and valid email format.
  - Do not trim or otherwise normalize passwords. Enforce BR-REG-04 and BR-REG-05 exactly and require `confirmPassword === password`.
  - Use class-validator plus service-layer checks as needed; controller/DTO validation must not be the sole authority for cross-record or persistence rules.
- Main logic:
  - Independently enforce every backend/database-applicable rule from Prompt E.
  - Check normalized-email uniqueness before creation and retain a database unique constraint as the concurrency authority. Translate a database unique-constraint race into HTTP 409 Conflict.
  - Generate a unique username from the normalized email prefix without changing the returned user fields.
  - Hash the plaintext password with bcrypt cost 10 before persistence. Never persist or log `password` or `confirmPassword`; do not expose plaintext or password hash.
  - Persist exactly one User with normalized `fullName`, normalized `email`, generated unique username, bcrypt password hash and `totalBalance = 0`.
  - Perform creation and conflict-sensitive work transactionally where required so invalid or conflicting requests create no User and issue no JWT.
  - Only after successful persistence, sign a JWT identifying the created User.
- Success: HTTP 201 Created with domain payload `{ accessToken, user: { id, fullName, email } }`.
- Normalized success: `{ "success": true, "message": "Registration successful", "data": { "accessToken": "<signed JWT>", "user": { "id": "<created id>", "fullName": "<normalized full name>", "email": "<normalized email>" } } }`.
- Errors:
  - Invalid input or mismatched passwords: reject without persistence through `{ success: false, statusCode, message, timestamp, path }`; preserve validation messages without exposing sensitive values.
  - Existing or concurrent normalized email conflict: HTTP 409 Conflict through the standard error envelope.
  - Unexpected failures: safe standard error envelope; no JWT, authenticated state or sensitive logging.
- Response integration: preserve the endpoint-specific `Registration successful` message and avoid nested/double envelopes when working with the existing global response interceptor.
- Persistence gate: `finalsource/be` currently has no User entity or migration. Before any entity or migration edit in Phase 2, create `docs/02-construction/implementation/UC-01/schema.json` as a self-contained Draft proposal and obtain explicit researcher approval. Do not enable TypeORM `synchronize` or invent unapproved MySQL types, lengths, defaults, indexes or migration behavior.

Implement every backend/database-applicable rule in Prompt E. Do not invent behavior, dependencies or schema changes.

## Prompt B: Frontend UI

Build the `/register` page and `SignUpForm` in `finalsource/fe` from frozen Figma dataset `2026-08-27-001`, frame `137:8071` (`102. Signup`), snapshot `resource/figma-design-dataset/2026-08-27-001/nodes/137-8071`, manifest SHA-256 `9b5512c7a99f4e79020dd8e47f7453daaf1fd581889684a3a9f06b349cd29768`.

- Use the checksum-verified 1440×1024 screenshot/export as the visual contract and the UC as the behavioral contract.
- Reconstruct accessible React controls; do not render the flattened signup image as the interactive page.
- Preserve the centered light-gray (`#F4F5F7`) layout, FINEbank.IO branding, `Create an account` heading, labels, bordered inputs, teal `Sign up` button, divider, Google row and existing-account row.
- Required functional elements: `fullName`, `email`, `password`, `confirmPassword`, password visibility control, field-error areas, form-level API error, and submit/loading state.
- The Figma frame omits `confirmPassword`. Add the smallest design-consistent `Confirm password` field immediately after Password using the same dimensions, border, typography and password-control treatment. Follow `docs/02-construction/implementation/UC-01/ui-reconstruction-record.md`.
- Required states: default, field validation errors, submitting/disabled, duplicate-email error, generic registration error and successful transition.
- `Sign up` is functional. Google sign-up is explicitly outside UC-01 scope, so `Continue with Google` remains visual-only and must not start authentication.
- Terms-of-service and `Sign in here` controls remain visual-only unless an authoritative source supplies destinations; do not invent routes or external URLs.
- Make the form responsive while preserving the natural desktop composition.

Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

Connect `SignUpForm` to `POST /api/auth/register` through the existing `finalsource/fe/src/api/httpClient.ts`.

- Define typed registration request, normalized success and standard error shapes using the existing `ApiSuccess<T>` and `ApiError` conventions.
- Request: `{ fullName, email, password, confirmPassword }`.
- Success: read `accessToken` and `user` from Axios `response.data.data`, where `response.data` is the normalized success envelope.
- AuthContext:
  - Add the UC-required frontend authentication context and a typed `register` operation if it does not exist.
  - Map the returned `{ id, fullName, email }` into the application User shape without fabricating server fields.
  - Store the JWT under `token` and the mapped user JSON under `user` in localStorage only after a fully successful response.
  - Update AuthContext user state only after both response members are present and valid.
- Ordered success actions: validate response payload; map user; store token and user; update AuthContext; navigate to `/`.
- Failure: keep the visitor on the form, create no authenticated state, write no token/user, and do not navigate.
- Implement every frontend-applicable rule in Prompt E and no unsupported behavior.

## Prompt D: Validation and Error Handling

- Client validation:
  - `fullName`: required after NFC normalization and trim; 4–25 characters; Unicode letters separated only by single spaces, exactly as BR-REG-01.
  - `email`: required after trim; lowercase normalized value maximum 255 characters; valid email format, exactly as BR-REG-02.
  - `password`: required; 8–64 characters; no whitespace; at least one lowercase letter, uppercase letter, digit and permitted special character; only BR-REG-05 characters are accepted.
  - `confirmPassword`: required and exactly equals `password`.
  - Display field-level errors and do not call the API when any client check fails.
- Backend enforcement remains authoritative and repeats every applicable rule; client checks are user-experience controls only.
- Loading/duplicate prevention: disable the form submission control while the request is pending, expose an accessible loading indication, and permit at most one in-flight request per submission.
- Error mapping:
  - Client constraint failure → corresponding field-level error; no API call.
  - HTTP 409 → display the backend’s safe returned message at the email/form location; remain on the form.
  - Other standard API errors → display the API `message` when safe and present, otherwise `Registration failed`; remain on the form.
  - Malformed success payload → treat as failure; do not persist partial session state or navigate.
- Do not log request bodies, plaintext passwords, `confirmPassword`, JWTs or sensitive response content.
- Ensure retry is possible after failure and loading state is always cleared.

## Prompt E: Business Rules Compliance

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

## Prompt F: Implementation Context

Use Prompts A–E with the repository rules, target source, frozen UC/UML/BR specification, exact Business Rule resource, activated Figma snapshot and applicable API implementation context.

Priority:

1. Canonical Sheet-derived UC, UML and Business Rules: `docs/01-inception/use-cases/uc-01-register-account.md` from `Use cases!A5:B25`, SHA-256 `bbdfcf7d3d1dd36d17b0e133368b52d7d11ee9267d911454396a0bfc609450fe`
2. Prompt E exact Business Rules and frozen baseline:
   - `docs/02-construction/business-rules/UC-01-business-rules.json`, SHA-256 `6a8bfb15478645cb7c7117d9d01b3e109c8623543f6dc36816fafc9d02c48069`
   - `docs/02-construction/implementation/UC-01/business-rule-baseline.json`
3. Project API/database rules and current target infrastructure:
   - success `{ success: true, message, data }`
   - error `{ success: false, statusCode, message, timestamp, path }`
   - API prefix `/api`, global validation/filter/interceptor conventions, TypeORM `synchronize: false`
4. Activated frozen Figma dataset `2026-08-27-001`, node `137:8071`, manifest SHA-256 `9b5512c7a99f4e79020dd8e47f7453daaf1fd581889684a3a9f06b349cd29768`, plus the UI reconstruction record
5. Existing `finalsource/fe` and `finalsource/be` conventions; reference source under `resource/VC-AWG-Demo_FinalCode-main` is implementation context only and cannot override items 1–4

Implementation boundaries:

- Target only files required for UC-01 under `finalsource/fe` and `finalsource/be`, plus required Phase 2 evidence artifacts.
- The prompt is Draft and is not researcher approval or run activation.
- Before Phase 2 source mutation, approve this prompt, confirm the experiment configuration, and create the immutable run-activation receipt.
- Because UC-01 requires new persisted User structure in the current target, schema/entity/migration work is blocked until the exact `docs/02-construction/implementation/UC-01/schema.json` proposal receives explicit researcher approval.
- Backend/database enforcement is authoritative across trust and concurrency boundaries; frontend validation supplements it.
- Preserve JWT signing, bcrypt cost 10, normalized-email uniqueness, safe errors, transactional/concurrency behavior, secret handling and no-sensitive-logging controls.
- Do not implement Google sign-up, terms navigation, login navigation or unrelated authentication endpoints.
- Do not add dependencies unless the approved UC implementation cannot use the pinned stack.
- Generate source only. Do not create or run tests or test cases.
- Permitted verification is limited to deterministic validators, source inspection, lint, typecheck, production build, Docker Compose health/reachability and bounded manual runtime observation.
- Record initial generation evidence before repair, assess every frozen BR exactly once as `met`, `unmet` or `not_evaluable`, use bounded repair sub-prompts for evidenced defects, and freeze the final source hash.
