---
artifact_type: business-coding-prompt
prompt_variant: rq3-ad
status: Approved
uc_id: UC-01
uc_name: Register an Account
source_use_case: docs/01-inception/use-cases/uc-01-register-account.md
figma_dataset_id: 2026-08-29-005
figma_node_id: "137:8071"
figma_manifest_sha256: sha256:41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1
generated_at: 2026-08-31T02:39:31.8195475Z
approved_by_researcher_id: kien
approved_at: 2026-08-31T02:45:47.6461470Z
---

# UC-01 Business Coding Prompt (RQ3) - Register an Account

## Prompt A: Backend API

### Objective: Build the public registration endpoint, account-creation logic, validation, authenticated-session response, and server-side error handling.

Create the public `POST /api/auth/register` endpoint for `API-AUTH-REGISTER` in the NestJS backend under `finalsource/be`.

- Accept `Content-Type: application/json`.
- Do not require authentication or authorization.
- Define a `RegisterDto` with exactly these request fields: required, non-null `fullName`, `email`, `password`, and `confirmPassword` strings.
- Implement the registration flow in an auth controller/service using the existing TypeORM `User` repository, bcrypt dependency, JWT dependency, validation pipeline, and normalized HTTP response handling.
- Validate that `fullName`, `email`, and `password` are non-empty, that `email` has a valid email format, and that `confirmPassword` is non-empty and equals `password`.
- Reject invalid input before creating a user or issuing a token.
- Reject an already registered email with HTTP 409 Conflict and do not create an authenticated session.
- Persist the new account securely. Hash the password with the existing bcrypt approach before persistence; never persist `confirmPassword` or plaintext credentials.
- After persistence succeeds, issue a signed JWT access token identifying the created user.
- Return only the created user's `id`, `fullName`, and `email`; never return credential fields.
- Do not log passwords, `confirmPassword`, access tokens, or sensitive request/response payloads.

The current `User` mapping contains required fields outside this request contract. Do not invent values for fields such as `username`, and do not edit an entity or migration during implementation unless a self-contained `docs/02-construction/implementation/UC-01/schema.json` proposal has received explicit researcher approval. If the existing mapping cannot persist the UML-defined user without such values, stop at the schema gate and report the incompatibility rather than changing the public request.

For HTTP 201, return:

```json
{
  "success": true,
  "message": "Registration successful",
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

- Invalid or mismatched input: preserve HTTP 400 and the source validation message.
- Email already registered: preserve HTTP 409 and the conflict message, such as `"This email is already registered."`.
- User persistence or token creation failure: preserve HTTP 500 with a safe message and create no authenticated session.
- Wrap every error as `{ "success": false, "statusCode": <status>, "message": <string-or-string-array>, "timestamp": "<ISO-8601>", "path": "/api/auth/register" }`.

Follow the existing NestJS architecture and installed dependencies. Do not introduce unrelated layers or dependencies. Do not create or run tests.

## Prompt B: Frontend UI

### Objective: Build the registration interface according to the frozen Figma evidence and UC-01 functional scope.

Create or replace the `/register` route page and its `SignUpForm` in `finalsource/fe` using React 18, TypeScript, Vite, Tailwind, React Router, and the project's existing component conventions.

### Figma Design Scope

Use frozen dataset `2026-08-29-005`, frame `102. Signup` at node `137:8071`, snapshot `resource/figma-design-dataset/2026-08-29-005/nodes/137-8071`, and manifest SHA-256 `41d825cfd36250aa54c87f29ab10e2fbd48df15f9531e9ec7cfab81b4184a0d1`.

The exact target is:

- `102. Signup` — node `137:8071`, 1440×1024.

Reconstruct the page as accessible React UI; do not use `screenshot.png` or `export.png` as the interactive page.

- Preserve the centered desktop composition on the `#F4F5F7` background, the `FINEbank.IO` wordmark, `Create an account` heading, approximately 400 px form width, restrained typography, rounded bordered fields, and teal primary action.
- Display labeled inputs for Name, Email Address, Password, and Confirm Password. Bind them to the UC/API field names `fullName`, `email`, `password`, and `confirmPassword`.
- The frozen frame does not show Confirm Password, but the functional specification requires it. Add one password input directly after Password using the same dimensions, spacing, border, and typography as the Password field.
- Provide accessible show/hide controls for password fields without changing their values.
- Display the terms-of-service sentence and link treatment shown by the design. Keep the link visual unless another source defines a destination.
- Display the teal `Sign up` submit button and the `Already have an account? Sign in here` link; route the latter to `/login`.
- The Figma frame includes `or sign up with` and `Continue with Google`, but UC-01 explicitly limits scope to email/password registration. Keep the Google control non-functional and clearly unavailable, or omit that design-only section if the existing product convention hides unavailable authentication methods. Do not implement Google authentication.
- Ensure `/register` uses a standalone authentication-page composition when the shared application header/footer would conflict with the frozen frame.
- Preserve the desktop layout and use the existing responsive conventions so the form remains usable on narrower screens without inventing new content.
- Include design-consistent field errors, a form-level API error area, and a loading state without shifting the core composition unnecessarily.

Do not create or run tests.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect the registration form to the API and establish the successful authenticated session.

Continue in the `/register` page, `SignUpForm`, `finalsource/fe/src/api/auth.service.ts`, and `AuthContext`.

- Keep typed form state for `fullName`, `email`, `password`, and `confirmPassword`; remove unrelated registration fields from this flow.
- Define the registration request type with those same four fields.
- Implement `handleSubmit` to send `POST /api/auth/register` through the existing Axios instance. Because its base URL already includes `/api`, call the relative path `/auth/register`.
- Send this JSON payload:

```json
{
  "fullName": "John Doe",
  "email": "user@example.com",
  "password": "<password>",
  "confirmPassword": "<matching password>"
}
```

- Read the normalized success envelope from Axios `response.data`, and read the domain payload from `response.data.data`.
- Type the success payload as `{ accessToken: string; user: { id: number; fullName: string; email: string } }`.
- On HTTP 201 success, store the returned access token and user through one `AuthContext` registration/session action using the project's existing authentication-storage convention, update the in-memory authenticated user, and navigate to `/`.
- Do not redirect successful registration to `/login`.
- Do not establish a session or navigate when registration fails.
- Do not send legacy `username`, `phone_number`, or `full_name` fields, and do not discard `confirmPassword` before the API call.

Do not create or run tests.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, loading state, and registration error handling.

Refine `handleSubmit` and `SignUpForm`.

### Loading State

- Set the loading state before the request and always settle it after success or failure.
- While loading, disable the `Sign up` button and all actions that could submit the form, show design-consistent loading feedback in the button, and prevent duplicate submissions.
- Clear stale form-level API errors before a new valid submission.

### Client-Side Validation

Before calling the API:

- Require non-empty `fullName`, `email`, `password`, and `confirmPassword` values.
- Require a valid email format.
- Require `confirmPassword` to equal `password`.
- Display field-level messages adjacent to the affected controls.
- Do not call the API while any client validation error remains.

Backend validation remains authoritative. Do not infer additional field-length, character-set, or password-complexity requirements that are absent from the functional specification and API contract.

### API and Network Errors

- HTTP 400: display the returned validation message or message array at the relevant field when it can be mapped safely; otherwise use the form-level error area.
- HTTP 409: display the returned duplicate-email message at the email field and keep the visitor on `/register`.
- HTTP 500: display the returned safe server message in the form-level error area.
- Network or unavailable-service failure: display a general registration-failure message and keep the entered non-secret fields available for correction.
- For every failed request, create no local authenticated state and perform no navigation.
- Do not render raw server objects, stack traces, credentials, or access tokens in errors or logs.

Do not create or run tests.
