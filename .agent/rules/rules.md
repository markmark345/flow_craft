---
trigger: always_on
---

# AI DEVELOPMENT RULES
You are an expert Senior Engineer capable of working across the full stack (Go, Python, TypeScript/React).

---

# 🌍 GLOBAL RULES (All Stacks)
These rules apply to **BOTH** Frontend and Backend development.

### 1. **Git & Deployment Workflow**
- **Branching**: Create a new branch for every task (e.g., `feature/add-auth`, `fix/nav-bug`). NEVER work on `main` or `master`.
- **Process**: Branch → Implement → Test → Commit → Push → Merge.
- **Main branch**: `master` (not `main`). PRs always target `master`.

### 1.1 **Atomic Commits (MANDATORY)**
Each commit must cover **one logical change only** — never bundle unrelated changes together.

**Commit message format (Conventional Commits):**
```
<type>(<scope>): <short description>

[optional body — explain WHY, not what]
```

**Types:**
| Type | When |
|---|---|
| `feat` | New feature or capability |
| `fix` | Bug fix |
| `refactor` | Code change without behavior change |
| `style` | Formatting, spacing (no logic change) |
| `test` | Adding or updating tests |
| `docs` | Documentation, spec files, ROADMAP |
| `chore` | Config, migrations, dependency updates |

**Scope** = affected area: `api`, `web`, `temporal`, `db`, `ws`, `builder`, `dashboard`, etc.

**Examples:**
```
feat(temporal): add Notion createPage activity
feat(builder): add Notion node to catalog
fix(ws): handle reconnect when server closes connection
docs(spec): add 2026-02-24-notion-integration plan
chore(db): add migration 0017_add_notion_credentials
```

**Rules:**
- ✅ One commit per logical step (follow spec checklist — 1 item = 1 commit)
- ✅ Commit after each working, testable state
- ❌ Never commit multiple features/fixes in one commit
- ❌ Never commit broken or half-implemented code
- ❌ Never use vague messages: `fix stuff`, `updates`, `WIP`, `changes`

### 2. **Spec-First Development (MANDATORY)**
Every task — no matter how small — follows this cycle:

**Before writing code:**
- Create `docs/plans/YYYY-MM-DD-<topic>.md` (use skill: `.agent/skills/write-spec.md`)
- Must include: Goal, Scope (in/out), Design decisions, Affected files, Implementation checklist

**During implementation:**
- Follow the spec checklist step by step
- Commit after each logical step

**After finishing:**
- Update the same spec file:
  - Mark checklist items ✅ / ❌
  - Add `## Deviations` section: what changed from the plan and why
  - Add `## Changelog` section: summary of what was actually built

> ❌ **NEVER start writing code without a spec doc first.**

### 3. **Step-by-Step Implementation**
- Do not generate full code at once. Break complex tasks into small, verifiable steps.
- Ask for confirmation after each logical step.

### 4. **Configuration & Secrets (No Hardcoding)**

❌ **NEVER hardcode** any of the following inline in code:
- Base URLs, API endpoints, WebSocket addresses
- Timeouts, retry counts, polling intervals, rate limits
- Port numbers, database connection strings
- Page sizes, batch sizes, magic number limits
- Feature flags or toggles
- Any value that differs between environments (dev / staging / prod)

✅ **WHERE to put them:**

**Go backend** → add to `api/internal/config/config.go` (inside `Config` struct + `Load()`) and access via the `cfg` parameter injected into handlers/services:
```go
// BAD
resp, err := http.Get("http://localhost:8080/api/v1/runs")

// GOOD — add to Config struct, load from env
AppBaseURL string  // env("APP_BASE_URL", "http://localhost:3000")
```

**Frontend env vars** → add to `web/src/lib/env.ts` using `getEnv("NEXT_PUBLIC_...")`:
```ts
// BAD
const API = "http://localhost:8080/api/v1";

// GOOD
export const API_BASE_URL = getEnv("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8080/api/v1");
```

**Frontend constants** (non-env, stable values like page sizes or timeouts) → add to `web/src/lib/constants.ts`:
```ts
// BAD
const PAGE_SIZE = 20;  // scattered inline

// GOOD
export const constants = {
  appName: "FlowCraft",
  defaultPageSize: 20,
  pollIntervalMs: 5000,
};
```

**Additional rules:**
- **Privacy**: Do NOT log PII or sensitive financial data in production.
- **Credentials**: Never store raw OAuth tokens in code — always reference `credentialId` and load at runtime via `loadCredentialPayload`.
- `.env` files with real secrets are **never committed** — only `.env.example` with placeholder values.

### 5. **Roadmap & Documentation**
- **Update Roadmap**: Must update `docs/ROADMAP.md` after completing features.
- **Single Source of Truth**: Keep documentation in sync with code changes.

### 6. **Code Comments (Required)**
Comments are not optional — they are part of the deliverable.

**Go:**
- Comment all exported functions, types, and interfaces (GoDoc format)
- Comment non-obvious logic, architectural decisions, and complex conditionals

```go
// loadCredentialPayload fetches and decrypts a stored OAuth credential by ID.
// Returns the typed Credential, its raw JSON payload, and any load error.
func loadCredentialPayload(ctx context.Context, deps stepDependencies, id string) (...)
```

**TypeScript:**
- JSDoc for all exported functions, hooks, and types
- Inline comments for complex branches and non-obvious decisions

```typescript
/**
 * useWebSocket — singleton WebSocket connection with channel-based pub/sub.
 * Reconnects automatically on disconnect.
 */
export function useWebSocket() {...}
```

Rules:
- ✅ Comment **why** (non-obvious decisions, trade-offs)
- ✅ Comment all exported identifiers
- ✅ Comment complex conditionals and algorithm steps
- ❌ Do NOT comment self-evident code (`i++`, `return nil`)

### 7. **Strict Typing**
- ❌ **BAN**: Usage of `any` (or `interface{}` in Go) unless absolutely necessary.
- ✅ **USE**: Strict types, Interfaces, or Generics.

---

# 🔙 BACKEND RULES (Go)
Primary Stack: **Go** (Hexagonal/Ports & Adapters Architecture).

### 1. **Architecture (Go)**
- **Dependency Rule**: `internal/core` CANNOT import `internal/adapters` or `cmd`.
- **Pure Domain**: `internal/core/domain` must be pure Go (No external libs, No SQL tags).
- **Ports First**: Define Interfaces in `internal/core/ports` BEFORE implementation.

### 2. **File Structure (Go)**
```
api/internal/
├── core/
│   ├── domain/      # Entities & Value Objects (pure Go, no tags)
│   ├── ports/       # Interfaces (repositories, services, realtime)
│   └── services/    # Business logic
└── adapters/
    ├── database/postgres/  # Repository implementations
    ├── http/               # Gin handlers
    ├── external/           # External API clients (slack/, notion/, etc.)
    ├── realtime/           # Realtime/broadcast service
    └── websocket/          # WebSocket hub & upgrader
```

### 3. **Testing**
- **Style**: Use Table-Driven Tests for logic.
- **Coverage**: Maintain 100% coverage for `internal/core` (services, domain logic).
- **Mocks**: Place mocks in `mocks/` sub-folder next to the code they mock.

### 4. **API Standards**
- **Response Format**: Use consistent JSON: `{"success": true, "data": {...}, "error": null}`.
- **Resiliency**: All external calls must have timeouts and retry logic.

### 5. **Context Propagation**
- Every function performing I/O (DB, API, HTTP) **MUST** accept `context.Context` as the FIRST argument.
- Respect context cancellation in long-running processes.

### 6. **Structured Logging**
- ❌ **BAN**: `fmt.Println` or `log.Print` in production code.
- ✅ **USE**: Structured logging (slog/zap). Logs must include `TraceID`, `UserID`, key-value pairs.

---

# ⚙️ TEMPORAL WORKFLOW RULES

### 1. **Activity Structure**
- All node execution logic lives in `api/internal/temporal/`.
- Each app gets its own file: `app_nodes_<appname>.go`.
- Entry point: `executeApp()` in `app_nodes_dispatch.go` — add new apps here.

### 2. **Adding a New App Node (Checklist)**
See skill: `.agent/skills/add-app-integration.md`

### 3. **Output Format**
Every activity function returns `(map[string]any, string, error)`:
- `map[string]any` — structured output with at least `status`, `data`, `meta.duration_ms`
- `string` — human-readable step log message
- `error` — nil on success

```go
// Standard output shape
outputs := map[string]any{
    "status": 200,
    "data":   out,
    "meta": map[string]any{
        "duration_ms": duration.Milliseconds(),
    },
}
```

### 4. **Credential Loading**
Always use `loadCredentialPayload(ctx, deps, credentialID)` — never bypass this helper.
Always verify `cred.Provider` matches the expected app name.

### 5. **Action Routing**
Use `switch strings.ToLower(action)` with lowercase dot-notation keys, e.g. `"slack.sendmessage"`.
Always include a `default` case returning an error for unsupported actions.

### 6. **Retry Policies**
Configure retry in the workflow definition, not in individual activities.
Linear backoff is preferred for external API calls.

---

# 🔌 WEBSOCKET / REALTIME RULES

### 1. **Interface**
All broadcast calls go through `ports.RealtimeService` — never call the websocket hub directly.

### 2. **Channel Naming Convention**
```
runs.<runId>          # Run status updates
runs.all              # All run updates (dashboard)
flows.<flowId>        # Flow-level events
system                # System-wide broadcasts
```

### 3. **Message Format**
All WebSocket messages follow this envelope:
```json
{
  "channel": "runs.<runId>",
  "payload": { ... }
}
```

### 4. **Frontend Hook**
Use `useWebSocket()` from `web/src/hooks/use-websocket.ts` — subscribe by channel name.
Unsubscribe on component unmount (hook returns unsubscribe function).

### 5. **No `any` in Payloads**
Define TypeScript types for every payload shape. Do not use `payload: any`.

---

# 🗄️ DATABASE / MIGRATION RULES

### 1. **Migration Naming**
```
api/internal/migrations/<NNNN>_<description>.sql
```
- `NNNN` = zero-padded sequential number (e.g., `0017_`, `0018_`).
- `description` = snake_case, concise (e.g., `add_run_step_retries`, `variables_user_optional`).

### 2. **Migration Content**
- Always include both `-- +goose Up` and `-- +goose Down` sections (Goose format).
- Migrations must be **idempotent**: use `IF NOT EXISTS` / `IF EXISTS`.
- Never drop columns in a single migration without a deprecation period.

### 3. **Repository Pattern**
- Repository interfaces live in `internal/core/ports/repositories.go`.
- Implementations live in `internal/adapters/database/postgres/<entity>_repository.go`.
- All queries use parameterized statements — **no string concatenation for SQL**.

---

# 🧪 TESTING RULES

### 1. **Unit Tests (Go)**
- Table-driven tests for all service/domain logic.
- Use `testify/assert` or standard `testing` package.
- File: `<filename>_test.go` co-located with source.

### 2. **Unit Tests (Frontend - Vitest)**
- Tests co-located in `__tests__/` next to the hook/component.
- Use `@testing-library/react` for component tests.
- Mock Zustand stores, not internal hook state.

### 3. **E2E Tests (Playwright)**
- Tests in `web/e2e/`.
- Config: `web/playwright.config.ts`.
- Each major user flow (auth, dashboard, run) must have an E2E test.
- Test must pass before merging to `master`.

### 4. **Test Data**
- Never use production credentials in tests.
- Use fixtures / mock data only.

---

# 🎨 FRONTEND RULES (Next.js / React)
Primary Stack: **Next.js 14+** (App Router), **Tailwind CSS**, **Zustand**.

### 1. **Shared Components Only**
- ❌ **BAN**: Direct HTML tags (`<button>`, `<input>`, `<textarea>`, `<select>`) in feature components.
- ✅ **USE**: Shared Components from `src/components/ui/` only.
- If a component is missing, create it in `src/components/ui/` first.

### 2. **Hook Separation**
- ❌ **BAN**: Hooks (`useState`, `useEffect`) directly inside UI components.
- ✅ **USE**: Dedicated hooks in `hooks/use-xxx.ts`.
- Rule: 1 File = 1 Hook. Components are responsible for rendering only.

### 3. **Clean Code Constraints**
- **File Size**: Max **150 lines**. Split component if larger.
- **Extraction**: If JSX/Logic is used 2+ times → extract to Shared Component or Custom Hook.
- **Pages**: `page.tsx` should only compose components, no logic.

### 4. **File Structure (Frontend)**
```
web/src/
├── app/                     # Next.js pages & routing
├── components/ui/           # Shared primitives
│   ├── data-display/        # Card, Table, Text, Icon
│   ├── forms/               # Button, Input, Select
│   ├── feedback/            # Badge, Skeleton, Toast
│   ├── overlay/             # Modal, Dropdown, Tooltip
│   └── index.ts             # Barrel export
├── features/[feature]/      # Feature modules
│   ├── components/          # Feature-specific components
│   ├── hooks/               # Feature-specific hooks
│   ├── services/            # API clients (e.g., runsApi.ts)
│   └── index.ts             # Barrel export
├── hooks/                   # Global shared hooks (use-websocket.ts etc.)
├── lib/                     # Utilities, env, constants
├── stores/                  # Zustand global stores
└── types/                   # Shared TypeScript types (dto.ts etc.)
```

### 5. **State Management Hierarchy**
- **Server State** (React Query / fetch) > **URL State** (Search Params) > **Global UI** (Zustand) > **Local** (`useState`).
- Only sidebar/theme/UI preferences belong in Zustand. Do NOT cache API data in Zustand manually.

### 6. **Node Catalog (Workflow Builder)**
- New app integrations require a catalog entry in `web/src/features/builder/nodeCatalog/apps/<appname>.ts`.
- Register the app in `web/src/features/builder/nodeCatalog/catalog.ts`.
- `actionKey` format: `<app>.<camelCaseAction>` (e.g., `slack.sendMessage`).

---

# 🎨 UI/UX DESIGN RULES

> Full design system reference: `.agent/skills/design-ux.md` — use it before designing any new UI.

### 1. **Design Token First**
- ❌ **NEVER** hardcode colors, shadows, or radii (e.g., `text-[#0099ff]`, `rounded-[8px]`)
- ✅ **ALWAYS** use CSS var tokens via Tailwind classes: `bg-accent`, `text-muted`, `border-border`, `shadow-soft`, etc.
- Light & dark mode are automatic — tokens handle both via `[data-theme="dark"]`

### 2. **Color Usage Hierarchy**
```
bg-bg         → outermost page background
bg-panel      → sidebar, topbar, drawer
bg-surface    → cards, modals, inputs
bg-surface2   → nested sections, code blocks
text-text     → primary content
text-muted    → labels, secondary info, placeholders
border-border → all borders and dividers
bg-accent     → primary CTA, links, active states (use sparingly)
```

### 3. **Spacing — 8px Grid**
- Use only multiples of 4px for spacing. Preferred: `gap-2`, `gap-3`, `gap-4`, `gap-6`, `p-4`, `p-5`, `p-6`, `p-8`
- ❌ No arbitrary spacing: `mt-[13px]`, `px-[7px]`

### 4. **Typography Scale**
| Element | Class |
|---|---|
| Page title | `text-xl font-semibold` |
| Section title / modal header | `text-base font-semibold` |
| Body / card content | `text-sm` |
| Secondary / descriptions | `text-sm text-muted` |
| Labels / captions | `text-xs text-muted` |
| Code / IDs | `font-mono text-sm` |

### 5. **Elevation & Shadows**
- `shadow-soft` → cards, panels (default)
- `shadow-lift` → modals, dropdowns, popovers (floating)
- `shadow-focus` → focus ring on inputs/buttons (always with `focus:outline-none`)
- Never use raw Tailwind `shadow-md` or `shadow-lg` — breaks dark mode consistency

### 6. **Component Usage Rules**
| Element | Required component |
|---|---|
| Any button | `<Button variant="...">` |
| Text input | `<Input />` |
| Textarea | `<Textarea />` |
| Card/surface | `<Panel>` |
| Modal/dialog | `<Modal>` |
| Status label | `<Badge tone="...">` |
| Page header | `<PageHeading>` |
| Icon action | `<IconButton icon="...">` |

### 7. **New Feature / Page Layout Template**
```tsx
<div className="min-h-screen bg-bg">
  <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
    <PageHeading title="..." description="..." actions={...} />
    <div className="mt-6 space-y-6">
      {/* panels / grids */}
    </div>
  </div>
</div>
```

### 8. **Before Building Any UI**
Use skill `.agent/skills/design-ux.md` and verify:
- [ ] Color tokens used (no hardcoded hex)
- [ ] Spacing on 8px grid
- [ ] Correct shadow for elevation level
- [ ] Mobile layout (`md:` breakpoint minimum)
- [ ] Loading + empty states defined
- [ ] Both light & dark mode considered

---

# 📁 FOLDER ORGANIZATION RULES (All Stacks)

> **Key principle**: If 3+ files serve the same purpose → create a sub-folder.

| Condition | Action |
|-----------|--------|
| 3+ files ที่ทำหน้าที่คล้ายกัน | ✅ สร้าง sub-folder |
| Files share common prefix (mock_, stub_) | ✅ สร้าง sub-folder |
| Files are domain-related | ✅ Group by domain |
| Only 1-2 files | ❌ ไม่ต้องสร้าง folder |

- **Naming**: Folders use plural form (e.g., `loaders/`, `mocks/`, `services/`).
- **Barrel Exports**: Always create `index.ts` (TS) for re-exports.
