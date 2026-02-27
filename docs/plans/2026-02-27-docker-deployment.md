# Docker Deployment Optimization

**Date:** 2026-02-27
**Branch:** `feature/docker-deployment`
**Spec status:** Draft

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
- `api`: `curl -f http://localhost:8080/health`
- `frontend`: `curl -f http://localhost:3000`

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

- [ ] Rename `api/docker-compose.yml` → `api/docker-compose.dev.yml`
- [ ] Create `api/Dockerfile` (multi-stage Go)
- [ ] Create `api/.dockerignore`
- [ ] Add `output: 'standalone'` to `web/next.config.js`
- [ ] Create `web/Dockerfile` (multi-stage Next.js standalone)
- [ ] Create `web/.dockerignore`
- [ ] Create root `docker-compose.yml` (production)
- [ ] Verify `docker compose build` succeeds for both services
- [ ] Verify `docker compose up` boots all services cleanly

---

## Deviations

_To be filled after implementation._

## Changelog

_To be filled after implementation._
