# Technical-stack skill routing

| Change area | Skill | Conditional reference |
|---|---|---|
| React components/hooks, Vite, routes, API/state, Tailwind/charts | `$build-react-frontend` | matching frontend reference |
| Nest modules/controllers/services, DTOs, entities, MySQL/transactions, auth/config/OpenAPI | `$build-nest-backend` | matching backend reference |

Use versions pinned by the target manifest/lockfile and existing project conventions when they do not conflict with UC/BR semantics or framework correctness. Preserve application controls explicitly required by sources. Do not add dependencies or switch framework majors merely to compile.

Run permitted lint, TypeScript and production-build commands, but do not create or run tests.
