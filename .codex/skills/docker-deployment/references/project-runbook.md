# Business Vibe Coding Docker runbook

- Compose root: `finalsource/compose.yaml`
- Configuration: `finalsource/.env` created from the committed example after researcher authorization.
- Services: MySQL, NestJS backend and React/Nginx frontend.
- Use Compose v2 only; no native host fallback.
- The researcher supplies DBML and `finalsource/init.sql`. Follow `docs/00-context/engineering/DATABASE-SCHEMA.md` for initial empty-volume verification and printing the three configuration pins. Init SQL runs once on a new volume. Do not reset between cumulative UCs or change schema to recover runtime. Verify existing pins with the database helper; never replace them automatically.

Review with `docker --version`, `docker compose version`, daemon status and Compose configuration. In authorized run mode, build from current source, start the stack, then verify containers, healthchecks, frontend reachability, backend health, and the bounded UC checkpoints required by the active prompt.

Common URLs use the configured ports: frontend root, backend `/api/health`, Swagger `/docs`, and OpenAPI `/docs-json`. Never persist secrets or full logs, and never run destructive volume/image cleanup without a separate explicit request.
