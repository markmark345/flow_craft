# Docker Deployment Optimization

**Date:** 2026-02-27
**Branch:** `feature/docker-deployment`
**Spec status:** Complete

---

## Goal

Streamline production Docker builds with multi-stage Dockerfiles for the Go API and Next.js frontend. Separate dev and production compose files so the project can be deployed without a local Go/Node toolchain.

## Scope

**In scope:**
- `api/Dockerfile` — multi-stage Go build (builder → alpine runner)
- `web/Dockerfile` — multi-stage Next.js standalone build
- `docker-compose.yml` (root) — production compose using pre-built images
- `api/docker-compose.dev.yml` — rename from existing `api/docker-compose.yml`
- `api/.dockerignore` and `web/.dockerignore`
- `web/next.config.js` — add `output: 'standalone'`

**Out of scope:**
- CI/CD pipelines or image registry push
- Kubernetes / cloud deployment
- Nginx reverse proxy (future Phase 4)
- SSL/TLS termination

---

## Design

### Architecture

```
docker-compose.yml (prod, root)
  ├── postgres:15
  ├── temporal (auto-setup)
  ├── temporal-ui
  ├── api        ← built from api/Dockerfile
  ├── worker     ← built from api/Dockerfile (different CMD)
  └── frontend   ← built from web/Dockerfile

api/docker-compose.dev.yml (dev, renamed)
  └── same services but go run + source volumes
```

### `api/Dockerfile` (multi-stage)

- **Stage 1 `builder`:** `golang:1.24-alpine` — `go build` all binaries (`api-server`, `worker`, `migrate`)
- **Stage 2 `runner`:** `alpine:3.19` — copy binaries + migrations dir, run as non-root `appuser`
- API server auto-migrates on startup (`postgres.Migrate(db)` in `main.go`) — no separate migrate step needed

### `web/Dockerfile` (multi-stage)

- **Stage 1 `deps`:** `node:20-alpine` — install pnpm + dependencies only
- **Stage 2 `builder`:** copy source, build with `NEXT_PUBLIC_API_BASE_URL` as ARG, `pnpm build`
- **Stage 3 `runner`:** copy `.next/standalone`, `.next/static`, `public` — minimal image
- Requires `output: 'standalone'` in `next.config.js`

### `NEXT_PUBLIC_API_BASE_URL` in production

`NEXT_PUBLIC_*` vars are baked into the bundle at build time. The root compose passes it as a build arg defaulting to `http://localhost:8080/api/v1`. For deployments behind a reverse proxy, override via `--build-arg` or compose `args`.

### Health checks

- `postgres`: `pg_isready`
- `api`: `curl -f http://localhost:8080/api/v1/health`
- `frontend`: not added (no lightweight health endpoint in Next.js standalone)

---

## Affected Files

| File | Action |
|---|---|
| `api/Dockerfile` | Create |
| `api/.dockerignore` | Create |
| `web/Dockerfile` | Create |
| `web/.dockerignore` | Create |
| `web/next.config.js` | Edit — add `output: 'standalone'` |
| `docker-compose.yml` (root) | Create — production |
| `api/docker-compose.dev.yml` | Rename from `api/docker-compose.yml` |

---

## Checklist

- [x] Rename `api/docker-compose.yml` → `api/docker-compose.dev.yml`
- [x] Create `api/Dockerfile` (multi-stage Go)
- [x] Create `api/.dockerignore`
- [x] Add `output: 'standalone'` to `web/next.config.js`
- [x] Create `web/Dockerfile` (multi-stage Next.js standalone)
- [x] Create `web/.dockerignore`
- [x] Create root `docker-compose.yml` (production)
- [x] Verify `pnpm build` passes with `output: standalone` — `.next/standalone/` generated
- [ ] Verify `docker compose build` succeeds end-to-end (requires Docker daemon)

---

## Deviations

- **Health check path:** Spec said `/health`, actual endpoint is `/api/v1/health` — corrected in compose.
- **Frontend health check omitted:** Next.js standalone has no lightweight ping; depends_on `api: service_healthy` is sufficient guard.
- **web/Dockerfile uses 3 stages, not 2:** Split `deps` (install only) from `builder` (build) for better layer caching when only source changes.

## Changelog

- `api/Dockerfile` — multi-stage: `golang:1.24-alpine` builder compiles `api-server`, `worker`, `migrate` binaries; `alpine:3.19` runner copies binaries + `internal/migrations/` dir, runs as non-root `appuser`
- `api/.dockerignore` — excludes `.env`, test files, markdown, docker compose files
- `web/next.config.js` — added `output: "standalone"`
- `web/Dockerfile` — 3-stage: deps (pnpm install), builder (pnpm build with `NEXT_PUBLIC_API_BASE_URL` ARG), runner (standalone output only)
- `web/.dockerignore` — excludes `node_modules/`, `.next/`, `.env*`, test output
- `docker-compose.yml` (root) — production compose with health checks, `postgres_data` named volume, `depends_on: condition: service_healthy`
- `api/docker-compose.dev.yml` — renamed from `api/docker-compose.yml` (dev only, `go run` + source volume mounts)
