# Technical-stack skill routing

These rules are enforced during `$gen-source-code`; researchers do not need to invoke each stack skill manually.

| Change area | Skill | References loaded conditionally |
|---|---|---|
| React component/hook | `$build-secure-react-frontend` | `react-rules.md` |
| TypeScript/Vite config or client env | `$build-secure-react-frontend` | `typescript-vite.md` |
| Routes, API client, Context/Zustand | `$build-secure-react-frontend` | `routing-data-state.md` |
| Tailwind/Recharts | `$build-secure-react-frontend` | `tailwind-charts.md` |
| Nest module/controller/service | `$build-secure-nest-backend` | `nest-rules.md` |
| DTO/validation/backend typing | `$build-secure-nest-backend` | `typescript-validation.md` |
| Entity/repository/MySQL/transaction | `$build-secure-nest-backend` | `typeorm-mysql.md` |
| JWT/Passport/bcrypt/config/Swagger | `$build-secure-nest-backend` | `auth-config-openapi.md` |

Version rule: use the versions declared in the target `package.json` and lockfile. Official latest documentation supplies principles, but an agent must not copy APIs from a different major version without checking compatibility. Existing project conventions win for purely stylistic choices; security requirements and framework correctness win when an existing pattern is unsafe.

Current FE baseline pins Vite 8 and React Router 7 because the Vite 5/Router 6 versions in the reference code have unresolved registry advisories. Skills must follow the baseline manifest/lockfile rather than reintroducing reference versions.

Lint/type/build rule: do not create or run tests/test cases, but run permitted ESLint, TypeScript compilation and production build commands. Do not suppress diagnostics to obtain a green result.
