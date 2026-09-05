# Docker deployment incident log

Append deployment incidents using the contract in `.codex/skills/docker-deployment/references/history-contract.md`. Preserve previous entries and never store secrets or complete raw logs.

## Entries

- 2026-08-29T02:54:35Z — `DEP-20260829-004` resolved by the bounded local bcrypt declaration; `DEP-20260829-005` resolved by aligning the inherited User entity with the already-approved deployed schema. Current database, backend and frontend containers are healthy; bounded registration observations passed without storing credential or token values.
- 2026-09-03T13:38:53Z — `DEP-20260903-002` resolved by the authorized Goals card typing repair. Current-source backend and frontend images built successfully; all Compose services are healthy, backend health and frontend reachability returned HTTP 200, and the protected goal-list route returned HTTP 401 without JWT.
- 2026-09-05T09:27:19Z — `DEP-20260905-001` source correction completed after explicit UC-07 schema approval: an earlier core-schema migration and matching foreign-key signedness now pass backend lint/build. Runtime verification remains blocked because Docker CLI is unavailable on Windows and in WSL; no volume reset or native runtime fallback was used.
