# PROMPT: Implement All Pages with Real Backend Calls (FlowCraft)

Repo root:
(this repo)

Context:

- Frontend: Next.js (App Router) + Tailwind + Zustand
- Backend: Go + Postgres + Temporal (API base /api/v1)
- Some pages are currently UI-only (buttons do nothing, lists are mocked, etc.)
- Shared systems exist or should exist:
  - fetcher wrapper
  - toast system
  - theme store
  - feature-based structure (features/flows, features/runs, features/builder)
- Requirement: keep separation of concerns (UI vs logic vs services) and avoid duplicated code.

Goal:
Implement missing functionality across ALL existing pages so that user actions call the real backend.
Use consistent UX patterns: loading states, empty states, error handling, toasts, and optimistic UI where appropriate.

---

## A) Inventory routes and components (READ + MAP)

Scan the Next.js routes under:

- `web/app/**`

Identify these pages (or their equivalents):

- Dashboard
- Flows list: `/flows`
- New flow: `/flows/new`
- Flow builder: `/flows/[id]/builder` (if present)
- Run history list: `/runs`
- Run detail: `/runs/[id]`
- Settings: `/settings`

For each page, list:

- what data it needs
- what actions exist (buttons/links/forms)
- which are currently not implemented

Then implement accordingly.

---

## B) Standardize API layer (CREATE/UPDATE)

Ensure these service files exist (or equivalent):

- `web/src/features/flows/services/flowsApi.ts`
- `web/src/features/runs/services/runsApi.ts`

Each service MUST use shared fetcher from:

- `web/src/shared/lib/fetcher.ts`

Service methods (minimum):

### flowsApi

- listFlows(params?): GET /flows
- getFlow(id): GET /flows/:id
- createFlow(payload): POST /flows
- updateFlow(id, payload): PUT /flows/:id
- deleteFlow(id): DELETE /flows/:id (if backend supports; if not, implement archive via status)

### runsApi

- listRuns(params?): GET /runs
- getRun(id): GET /runs/:id
- runFlow(flowId): POST /flows/:id/run

If backend responses differ, adapt in services only (do not spread response mapping across UI).

---

## C) Standardize hooks layer (CREATE/UPDATE)

Create or update hooks for each feature:

- `web/src/features/flows/hooks/useFlowsList.ts`
- `web/src/features/flows/hooks/useFlowDetail.ts`
- `web/src/features/flows/hooks/useCreateFlow.ts`
- `web/src/features/flows/hooks/useUpdateFlow.ts`
- `web/src/features/runs/hooks/useRunsList.ts`
- `web/src/features/runs/hooks/useRunDetail.ts`
- `web/src/features/runs/hooks/useRunFlow.ts`

Rules:

- Hooks handle async, loading, error normalization.
- Hooks DO NOT contain UI layout.
- Hooks use Zustand stores for caching where appropriate.

---

## D) Zustand stores (CREATE/UPDATE)

Ensure these stores exist:

- `web/src/features/flows/store/useFlowsStore.ts`
- `web/src/features/runs/store/useRunsStore.ts`

Responsibilities:

- cache lists/details
- store selected entities
- provide actions to update cache on create/update/delete/run

Avoid duplication:

- shared pagination helper / types in `web/src/shared/lib/pagination.ts`

---

## E) Page implementations (MODIFY)

Implement each page to use hooks + services:

### 1) Dashboard

- Show recent flows (top 5) from listFlows
- Show recent runs (top 5) from listRuns
- Show empty states when none
- Provide quick actions: "New Flow" and "Run last flow" (optional)

### 2) Flows list `/flows`

- Load list from BE
- Search/filter (client-side ok initially)
- Actions per row:
  - Open -> route to builder
  - Duplicate -> (optional) createFlow with copied definition
  - Delete/Archive -> call BE (or update status)
- Confirm modal for destructive action
- Toast on success/failure

### 3) New flow `/flows/new`

- Create flow via BE
- Toast success
- Redirect to builder `/flows/:id/builder`

### 4) Builder `/flows/[id]/builder`

- Load flow definition from BE
- Save flow definition to BE
- Run button -> calls POST /flows/:id/run
- After starting run:
  - toast "Run started"
  - optionally redirect to run detail `/runs/:runId`

### 5) Runs list `/runs`

- Load runs from BE
- Filter by status/timeframe (client-side ok)
- Click row -> run detail

### 6) Run detail `/runs/[id]`

- Load run detail from BE
- Show status, timestamps, log output
- Refresh button to reload

### 7) Settings `/settings`

- Workspace name:
  - If no backend endpoint exists, persist locally (localStorage) but keep the code ready to swap to BE later
- Theme:
  - use theme store (already)
- Show toast on save

---

## F) UX Consistency (MUST)

Use shared components and patterns:

- Loading skeletons
- Empty states
- Error states with retry
- Toast success/error for mutations
- Disable buttons while submitting
- Never leave buttons "dead" (no-op)

If Toast system not present, create a minimal one and mount globally in layout.

---

## G) Backend alignment (ONLY if necessary)

If backend lacks any required endpoint:

- Implement minimal handlers/services/repos to support:
  - list flows
  - get flow
  - update flow (definition_json)
  - list runs
  - get run
  - run flow (create run + start temporal workflow)

Do not overbuild; just make it work.

---

## H) Output

Apply changes directly to the repository.
After finishing, output:

1. Created files
2. Modified files
3. Manual test plan:
   - Create flow
   - Open builder and save
   - Start run
   - See run in runs list and open detail

Proceed now.

