---
artifact_type: business-coding-prompt
prompt_variant: rq3-ad
status: Approved
uc_id: UC-01
uc_name: Register an Account
source_use_case: docs/01-inception/use-cases/uc-01-register-account.md
figma_dataset_id: 2026-08-29-001
figma_node_id: "137:8071"
figma_manifest_sha256: sha256:031fb9a71a451da799d1f8259c371fffa628a74cc2842a58fa59509392394532
generated_at: 2026-08-29T02:03:27Z
---

# UC-01 Business Coding Prompt (RQ3) - Register an Account

## Prompt A: Backend API

### Objective: Build the API endpoint, business logic, validation, and server-side error handling.

Create the public `POST /api/auth/register` endpoint for `API-AUTH-REGISTER` in the existing NestJS auth module. Registration MUST NOT require an existing JWT.

### Request Format

Request body:

```ts
{
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}
```

Represent the request with the `RegisterDto` from the UC UML and implement the main flow in the existing `AuthService.register` operation.

### Logic

Implement the backend flow for UC-01 / `API-AUTH-REGISTER`:

1. Validate the registration input independently of the frontend. Reject missing required values, invalid email input, and unequal password values before creating a user.
2. Normalize the submitted registration input before lookup and persistence. Do not alter either password value during normalization.
3. Check whether the email is already registered. If so, reject the request with HTTP 409 Conflict.
4. Generate a unique username from the email prefix.
5. Hash the password with bcrypt using 10 salt rounds before storing the user.
6. Store one user with the generated identity, submitted full name and email after normalization, generated username, bcrypt password hash, and `totalBalance = 0`.
7. After the user is stored successfully, sign a JWT identifying the created user.
8. Map the stored user to `{ id, fullName, email }`; do not include password fields in the response DTO.

Implement backend and database behaviors derived strictly from the use-case functional specification, UML model, API mapping, and required project controls. Do not infer unsupported behavior.

### Success Response

Return the created session payload represented by `RegisterResponseDto`:

```json
{
  "success": true,
  "message": "<registration success message>",
  "data": {
    "accessToken": "<signed JWT>",
    "user": {
      "id": 1,
      "fullName": "<created user full name>",
      "email": "<created user email>"
    }
  }
}
```

Preserve the existing registration success message semantics while wrapping the domain payload in `{ "success": true, "message": "<message>", "data": <domain payload> }`.

### Error Handling

- For invalid input, reject the request before persistence and preserve the source HTTP status and safe message through `{ "success": false, "statusCode": <status>, "message": "<message>", "timestamp": "<ISO-8601>", "path": "/api/auth/register" }`.
- For an already registered email, return HTTP 409 Conflict through the same error envelope.
- For other registration failures, preserve the source status and safe message through the standard error envelope.
- Do not issue a JWT when registration fails.

Follow the existing project architecture. Do not introduce new architectural layers or dependencies. Use existing ORM mappings and migration conventions, and do not alter the schema without an explicit source requirement and researcher-approved schema proposal.

## Prompt B: Frontend UI

### Objective: Build the user interface according to the Figma design.

Create the `/register` page and `SignUpForm` using React 18, TypeScript, Vite, Tailwind, and the project's existing component conventions.

The component MUST display:

- FINEbank.IO branding and the `Create an account` heading.
- Labeled controls for full name, email address, password, and password confirmation.
- A password visibility control consistent with the design.
- Field-level validation message areas and a form-level API error area.
- A teal `Sign up` submit button with a visible submitting state.
- The terms-of-service row, divider, Google sign-up row, and existing-account row shown in the design.

### Figma Design Scope

Frozen Figma dataset and target: dataset `2026-08-29-001`, frame `102. Signup`, node `137:8071`, snapshot `resource/figma-design-dataset/2026-08-29-001/nodes/137-8071`, manifest SHA-256 `031fb9a71a451da799d1f8259c371fffa628a74cc2842a58fa59509392394532`.

The exact identified target frame is:

- `102. Signup` — node `137:8071` — 1440 × 1024.

### Implementation Requirements

STRICTLY follow the frozen Figma design for node `137:8071`.

- Reconstruct the page with accessible interactive React controls; do not use the flattened frame image as the page implementation.
- Match the centered composition, `#F4F5F7` background, spacing, typography, borders, colors, and control dimensions shown in the snapshot.
- The design contains Name, Email Address, and Password fields but the UC also requires password confirmation. Add the smallest design-consistent `Confirm password` field immediately after Password, using the same input dimensions, typography, border, and password-control treatment.
- Make the form responsive while preserving the desktop composition.
- `Sign up` is functional. Google sign-up is outside UC-01 scope, so `Continue with Google` remains visual-only.
- Keep design-only terms-of-service and existing-account controls visual unless an existing source-backed destination already defines their behavior; do not invent routes or external URLs.

## Prompt C: Frontend Logic and API Integration

### Objective: Connect the frontend component to the API and implement the successful flow.

Continue working on `SignUpForm` and the existing frontend authentication context.

Maintain controlled state for `fullName`, `email`, `password`, `confirmPassword`, field errors, the form-level error, and the submitting state. Implement the form submission handler to send a `POST` request to `/api/auth/register` through the project's existing API client.

### Request Payload

```ts
{
  fullName,
  email,
  password,
  confirmPassword,
}
```

Define typed request and response shapes consistent with the request DTO and `RegisterResponseDto` UML model.

### Success Response

Read `accessToken` and `user` from the normalized response `data` object:

```ts
{
  accessToken: string;
  user: {
    id: number;
    fullName: string;
    email: string;
  };
}
```

When successful:

1. Read and validate the returned access token and user object.
2. Map the returned user into the frontend authentication user shape.
3. Store the JWT and mapped user in `localStorage` using the project's existing authentication keys.
4. Update the authentication context with the new user.
5. Navigate to `/`.

Perform no session-storage, context, or navigation action unless the success payload is complete. If registration fails, remain on the form and create no authenticated frontend state.

## Prompt D: Validation and Error Handling

### Objective: Complete client-side validation, loading state, and API error handling.

Refine the submission handler in `SignUpForm`.

### Loading State

While a registration request is pending:

- Disable the `Sign up` button.
- Display accessible loading text or a spinner consistent with the design.
- Prevent duplicate submissions.
- Clear the pending state after either success or failure.

### API Error

- For HTTP 409, display the returned safe duplicate-email message at the email field or form level and remain on `/register`.
- For another request failure, display the API error value when available; otherwise display a general registration failure message.
- Do not store a token or user, update the authentication context, or navigate after any failure.
- Allow the visitor to correct the form and retry.

### Client-Side Validation

Before calling `API-AUTH-REGISTER`:

- Require `fullName`, `email`, `password`, and `confirmPassword`.
- Reject an invalid email format.
- Require `confirmPassword` to equal `password`.
- Display each validation message next to the corresponding field.

Backend validation remains authoritative. Do not call the API when client-side validation fails.
