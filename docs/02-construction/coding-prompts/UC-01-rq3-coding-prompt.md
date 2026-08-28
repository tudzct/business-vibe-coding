---
artifact_type: business-coding-prompt
prompt_variant: rq3-ad
status: Approved
uc_id: UC-01
uc_name: Register an Account
source_use_case: docs/01-inception/use-cases/uc-01-register-account.md
business_rule_baseline: docs/02-construction/implementation/UC-01/business-rule-baseline.json
figma_dataset_id: 2026-08-27-001
figma_node_id: "137:8071"
figma_manifest_sha256: sha256:9b5512c7a99f4e79020dd8e47f7453daaf1fd581889684a3a9f06b349cd29768
generated_at: 2026-08-28T04:07:11.8970959Z
---

# UC-01 Business Coding Prompt (RQ3) - Register an Account

## Prompt A: Backend API

Build public `POST /api/auth/register` in the NestJS auth module under `finalsource/be/src/modules/auth` for `API-AUTH-REGISTER`.

- Access: public; no existing JWT is required.
- Request body: `{ fullName: string, email: string, password: string, confirmPassword: string }`.
- Add the request and response DTOs represented by the UC UML. The global `ValidationPipe` must validate the request before the service executes.
- Normalize registration input before lookup and persistence: normalize and trim the full name, and trim and lowercase the email. Do not normalize either password.
- Independently reject missing required values, invalid email input and mismatched passwords before persistence.
- Check whether the normalized email is already registered. Return HTTP 409 Conflict for an existing email and for a database uniqueness conflict caused by concurrent requests.
- Generate a unique username from the normalized email prefix.
- Hash the password with bcrypt using 10 salt rounds before persisting it. Never persist or log `password` or `confirmPassword`, and never expose plaintext or the stored hash.
- Persist one user containing the generated identity, normalized full name and email, generated username, bcrypt password hash and `totalBalance = 0`.
- After successful persistence, sign a JWT identifying the created user.
- Success domain payload: `{ accessToken: string, user: { id: number, fullName: string, email: string } }`.
- Normalized HTTP 201 success: `{ "success": true, "message": "Registration successful", "data": { "accessToken": "<signed JWT>", "user": { "id": 1, "fullName": "<stored full name>", "email": "<stored email>" } } }`, produced through the global response interceptor.
- Invalid input: reject without creating a user or issuing a JWT through the standard error envelope.
- Duplicate email: preserve HTTP 409 and its safe message through `{ "success": false, "statusCode": 409, "message": "<conflict message>", "timestamp": "<ISO-8601>", "path": "/api/auth/register" }`.
- Other errors: preserve the source HTTP status and safe message through the same standard error envelope.
- Any User entity or migration work must follow the researcher-approved schema gate. Keep TypeORM `synchronize` disabled and do not invent additional fields, relationships or lifecycle behavior.

Implement backend/database behavior derived strictly from the use-case functional specification, UML model, API mapping and required technical baseline. Do not invent behavior, dependencies or schema changes.

## Prompt B: Frontend UI

Build the `/register` page and `SignUpForm` in `finalsource/fe` from frozen Figma dataset `2026-08-27-001`, frame `137:8071` (`102. Signup`), snapshot `resource/figma-design-dataset/2026-08-27-001/nodes/137-8071`, manifest SHA-256 `9b5512c7a99f4e79020dd8e47f7453daaf1fd581889684a3a9f06b349cd29768`.

- Use the checksum-verified 1440x1024 screenshot/export as the visual contract and the UC as the behavioral contract.
- Reconstruct accessible React controls; do not render the flattened signup image as the interactive page.
- Preserve the centered light-gray (`#F4F5F7`) layout, FINEbank.IO branding, `Create an account` heading, labels, bordered inputs, teal `Sign up` button, divider, Google row and existing-account row.
- Required functional elements: `fullName`, `email`, `password`, `confirmPassword`, password visibility control, field-error areas, form-level API error and submit/loading state.
- The Figma frame omits `confirmPassword`. Add the smallest design-consistent `Confirm password` field immediately after Password using the same dimensions, border, typography and password-control treatment.
- Required states: default, field validation errors, submitting/disabled, duplicate-email error, generic registration error and successful transition.
- `Sign up` is functional. Google sign-up is outside UC-01 scope, so `Continue with Google` remains visual-only and must not start authentication.
- Terms-of-service and existing-account controls remain visual-only because the UC supplies no destination; do not invent routes or external URLs.
- Make the form responsive while preserving the natural desktop composition.

Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

Connect `SignUpForm` to `POST /api/auth/register` through the existing API client.

- Request: `{ fullName, email, password, confirmPassword }`.
- Define typed registration request and response shapes and reuse the normalized success/error conventions.
- Success: read `accessToken` and `user` from Axios `response.data.data`.
- Add a typed `register` operation to AuthContext. Map only `{ id, fullName, email }` into the application User shape.
- Ordered success actions: validate the returned token and user; map the user; store the JWT under `token`; store mapped user JSON under `user`; update AuthContext user state; navigate to `/`.
- Perform those actions only after a fully valid success response.
- Failure: remain on `/register`, create no authenticated state, write no token/user, do not update AuthContext and do not navigate.
- Implement frontend behavior derived strictly from the functional specification, basic flow, UI snapshot and API interaction. Do not implement Google sign-up or unsupported navigation.

## Prompt D: Validation and Error Handling

- Client validation:
  - Every registration field is required.
  - Email must match the frontend email pattern.
  - `confirmPassword` must equal `password`.
  - Display the corresponding field-level error and do not call the API when a client check fails.
- Backend validation independently enforces required values, email validity and password equality; backend/database handling remains authoritative for direct requests, persistence and duplicate-email conflicts.
- Loading/duplicate prevention: allow at most one in-flight request per submission, disable the submit control while pending, expose an accessible loading indication and always clear loading state after success or failure.
- Error mapping:
  - Client validation failure -> corresponding field-level error; no API call.
  - HTTP 409 -> display the returned safe conflict message at email/form level; remain on `/register`.
  - Other standard API errors -> display the returned safe `message` when present, otherwise `Registration failed`; remain on `/register`.
  - Malformed success payload -> treat as failure; do not persist partial session state, update AuthContext or navigate.
- Ensure retry is possible after failure. Do not log request bodies, passwords, `confirmPassword`, JWTs or sensitive response content.
