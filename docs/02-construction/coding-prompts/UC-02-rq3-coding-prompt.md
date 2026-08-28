---
artifact_type: business-coding-prompt
prompt_variant: rq3-ad
status: Approved
uc_id: UC-02
uc_name: Log In
source_use_case: docs/01-inception/use-cases/uc-02-login.md
business_rule_baseline: docs/02-construction/implementation/UC-02/business-rule-baseline.json
generated_at: 2026-08-28T02:55:26.5557648+00:00
---

# UC-02 Business Coding Prompt (RQ3) - Log In

## Prompt A: Backend API

Build `POST /api/auth/login` in the existing NestJS auth module under `finalsource/be/src/modules/auth` for `API-AUTH-LOGIN`.

- Access: public.
- Request body: `{ email: string, password: string }`.
- Add a `LoginDto` and the response DTOs needed for the UML `LoginDataDto` and `LoginUserDto` shapes. The global `ValidationPipe` must validate the request before the service executes.
- Extend the existing `AuthController` and `AuthService`; use the existing TypeORM `User` repository, `bcrypt` integration and configured `JwtService`.
- Main logic: find the user by the submitted email, compare the submitted password with the stored bcrypt hash, and after successful authentication sign a JWT whose payload is `{ sub: user.id, email: user.email }`.
- Success domain payload: `{ accessToken: string, user: { id: number, fullName: string, email: string } }`.
- Normalized HTTP 200 success: `{ "success": true, "message": "Login successful", "data": { "accessToken": "<signed JWT>", "user": { "id": 1, "fullName": "<stored full name>", "email": "<stored email>" } } }`, produced through the existing global response interceptor.
- Invalid credentials: if no user is found or the bcrypt comparison fails, return HTTP 401 with a safe authentication error through `{ "success": false, "statusCode": 401, "message": "<authentication error>", "timestamp": "<ISO-8601>", "path": "/api/auth/login" }`.
- Other errors: preserve the source HTTP status and safe message through the same standard error envelope.
- Do not return the submitted password or stored password hash. Do not log the request body, credentials, JWT or sensitive payloads.
- The approved users schema already supplies every field needed by this use case. Do not edit the User entity or migrations and do not enable TypeORM `synchronize`.

Implement backend/database behaviors derived strictly from the use-case functional specification, UML model, API mapping and required technical baseline. Do not invent behavior, dependencies or schema changes.

## Prompt B: Frontend UI

Build the `/login` page and `LoginForm` in `finalsource/fe` from frozen Figma dataset `2026-08-27-001`, frame `137:7477` (`101. Login`), snapshot `resource/figma-design-dataset/2026-08-27-001/nodes/137-7477`, manifest SHA-256 `9b5512c7a99f4e79020dd8e47f7453daaf1fd581889684a3a9f06b349cd29768`.

- Use the checksum-verified 1440×1024 screenshot/export as the visual contract and the UC as the behavioral contract.
- Reconstruct accessible React controls; do not render the flattened login image as the interactive page.
- Preserve the centered light-gray (`#F4F5F7`) layout, FINEbank.IO branding, 400 px desktop form width, email and password labels, bordered inputs, password eye control, checked `Keep me signed in` row, teal `Login` button, divider, Google row and account-creation row.
- Required functional elements: email input, password input, password visibility control, Login submit control, field-error areas, form-level API error and submit/loading indication.
- Required states: default, password visible/hidden, field validation errors, submitting/disabled, invalid-credential error, generic request error and successful transition.
- `Login` is functional. The `Keep me signed in` selection may expose its visual checked/unchecked state but must not change authentication persistence: successful token and user data are stored in `localStorage` regardless of its selection.
- Password recovery and Google login are outside UC-02 scope. Keep `Forgot Password?` and `Continue with Google` visual-only; do not start authentication or invent routes.
- `Create an account` remains visual-only unless an authoritative source supplies its navigation behavior; do not infer a destination from the current router.
- Make the form responsive while preserving the natural desktop composition and the frozen design tokens.

Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

Connect `LoginForm` to `POST /api/auth/login` through the existing `finalsource/fe/src/api/httpClient.ts` and typed auth API module.

- Request: `{ email, password }`.
- Define typed login request and data shapes and reuse the existing normalized `ApiSuccess<T>`, `ApiError` and `User` conventions.
- Success: read `accessToken` and `user` from Axios `response.data.data`, where `response.data` is the normalized success envelope.
- Extend `AuthContext` with a typed `login` operation. Map only `{ id, fullName, email }` into the application User shape.
- Ordered success actions: validate that the response has a non-empty token and valid user object; map the user; store the JWT under `token`; store the mapped user JSON under `user`; update AuthContext user state; navigate to `/`.
- Persist the token and user after every successful login regardless of the `Keep me signed in` state.
- Failure: remain on `/login`, create no new authenticated state, write no new token/user values, do not update AuthContext, and do not navigate.
- Implement frontend behaviors derived strictly from the use-case functional specification, basic flow, UI snapshot and API interaction. Do not implement password recovery, Google login or unsupported navigation.

## Prompt D: Validation and Error Handling

- Client validation:
  - Email is required and must match the frontend email pattern.
  - Password is required and must be non-empty.
  - Display the corresponding field-level error and do not call the API when either client check fails.
- Backend validation: `LoginDto` independently requires an email value accepted by email validation and a non-empty string password; backend validation remains authoritative for requests outside the client.
- Loading/duplicate prevention: allow at most one in-flight request per submission, disable the submit control while pending, expose an accessible loading indication, and always clear the loading state after success or failure.
- Error mapping:
  - Client validation failure → corresponding field-level error; no API call.
  - HTTP 401 → display the returned safe authentication message at form level; remain on `/login` with no new authenticated state.
  - Other standard API errors → display the returned safe `message` when present, otherwise `Login failed`; remain on `/login`.
  - Malformed success payload → treat as login failure; do not persist partial session state, update AuthContext or navigate.
- Ensure retry is possible after failure. Do not log email/password request bodies, plaintext passwords, JWTs or sensitive response content.
