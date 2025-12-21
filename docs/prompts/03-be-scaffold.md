# PROMPT: Backend Scaffold (Go + PostgreSQL + Temporal) with clean architecture

You are a senior backend engineer. Generate ONLY a backend scaffold (skeleton) with minimal happy path.
Database MUST be PostgreSQL. Temporal worker included.

## Tech

- Go
- HTTP framework: Gin (preferred)
- PostgreSQL
- Migrations: goose (or golang-migrate)
- Temporal server via docker-compose + Temporal UI
- Temporal Worker (Go)

## Architecture Rules (IMPORTANT)

1. Separate layers clearly:
   - handler (HTTP): parse/validate, call service, return response
   - service: business rules, transactions orchestration
   - repository: DB queries only
   - entities: domain structs (not tied to HTTP)
   - dto: request/response structs for API
2. Avoid duplication:
   - common utils (uuid, time, json, errors, pagination, logging)
   - shared DB transaction helper
3. Config must be separated and loaded via env (with defaults).
4. Provide consistent error handling + response envelope.

## Project Layout (MUST match)

/api
/cmd
/api-server
main.go
/worker
main.go
/internal
/config
config.go
/database
postgres.go
tx.go
migrate.go
/entities
flow.go
run.go
/dto
flow_dto.go
run_dto.go
common.go
/repositories
flow_repository.go
run_repository.go
/services
flow_service.go
run_service.go
/handlers
health_handler.go
flow_handler.go
run_handler.go
/temporal
client.go
workflows.go
activities.go
/utils
errors.go
logger.go
json.go
pagination.go
validation.go
time.go
uuid.go
/migrations
0001_create_flows.sql
0002_create_runs.sql
docker-compose.yml
.env.example
go.mod
README.md

## Data Model (PostgreSQL)

Table: flows

- id (uuid pk)
- name (text)
- status (text) -- draft/active/archived
- version (int)
- definition_json (jsonb)
- created_at, updated_at

Table: runs

- id (uuid pk)
- flow_id (uuid fk)
- status (text) -- queued/running/success/failed
- started_at, finished_at
- log (text)
- temporal_workflow_id (text)
- created_at, updated_at

## API Endpoints

Base: /api/v1

- GET /health
- POST /flows
- GET /flows
- GET /flows/:id
- PUT /flows/:id
- DELETE /flows/:id (optional)
- POST /flows/:id/run
- GET /runs
- GET /runs/:id

## Response Convention

- Success: { "data": ..., "meta": ... }
- Error: { "error": { "code": "...", "message": "...", "details": ... } }
  Provide /internal/utils/errors.go to standardize errors.

## Temporal Behavior (minimal, but structured)

Workflow: RunFlowWorkflow(flowID, runID)
Activities:

- LoadFlowDefinitionActivity (fetch from DB via repository or service wrapper)
- ExecuteNodeActivity (switch by node type; log only)
- UpdateRunStatusActivity (update DB)

API /flows/:id/run:

- create run row (queued)
- start workflow (store workflow id)
- set run status running
- return run id + workflow id

## Config

- /internal/config/config.go loads:
  - APP_PORT
  - DATABASE_URL
  - CORS_ORIGINS
  - TEMPORAL_ADDRESS
  - TEMPORAL_NAMESPACE
- Provide defaults and validation.

## Utilities

- logger (zap or stdlog wrapper)
- uuid helper
- json helper
- pagination helper for list endpoints
- validation helper (basic)
- tx helper (RunInTx)

## Infra

docker-compose.yml:

- postgres
- temporal
- temporal-ui
  Expose ports:
- API: 8080
- Po

