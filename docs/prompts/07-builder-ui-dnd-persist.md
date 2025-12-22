# PROMPT: Flow Builder UI Polish + Drag&Drop Nodes + Persist to DB (Real Working)

Repo root:
(this repo)

Context:

- Frontend: Next.js (App Router) + Tailwind + Zustand
- React Flow is installed and used for builder canvas
- Theme tokens exist (light white + dark deep navy + neon accents)
- Backend exists (Go + Postgres + Temporal) with flows table holding definition_json (jsonb)
- API base: NEXT_PUBLIC_API_BASE_URL (default http://localhost:8080/api/v1)

Goal:

1. Make Builder page UI polished for BOTH light and dark modes (use tokens, subtle neon gradients).
2. Implement Drag & Drop nodes from Palette -> Canvas using React Flow.
3. Persist/load flow definition (nodes, edges, viewport, notes) to/from backend DB via real API.
4. Ensure architecture separation: UI components are presentational; logic in hooks/stores/services.
5. No duplicated logic.

---

## A) Builder page route contract

Assume route exists like: `/flows/[id]/builder`
If not, create it.

On mount:

- Load flow by id from API.
- Hydrate builder store with nodes/edges/viewport/notes.
- Show loading skeleton.
- Handle error (toast).

On Save:

- Serialize current builder state to definition_json
- PUT /flows/:id
- Toast success.

---

## B) Data model for definition_json

Use a stable JSON shape:

{
"version": 1,
"reactflow": {
"nodes": ReactFlowNode[],
"edges": ReactFlowEdge[],
"viewport": { "x": number, "y": number, "zoom": number }
},
"notes": StickyNote[]
}

StickyNote:

- id: string
- x: number
- y: number
- width: number
- height: number
- color: "yellow" | "pink" | "blue"
- text: string
- collapsed: boolean

---

## C) API integration (frontend)

Implement or update flows service in:

- `web/src/features/flows/services/flowsApi.ts` (or existing services folder)

Methods:

- getFlow(id): GET /flows/:id
- updateFlow(id, payload): PUT /flows/:id
- createFlow(payload): POST /flows (if needed)

Ensure fetch wrapper uses env base URL and handles errors.

---

## D) Backend endpoints (if not already compatible)

Ensure backend supports:

- GET /api/v1/flows/:id -> returns definition_json
- PUT /api/v1/flows/:id -> updates name/status/version/definition_json

If backend scaffold differs, update minimal handlers/services/repos to store definition_json in Postgres.
No over-engineering; must work.

---

## E) Drag & Drop Node Palette -> Canvas (React Flow)

Implement DnD pattern:

- Palette items are draggable (dataTransfer contains node type + label).
- Canvas handles onDragOver (preventDefault) and onDrop:
  - compute drop position using React Flow instance/project
  - create new node with unique id, type, position, and default data
  - add to zustand store

Important:

- Use a single ReactFlow node renderer: nodeTypes must include `{ flowNode: FlowNode }`.
- Every serialized node should have `node.type = "flowNode"` and store its real type in `node.data.nodeType` (prevents "node type not found" warnings).

Provide at least these node types:
Triggers:

- httpTrigger
- webhook
- cron
  Actions:
- httpRequest
- transform
- database
  Utilities:
- delay
- if
- merge
- switch

Node UI can be same base style for now, but should look polished.

Nice-to-have (n8n-like):

- Node card shows: icon, label, short description, category pill.
- Triggers have output handle only (no input).
- `if` has two outputs ("true"/"false").
- Each node has a quick-add "+" button that opens a small node picker (search + categories). Selecting an item adds a new node to the right and auto-connects.
- If condition editor should accept input paths (example: `input.data.name` or `{{data.name}}`). Right-side values are literal unless wrapped in `{{...}}` or prefixed with `input.`.
- If conditions can reference other steps via `steps.<nodeId>.data.<field>` (node id shown in the inspector). Merge node combines outputs from previously executed steps for downstream use.

---

## F) UI Polish (Builder layout)

Improve builder layout:

- Left: NodePalette with search, categories, hover states, active drag state
- Top: BuilderTopBar with:
  - editable flow name (debounced update in store)
  - Save button (primary, neon glow hover)
  - Run button (secondary)
  - status indicator (dirty/saved)
- Center: Canvas with dotted grid background (subtle) + minimap + controls
- Right: Inspector panel tabs (Node Config, Inputs/Outputs, Notes)
  - Node Config form is dynamic based on node type (fields defined in a node catalog; edits update `node.data.config`)
- Bottom: Logs drawer collapsible with resize handle
- Use gradients subtly:
  - Top bar highlight line
  - Active tab underline gradient
  - Active palette category indicator
- Must look good in light + dark.

---

## G) Store & logic separation

Use existing builder zustand store or create:

- `web/src/features/builder/store/useBuilderStore.ts`

State:

- flowId, flowName
- nodes, edges
- viewport
- notes
- selectedNodeId
- dirty boolean
  Actions:
- setFlowName
- setNodes/setEdges
- addNode/addEdge
- setViewport
- hydrateFromDefinition
- serializeDefinition
- markDirty/markSaved

Hooks:

- `useBuilderLoad(flowId)`
- `useBuilderSave(flowId)`
- `useNodeDnD()` (palette + canvas handlers)

UI components should call hooks/actions but not contain serialization logic.

---

## H) Persistence UX

- Auto-set dirty=true on any edit (nodes/edges/name/notes)
- Save sets dirty=false on success
- Show toast on save success/fail
- Optional: warn before leaving page if dirty (simple beforeunload + route change if feasible)

---

## I) Deliverables

Apply changes directly to repository.
Create/modify necessary files under:

- `web/src/features/builder/**`
- `web/src/features/flows/services/**`
- `api/**` only if needed to store/return definition_json properly

After completion print:

- Created files
- Modified files
- How to test steps:
  1. Create flow
  2. Redirect to builder
  3. Drag nodes
  4. Save
  5. Refresh page and see nodes persist

Proceed now.
