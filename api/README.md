# FlowCraft API

Go + Gin scaffold with PostgreSQL and Temporal worker.

## Quick start
```
cp .env.example .env
# ensure Go and pnpm installed
# run postgres/temporal with docker-compose
```

## Endpoints
- GET /api/v1/health
- CRUD /api/v1/flows
- POST /api/v1/flows/:id/run
- GET /api/v1/runs
- GET /api/v1/runs/:id
