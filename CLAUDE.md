# FlowCraft — Claude Code Project Instructions

## Project Overview
Workflow automation tool (n8n-style). Visual drag-and-drop workflow builder with real integrations.

## Tech Stack
| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind + Zustand |
| Backend | Go + Gin + PostgreSQL (Goose migrations) |
| Workflow Engine | Temporal |
| Realtime | WebSockets (Gorilla WS) + PostgreSQL NOTIFY |
| Testing | Vitest (unit), Playwright (E2E) |

## Key Paths
```
api/internal/
  core/domain/          # Domain entities (pure Go, no external libs)
  core/ports/           # Interfaces (repositories, services, realtime)
  core/services/        # Business logic
  adapters/database/postgres/  # Repository implementations
  adapters/http/        # Gin handlers
  adapters/external/<app>/     # External API clients
  adapters/websocket/   # WS hub & handler
  adapters/realtime/    # Postgres NOTIFY listener
  temporal/             # Workflow activities + node dispatch
  migrations/           # SQL migrations (Goose)

web/src/
  app/                  # Next.js routing
  components/ui/        # Shared primitives (NO raw HTML in feature components)
  features/<name>/      # Feature modules (components/, hooks/, services/)
  hooks/                # Global hooks (use-websocket.ts)
  types/dto.ts          # Shared TypeScript types
```

## Main Branch
`master` — PRs always target `master`, never `main`.

## Commit Convention (Atomic Commits)

One commit = one logical change. Format: `<type>(<scope>): <description>`

| Type | When |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | No behavior change |
| `test` | Tests only |
| `docs` | Docs, spec files, ROADMAP |
| `chore` | Config, migrations, deps |

Scope = affected area: `api`, `web`, `temporal`, `db`, `ws`, `builder`, `dashboard`

```
feat(temporal): add Notion createPage activity
feat(builder): add Notion node to catalog
chore(db): add migration 0017_add_notion_credentials
docs(spec): add 2026-02-24-notion-integration plan
```

- Follow spec checklist: **1 checklist item = 1 commit**
- ❌ Never: `fix stuff`, `updates`, `WIP`, bundling unrelated changes

---

## Mandatory Workflow: Spec-First Development

**ALWAYS follow this sequence. No exceptions.**

### 1. Before Writing Any Code → Write Spec

Create `docs/plans/YYYY-MM-DD-<topic>.md` with:
- **Goal**: What problem does this solve?
- **Scope**: What's in / out of scope?
- **Design**: Architecture decisions, affected files, data flow
- **Checklist**: Step-by-step implementation plan

> Use skill: `.agent/skills/write-spec.md`

### 2. Implement

Follow the spec checklist step by step. Commit after each logical step.

### 3. After Finishing → Update the Spec

Update the same spec file:
- Mark checklist items ✅ / ❌
- **Document deviations**: what changed from the plan and why
- Add a `## Changelog` section summarizing what was actually built

---

## Comments — Required

```go
// Go: Comment all exported functions and non-obvious logic
// Format: what it does, not how

// loadCredentialPayload fetches and decrypts a stored OAuth credential by ID.
// Returns the typed Credential, its raw JSON payload, and any load error.
func loadCredentialPayload(...) {...}
```

```typescript
// TypeScript: Comment exported functions, hooks, and complex logic
// Format: JSDoc for public API, inline for complex branches

/**
 * useWebSocket — singleton WebSocket connection with channel-based pub/sub.
 * Reconnects automatically with exponential backoff on disconnect.
 */
export function useWebSocket() {...}
```

Rules:
- ✅ Comment **why** something works the way it does (non-obvious decisions)
- ✅ Comment all exported functions, types, and interfaces
- ✅ Comment complex conditionals and algorithm steps
- ❌ Do NOT comment self-evident code (`i++` // increment i)

---

## UI/UX Design System (Summary)

> Full reference: `.agent/skills/design-ux.md` — **read before designing any new UI**

**Theme:** Dark-first, developer-tool aesthetic. Clean, minimal, data-dense.

**Token-first — always use these Tailwind classes, never hardcode colors:**
```
Backgrounds : bg-bg → bg-panel → bg-surface → bg-surface2 (outer to inner)
Text        : text-text (primary)  text-muted (secondary)
Border      : border-border
Accent      : bg-accent  text-accent  bg-accentStrong
Semantic    : bg-success / bg-warning / bg-error / text-success / text-error
```

**Shadows by elevation:**
- Cards/panels → `shadow-soft`
- Modals/dropdowns → `shadow-lift`
- Input/button focus → `focus:outline-none focus:shadow-focus`

**New page layout shell:**
```tsx
<div className="min-h-screen bg-bg">
  <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
    <PageHeading title="..." description="..." actions={...} />
    <div className="mt-6 space-y-6">{/* content */}</div>
  </div>
</div>
```

**Required component map:**
| Element | Component |
|---|---|
| Button | `<Button variant="primary|secondary|ghost|danger">` |
| Input/Textarea | `<Input />` / `<Textarea />` |
| Card surface | `<Panel>` |
| Modal | `<Modal>` |
| Status | `<Badge tone="success|warning|danger|default">` |
| Page header | `<PageHeading>` |

---

## No Hardcoding — Config & Constants

❌ Never hardcode inline: URLs, timeouts, port numbers, retry counts, page sizes, magic numbers, feature flags.

| What | Where to put it |
|---|---|
| Backend env vars (URLs, secrets, ports) | `api/internal/config/config.go` → `Config` struct + `env()` |
| Frontend env vars (API URL, etc.) | `web/src/lib/env.ts` → `getEnv("NEXT_PUBLIC_...")` |
| Frontend stable constants (page sizes, timeouts) | `web/src/lib/constants.ts` → `constants.xxx` |

```go
// BAD: hardcoded URL in Go
http.Get("http://localhost:8080/api")

// GOOD: read from cfg passed through handler
cfg.AppBaseURL
```

```ts
// BAD: hardcoded in TS
const API = "http://localhost:8080/api/v1";

// GOOD: from env.ts
import { API_BASE_URL } from "@/lib/env";
```

- Never commit `.env` with real secrets — only `.env.example` with placeholders

---

## Architecture Rules (Summary)

- `internal/core` **cannot** import `internal/adapters` — ever
- Interfaces defined in `ports/` before implementations
- No `any` / `interface{}` without justification
- All I/O functions take `context.Context` as first arg
- No `fmt.Println` / `log.Print` in production — use structured logging (zerolog)

## Frontend Rules (Summary)

- No raw `<button>`, `<input>` etc. in feature components — use `src/components/ui/`
- Hooks in `hooks/use-xxx.ts`, never inside components
- Max 150 lines per file — split if larger
- **Data fetching: `@tanstack/react-query` only** — no manual `useEffect`+`useState` for server data
- Zustand = UI state only (sidebar, theme, activeRunId) — never cache API responses in Zustand
- State hierarchy: React Query > URL State > Zustand (UI only) > useState

## Temporal Node Pattern

Every app integration requires:
1. `api/internal/adapters/external/<app>/` — API client
2. `api/internal/temporal/app_nodes_<app>.go` — activity executor
3. `app_nodes_dispatch.go` — register in switch + prefix detection
4. `web/src/features/builder/nodeCatalog/apps/<app>.ts` — UI catalog
5. `docs/ROADMAP.md` — mark complete

> Full checklist: `.agent/skills/add-app-integration.md`

## Available Skills (`.agent/skills/`)

| Skill | When to use |
|---|---|
| `write-spec.md` | Before starting any task (mandatory) |
| `design-ux.md` | Before designing any new UI — page, component, modal, form |
| `add-app-integration.md` | Adding a new external service node |
| `add-migration.md` | Changing database schema |
| `add-websocket-channel.md` | Adding a new real-time event channel |
