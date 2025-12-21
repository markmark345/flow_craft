# PROMPT: Audit & Implement Missing Actions (FE + BE) Across FlowCraft

Repo root:
C:\Users\Mark\OneDrive\Documents\Projects\flowcraft

Context:

- FlowCraft is a workflow automation platform (n8n-like)
- Frontend: Next.js (App Router) + Tailwind + Zustand
- Backend: Go + PostgreSQL + Temporal
- Many screens exist visually (Dashboard, Flows, Builder, Runs, Settings)
- Some buttons, menus, and interactions are currently UI-only (no real action)

Goal:
Systematically audit the entire application and implement ALL missing actions so the app behaves like a real, usable product.

This is NOT a redesign task.
This is NOT a mock task.
This is a functional completion task.

---

## A) Global Audit (READ FIRST)

Scan the repository and identify:

- Pages
- Buttons
- Menus
- Dropdown actions
- Empty click handlers
- TODO / placeholder comments
- Components that render UI but do not trigger logic

Focus especially on:

- Dashboard
- Flows List
- Flow Builder
- Run History
- Run Detail
- Settings
- Context menus (⋯)
- Primary / secondary CTA buttons

For each missing action, determine:

- What the expected real behavior should be
- Whether FE-only is acceptable or BE support is required

---

## B) Expected Behavior Matrix (USE THIS LOGIC)

For each UI action, implement according to this matrix:

### Navigation actions

- Must route using Next.js router
- No dead buttons allowed

### Create / Update / Delete actions

- Must call backend API
- Must show loading state
- Must show success / error toast
- Must update local Zustand store

### Run / Execute actions

- Must call backend (Temporal trigger)
- Must create run record
- Must update run status
- Must redirect to run detail when appropriate

### Settings / Preferences

- If backend endpoint exists → persist to backend
- If not → persist locally (localStorage or Zustand persist)
- Code must be ready to switch to backend later

---

## C) Pages to Audit & Fix (MANDATORY)

### 1) Dashboard

Audit:

- "New Flow" button
- "View all flows"
- Flow cards (click)
- Activity feed items
- Templates / Documentation links

Implement:

- Navigation to correct pages
- Real data from backend (recent flows, recent runs)
- Empty states if no data

---

### 2) Flows List (`/flows`)

Audit:

- Row click
- Open
- Run
- Duplicate
- Delete / Archive
- Filters / search inputs

Implement:

- Real list from backend
- Row actions wired to API
- Confirm dialogs for destructive actions
- Toast feedback

---

### 3) Flow Builder (`/flows/[id]/builder`)

Audit:

- Save button
- Run button
- Flow name edit
- Node add / delete
- Node config changes
- Notes panel
- Logs drawer

Implement:

- Save → persist definition_json
- Run → POST /flows/:id/run
- Update dirty/saved state
- Logs loading for active run
- Prevent silent failures

---

### 4) Run History (`/runs`)

Audit:

- Row click
- Filters
- Status badges
- Refresh action

Implement:

- Load from backend
- Click → navigate to run detail
- Manual refresh
- Empty state

---

### 5) Run Detail (`/runs/[id]`)

Audit:

- Log viewer
- Status refresh
- Retry / Rerun button (if present)

Implement:

- Load run detail from backend
- Poll or refresh logs
- Show structured execution steps if available
- Proper error handling

---

### 6) Settings

Audit:

- Workspace name save
- Theme toggle
- Profile actions
- Danger zone actions

Implement:

- Persist settings (backend or local)
- Toast feedback
- Confirmation modals
- No-op actions must be replaced or clearly marked

---

## D) Backend Gaps (IMPLEMENT ONLY IF REQUIRED)

If frontend requires an endpoint that does not exist:

- Implement minimal backend support
- Follow existing clean architecture:
  - handler
  - service
  - repository
  - entity
- Do NOT over-design
- Use existing database tables or add minimal columns if needed

Examples:

- duplicate flow
- archive flow
- rerun flow
- list recent activity

---

## E) Code Quality Rules (STRICT)

- No duplicated API calls
- No logic inside UI components
- All async logic must live in hooks/services
- Zustand stores are the single source of truth
- All buttons must have a real effect or a toast explaining why not

---

## F) Final Output

After implementation:

1. List all UI actions that were previously missing and are now implemented
2. List any actions intentionally left unimplemented (with reason)
3. Provide a manual test checklist:
   - Create flow
   - Edit & save
   - Run
   - View run history
   - Open run detail
   - Change settings

Proceed now.
