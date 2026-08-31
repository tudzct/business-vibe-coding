---
artifact_type: business-coding-prompt
prompt_variant: rq3-ad
status: Draft
uc_id: UC-02
uc_name: Log In
source_use_case: docs/01-inception/use-cases/uc-02-login.md
figma_dataset_id: 2026-08-29-005
figma_node_id: "137:7477"
figma_manifest_sha256: sha256:41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1
generated_at: 2026-08-31T03:50:41.8476899Z
---

# UC-02 Business Coding Prompt (RQ3) - Log In

## Prompt A: Backend API

### Objective: Build the public login endpoint, credential-authentication logic, validation, authenticated-session response, and server-side error handling.

Create the public `POST /api/auth/login` endpoint for `API-AUTH-LOGIN` in the NestJS backend under `finalsource/be`.

- Accept `Content-Type: application/json`.
- Do not require authentication or authorization.
- Define a `LoginDto` with exactly two required, non-null string fields: `email` and `password`.
- Reject an empty or invalidly formatted email, an empty password, or an undeclared request field with HTTP 400 before attempting authentication.
- Implement the login flow in the existing auth controller/service using the TypeORM `User` repository, bcrypt password comparison, JWT dependency, validation pipeline, and normalized HTTP response handling.
- Look up the registered account by the submitted email and compare the submitted plaintext password with the stored password hash using bcrypt. Never compare against or persist a plaintext password.
- If the email is not registered or the password is incorrect, return the same HTTP 401 authentication error, `"Email or password is incorrect."`, so the response does not disclose which credential failed.
- After successful authentication, issue a signed JWT access token identifying the authenticated user.
- Return only the authenticated user's `id`, `fullName`, and `email`; never return the submitted password, stored password hash, or any other credential field.
- Do not log passwords, access tokens, password hashes, or sensitive request/response payloads.

For HTTP 200, return:

```json
{
  "success": true,
  "message": "Successful Login",
  "data": {
    "accessToken": "<signed JWT>",
    "user": {
      "id": 1,
      "fullName": "John Doe",
      "email": "user@example.com"
    }
  }
}
```

Error handling:

- Invalid, missing, or undeclared input: preserve HTTP 400 and the source validation message or message array.
- Unknown email or incorrect password: preserve HTTP 401 and the identical authentication-failure message for both cases.
- Unexpected authentication or database failure: preserve HTTP 500 with a safe message.
- Wrap every error as `{ "success": false, "statusCode": <status>, "message": <string-or-string-array>, "timestamp": "<ISO-8601>", "path": "/api/auth/login" }`.

Follow the existing NestJS architecture and installed dependencies. Do not introduce unrelated layers or dependencies. Do not alter the database schema for this use case. Do not create or run tests.

## Prompt B: Frontend UI

### Objective: Build the login interface according to the frozen Figma evidence and UC-02 functional scope.

Create or replace the `/login` route page and its `LoginForm` in `finalsource/fe` using React 18, TypeScript, Vite, Tailwind, React Router, and the project's existing component conventions.

### Figma Design Scope

Use frozen dataset `2026-08-29-005`, frame `101. Login` at node `137:7477`, snapshot `resource/figma-design-dataset/2026-08-29-005/nodes/137-7477`, and manifest SHA-256 `41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1`.

The exact target is:

- `101. Login` — node `137:7477`, 1440×1024.

Reconstruct the page as accessible React UI; do not use `screenshot.png` or `export.png` as the interactive page.

- Preserve the centered desktop composition on the `#F4F5F7` background, the `FINEbank.IO` wordmark, approximately 400 px form width, restrained Inter typography, rounded bordered fields, and teal `#299D91` primary action.
- Display a labeled `Email Address` input bound to `email` and a labeled `Password` input bound to `password`.
- Provide an accessible show/hide password control without changing the password value.
- Display the `Keep me signed in` checkbox from the design. It may retain its visual checked state, but it must not change session persistence behavior because this use case persists authentication data in `localStorage` regardless of the selection.
- Display the teal `Login` submit button, divider, `or sign in with` text, Google control, `Forgot Password?` text, and `Create an account` control in the design-consistent positions.
- Password recovery and Google login are outside UC-02 scope. Keep those controls visibly unavailable or non-functional and do not implement either flow.
- Route `Create an account` to the existing `/register` route.
- Use a standalone authentication-page composition when the shared application header or footer would conflict with the frozen frame.
- Preserve the desktop layout and use existing responsive conventions so the form remains usable on narrower screens without inventing new content.
- Include design-consistent field errors, a form-level authentication or service error area, and a loading state without shifting the core composition unnecessarily.

Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect the login form to the API and establish the successful authenticated session.

Continue in the `/login` page, `LoginForm`, `finalsource/fe/src/api/auth.service.ts`, and `AuthContext`.

- Keep typed form state for `email` and `password`; remove `username` from this login flow.
- Define the login request type as `{ email: string; password: string }`.
- Implement `handleSubmit` to send `POST /api/auth/login` through the existing Axios instance. Because its base URL already includes `/api`, call the relative path `/auth/login`.
- Send this JSON payload:

```json
{
  "email": "user@example.com",
  "password": "<password>"
}
```

- Read the normalized success envelope from Axios `response.data`, and read the domain payload from `response.data.data`.
- Type the success payload as `{ accessToken: string; user: { id: number; fullName: string; email: string } }`; do not use the legacy `token` field.
- On HTTP 200 success, store the returned `accessToken` and user in `localStorage` through one `AuthContext` login/session action, update the in-memory authenticated user, and navigate to `/`.
- Persist the token and user in `localStorage` regardless of the `Keep me signed in` checkbox state.
- Do not establish or partially update authenticated state, clear valid unrelated state, or navigate when login fails.

Do not create or run tests.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, loading state, and login error handling.

Refine `handleSubmit` and `LoginForm`.

### Loading State

- Set the loading state immediately before a valid request and always settle it after success or failure.
- While loading, disable the `Login` button and all actions that could submit the form, show design-consistent loading feedback in the button, and prevent duplicate submissions.
- Clear stale field and form-level errors before a new valid submission.

### Client-Side Validation

Before calling the API:

- Require a non-empty email value and validate its email format.
- Require a non-empty password value.
- Display field-level messages adjacent to the affected controls.
- Do not call the API while any client validation error remains.

Backend validation remains authoritative. Do not infer additional password length, complexity, or character-set requirements that are absent from the functional specification and API contract.

### API and Network Errors

- HTTP 400: display the returned validation message or message array at the relevant field when it can be mapped safely; otherwise use the form-level error area.
- HTTP 401: display the returned authentication-failure message in the form-level error area without indicating whether the email or password was incorrect.
- HTTP 500: display the returned safe server message in the form-level error area.
- Network or unavailable-service failure: display a general login-failure message and keep the visitor on `/login`.
- For every failed request, create no authenticated local state and perform no navigation.
- Do not render raw server objects, stack traces, credentials, password values, password hashes, or access tokens in errors or logs.

Do not create or run tests.
