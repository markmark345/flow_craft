# FlowCraft Monorepo

Frontend: Next.js + Tailwind + Zustand (`/web`)
Backend: Go + Gin + PostgreSQL + Temporal (`/api`)
Design spec: `docs/figma-spec.md`

## Quickstart (one-liners, no `cd` needed)

### Frontend (dev server)
1. Install deps: `pnpm --dir web install`
2. Run dev: `pnpm --dir web dev`

### Backend + DB + Temporal (single docker compose)
- Start all services (Postgres, Temporal, API, worker, Frontend):
  ```bash
docker compose -f api/docker-compose.yml up --build
  ```

### Backend local (without docker compose)
1. Set env: copy `api/.env.example` to `api/.env`
2. Run migrations (needs Postgres up): `go -C api run ./cmd/migrate`
3. API server: `go -C api run ./cmd/api-server`
4. Worker: `go -C api run ./cmd/worker`

### Database schema quick-add (if tables missing)
- Apply migrations via compose: `docker compose -f api/docker-compose.yml exec api go run ./cmd/migrate`
- Or run SQL manually:
  ```sql
  CREATE TABLE IF NOT EXISTS flows (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    version INT NOT NULL,
    definition_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS runs (
    id UUID PRIMARY KEY,
    flow_id UUID NOT NULL REFERENCES flows(id),
    status TEXT NOT NULL,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    log TEXT,
    temporal_workflow_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```

### Postgres connection (DBeaver / psql)
- Host: `localhost`
- Port: `5432`
- Database: `flowcraft`
- Username: `postgres`
- Password: `postgres`
- JDBC: `jdbc:postgresql://localhost:5432/flowcraft`

## Important Paths
- Frontend env: `web/.env.example` (`NEXT_PUBLIC_API_BASE_URL`)
- Backend env: `api/.env.example`
- Migrations: `api/internal/migrations`
- Design tokens/spec: `docs/figma-spec.md`
