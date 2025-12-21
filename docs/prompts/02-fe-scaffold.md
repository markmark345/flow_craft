# CONTEXT (MUST FOLLOW)

Use UI/UX spec from: docs/figma-spec.md
Match layout zones: Left Sidebar (node palette), Top Bar, Canvas (React Flow), Right Inspector (tabs), Bottom Logs Drawer.
Use the design tokens (colors/spacing/radius/typography) as CSS variables and Tailwind config where possible.

# PROMPT: Frontend Scaffold (Next.js App Router + Tailwind) with clean separation

You are a senior frontend engineer. Generate ONLY a scaffold for the frontend.
Implement UI aligned with docs/figma-spec.md.
Key requirement: separate UI (presentational) from logic (hooks/stores/services) to avoid duplicated code.

## Tech

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- React Flow for canvas
- Global state: Zustand (MUST)
- Data fetching: simple fetch wrapper + React hooks (no heavy libs needed)
- Package manager: pnpm

## Architectural Rules (IMPORTANT)

1. NO business logic inside page components except wiring.
2. Separate layers:
   - UI components: dumb/presentational (props-in, events-out)
   - Logic: hooks (useX), stores (zustand), services (api client)
3. Avoid duplication:
   - common layout components
   - reusable UI primitives
   - shared hooks for loading/error handling
4. Provide a clean module structure: feature-based + shared.

## Project Structure (MUST match)

/web
/app
/(main)
layout.tsx
page.tsx # dashboard
flows/page.tsx
flows/new/page.tsx
flows/[id]/page.tsx
runs/page.tsx
runs/[id]/page.tsx
settings/page.tsx
/api # (optional) next route handlers - keep minimal or omit
globals.css
/src
/features
/flows
/components # presentational
/hooks # logic hooks
/store # zustand slices or feature store
/types # feature types
/runs
/components
/hooks
/store
/types
/builder
/components # ReactFlow Canvas, Palette, Inspector, Topbar, LogsDrawer, StickyNote
/hooks # builder logic (selection, undo/redo, serialization)
/store # zustand for editor state (nodes/edges/notes)
/types
/shared
/components # Button, Input, Tabs, Modal, Toast, Table, Badge, Panel
/hooks # useToast, useDebounce, useHotkeys, useMounted
/lib # fetcher, classnames, env, constants
/styles # tokens (css vars)
/types # shared DTOs
/public
tailwind.config.ts
postcss.config.js
next.config.js
tsconfig.json
.env.example
README.md
package.json

## State Management (Zustand)

- Create a root store pattern or multiple stores:
  - useAppStore: global UI (theme, sidebar collapsed, toasts queue)
  - useFlowsStore: flows list/detail cache
  - useRunsStore: runs list/detail cache
  - useBuilderStore: editor state (nodes, edges, notes, selectedId, dirty flag, history stack)
- Provide selectors and actions to avoid rerenders.
- Add persistence ONLY for builder draft (optional) using localStorage middleware (but keep minimal).

## API Integration

- base URL from env: NEXT_PUBLIC_API_BASE_URL
- Implement /src/shared/lib/fetcher.ts with:
  - request<T>(path, options)
  - error normalization
  - timeout
- Implement /src/shared/lib/env.ts to read env safely
- Create /src/shared/types/dto.ts for FlowDTO, RunDTO

## Pages wiring (NO logic duplication)

Each page under /app should:

- render a feature container component
- container uses hooks/stores
- UI components remain presentational

Example:

- /app/(main)/flows/page.tsx -> <FlowsPage />
- FlowsPage (feature container) uses useFlowsQuery hook + store
- FlowsTable presentational displays data and emits events

## Flow Builder Requirements (scaffold-level)

- Builder page uses feature container: BuilderPageContainer
- Presentational components:
  - BuilderTopBar
  - NodePalette
  - Canvas (React Flow wrapper)
  - Inspector (tabs)
  - LogsDrawer
  - StickyNote
- Logic in hooks/stores:
  - useBuilderActions (addNode, connect, delete, duplicate, toggleDisable, setSelected)
  - useBuilderHistory (undo/redo)
  - serialize/deserialize flow definition (shared lib)
- Include toasts + confirm modal (shared components)

## Styling

- Use CSS variables from figma spec tokens in globals.css (light/dark)
- Tailwind consumes variables (e.g., bg-[var(--bg)] etc.)
- Keep component styles minimal but consistent.

## Deliverable Format

Return:

1. File Tree
2. Each file with:
   - ## path
   - code block content

Do not add backend code. Keep logic minimal but runnable. UI must render even if API is down (mock fallback in services).

