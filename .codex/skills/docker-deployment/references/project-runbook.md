# Vibe Security Docker runbook

## Configuration contract

- Compose file: `finalsource/compose.yaml`.
- Local secrets/config: `finalsource/.env`, copied from `finalsource/.env.example` only with permission.
- Required non-placeholder values: `MYSQL_PASSWORD`, `JWT_SECRET` with at least 32 characters.
- Optional loopback ports: `APP_PORT`, default `8080`, and `BACKEND_PORT`, default `3000`.
- Docker services: `database` (MySQL 8.4), `backend` (NestJS on internal 3000), `frontend` (unprivileged Nginx on internal 8080).
- Research backend runtime: fixed `NODE_ENV=development`; production mode is rejected so internal OpenAPI is available to approved post-repair ZAP scans. This stack is not a production deployment target.
- Frontend and backend publish loopback-only host ports for researcher experiments. Nginx also proxies browser `/api/` requests to `backend:3000`; MySQL is never published.

Do not use `localhost` for inter-container DB/API addresses. Compose supplies `DB_HOST=database`; browser API calls use the same public origin through Nginx.

## Safe lifecycle

From repository root:

```bash
docker compose --env-file finalsource/.env -f finalsource/compose.yaml config --quiet
docker compose --env-file finalsource/.env -f finalsource/compose.yaml up --build -d
docker compose --env-file finalsource/.env -f finalsource/compose.yaml ps
docker compose --env-file finalsource/.env -f finalsource/compose.yaml logs --tail=100 database backend frontend
docker compose --env-file finalsource/.env -f finalsource/compose.yaml down
```

Open `http://localhost:<APP_PORT>` only after frontend and backend health evidence is available. Check `http://localhost:<APP_PORT>/api/health` for the proxied backend health endpoint.

Research URLs after a healthy start:

- FE: `http://localhost:<APP_PORT>`
- BE health: `http://localhost:<BACKEND_PORT>/api/health`
- Swagger UI: `http://localhost:<BACKEND_PORT>/docs`
- OpenAPI JSON: `http://localhost:<BACKEND_PORT>/docs-json`

After the complete generation workflow reaches a terminal state and the current final-source hash is frozen, the researcher may invoke the independent `$run-third-party-security-scan` with an Approved product-level evaluation policy/input. Do not run scan services during generation or ordinary deployment review/startup.

## Optional experiment-batch security-tool preload

After Docker initialize succeeds and before timed UC runs, preload the centrally locked tools once:

```bash
.codex/skills/docker-deployment/scripts/preload_security_tools.sh /absolute/path/to/repository
```

This pulls Semgrep/ZAP only when their layers are absent or stale, verifies each local `RepoDigest` against `security-tools/tool-versions.lock.json`, and leaves the images cached. It does not start containers or scan source. Repeat calls are safe and reuse Docker cache. Do not run image/system prune between UCs in the same comparison group.

Image pull/preload time is environment preparation and must not be included in model generation or repair timing. If a digest changes, stop; create and approve a new lock/comparison group rather than silently accepting the new image.

After preload, verify complete execution readiness before the first timed run:

```bash
.codex/skills/docker-deployment/scripts/verify_security_tools_ready.sh /absolute/path/to/repository
```

This runs Semgrep against synthetic source and ZAP against an empty synthetic OpenAPI document using the exact security Compose profile. All output is temporary and deleted; `finalsource/` is hash-checked but not scanned. A nonzero exit blocks experiment start.

## Frequent failure routing

- Docker command missing: guide supported installation; do not attempt Compose.
- Cannot connect to daemon: start Docker Desktop/daemon with approval and recheck `docker info`.
- Missing variable/placeholder: stop and ask the researcher to edit the local env without pasting values into chat.
- Port already allocated: identify owner; prefer changing `APP_PORT` rather than terminating unrelated processes.
- Database unhealthy: inspect bounded database logs and volume/schema compatibility; never reset the volume automatically.
- Backend build failure: inspect `npm ci` and Nest build output, Node image compatibility and lockfile; do not add dependencies casually.
- Backend unhealthy: distinguish process crash, DB connection, environment validation and `/api/health` failure.
- Frontend build failure: inspect TypeScript/Vite output and lockfile; Docker uses same-origin `/api` unless an approved build variable says otherwise.
- Frontend unhealthy/502: distinguish Nginx health, backend health, proxy path and Docker network/DNS.
