# Authentication, configuration, hashing and OpenAPI rules

## Authentication and authorization

- Keep authentication mechanisms required by the approved prompt consistent with the current architecture.
- Use the identity source required by the approved prompt and current source. When JWT is required, extract its subject only from a verified token.
- When JWT is required, validate its algorithm, expiry and approved issuer/audience policy. Load signing secrets from validated configuration; never use fallback secrets.
- Use the authentication failure behavior required by the approved prompt or already established in the current source, without exposing sensitive internal details.
- When password hashing is required and bcrypt is already approved by the prompt or current source, use the existing package and approved cost. Compare through bcrypt; never decrypt, truncate or pre-hash passwords insecurely.

## Configuration

- Use `@nestjs/config` and validate required environment variables at startup. Keep production defaults fail-closed.
- Configure least-privilege CORS and production-safe logging/error behavior under the [shared operational constitution](../../../../AGENTS.md#shared-operational-constitution).
- Do not enable debug output in production.

## Swagger/OpenAPI

- Keep route, DTO, status and auth documentation aligned with implementation using `@nestjs/swagger`.
- Document safe request/response DTOs and expected error statuses; never expose password/hash/internal entity fields in schemas/examples.
- Do not make an internal route public merely to make it visible in Swagger.

Official basis:

- https://docs.nestjs.com/security/authentication
- https://docs.nestjs.com/security/authorization
- https://docs.nestjs.com/security/encryption-and-hashing
- https://docs.nestjs.com/techniques/configuration
- https://docs.nestjs.com/openapi/introduction

