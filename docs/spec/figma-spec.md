# FlowCraft UI/UX Spec (Figma-first)

## Product
- Name: FlowCraft
- Type: Visual workflow / automation builder (similar to n8n)
- Primary Users: Developers, automation builders, internal platform teams

## Design Principles
- Developer-tool aesthetic (clean, sharp, minimal)
- High information density but readable
- Fast interactions, low friction
- Grid-based layout, resizable panels

## Layout Zones (Flow Builder)
- Left Sidebar: Node palette
- Top Bar: Flow controls
- Center Canvas: Infinite grid (React Flow), zoom, minimap, context menu; supports nodes, edges, sticky notes
- Right Sidebar: Inspector with tabs (Node Config, Inputs/Outputs, Notes)
- Bottom Drawer: Execution logs (collapsible), appears on run

## Design Tokens
- Colors (Light / default):
  - bg: #ffffff
  - panel: #f7f8fb
  - surface: #ffffff
  - surface-2: #f2f4f8
  - border: #e6e8f0
  - text: #0b1220
  - muted: #5a6477
  - accent: #00d4ff
  - accent-strong: #00a8ff
  - success: #22ff88
  - warning: #ffd400
  - error: #ff3b7a
  - grid: rgba(11,18,32,0.06)
- Colors (Dark):
  - bg: #070a12
  - panel: #0c1220
  - surface: #0f1730
  - surface-2: #121c38
  - border: rgba(255,255,255,0.08)
  - text: #e7eefc
  - muted: rgba(231,238,252,0.68)
  - accent: #00e5ff
  - accent-strong: #00b8ff
  - success: #3dff9a
  - warning: #ffe066
  - error: #ff4d8d
  - grid: rgba(255,255,255,0.06)
- Gradients:
  - grad-accent: linear-gradient(90deg, accent → error → success)
  - grad-accent-soft: subtle cyan highlight for topbar/active states
- Spacing (8px base): 4, 8, 12, 16, 20, 24, 32, 40, 48, 64
- Radius: xs 4, sm 6, md 8, lg 12, pill 999
- Shadows:
  - soft: 0 1 2 rgba(10,20,40,0.06) (light) / 0 1 2 rgba(0,0,0,0.5) (dark)
  - lift: 0 10 30 rgba(10,20,40,0.12) (light) / 0 18 50 rgba(0,0,0,0.55) (dark)
  - focus: 0 0 0 3 rgba(0,212,255,0.28) (light) / 0 0 0 3 rgba(0,229,255,0.22) (dark)
  - glow-accent/error/success: soft neon glows for primary accents
- Typography:
  - Display 28/34 semi-bold
  - H1 22/28 semi-bold
  - H2 18/24 semi-bold
  - H3 16/22 semi-bold
  - Body 15/22 regular
  - Mono 14/20 medium

## Screens (Desktop 1440px)
- Dashboard: Recent flows cards, activity list, templates shortcuts, global top bar with org switcher/search/user menu.
- Flows List: Table (Name, Status, Last Run, Owner, Updated) with New Flow, Import, Filters; row quick actions.
- Projects: Personal vs Project scope; project switcher; project settings (members, roles, danger zone).
- Flow Builder (Main): Top bar (name, status badge, Save, Run, version dropdown, undo/redo); left palette with search + categories; center canvas with grid/zoom/minimap/context menu; right inspector tabs; bottom logs drawer on run.
- Run History: Filterable list of runs (status/timeframe/flow) with summary fields; selecting opens detail.
- Run Detail: Timeline of steps with status, pane showing inputs/outputs/logs/errors; rerun button; highlights node.
- Settings: Tabs (Workspace, Integrations, Tokens, Preferences) with two-column forms where applicable.

## Components
- Button (primary/secondary/ghost/danger)
- Sidebar item
- Node card (trigger/action/utility, disabled, error)
- AI Agent node (attachments: Chat Model* required, Memory optional, Tools optional + multi)
- Chat Model providers (OpenAI / Gemini / Grok) selectable in the AI Agent inspector (not standalone canvas nodes)
- Inspector panel
- Tabs
- Toast notification
- Modal dialog
- Status badge
- Data table
- Sticky Note (resizable, color variants, non-executable)
- App integrations (via unified "Action in an app" node), including Bannerbear actions (create/get images, list/get templates)
- App Action setup wizard (App → Action → Credential → Configure → Test → Review)

## Interaction Notes
- Drag/drop nodes from palette; snap to grid; right-click node (duplicate, disable, delete, add note).
- Nodes use a unified "flowNode" renderer (n8n-like): icon, label, description, category pill, input/output handles.
  - Triggers: output handle only (no input).
  - If: two outputs (true/false) + quick-add default connects to "true".
- Quick-add "+" appears on hover/selected; opens node picker with search; selecting adds a node to the right and auto-connects.
- AI Agent shows attachment slots under the node: Chat Model (required), Memory (optional), Tools (optional, multi).
  - Attachments are configured via the agent Inspector/Wizard and do not appear as separate executable steps.
- App Action wizard action selection is grouped by category with a search box and an "Actions (N)" counter; disabled items show "Coming soon" and triggers are marked as "Trigger".
- Merge: utility node to combine outputs from previously executed steps into a single payload.
- If condition fields accept input paths (example: `input.data.name` or `{{data.name}}`). Right-side values are literal unless wrapped in `{{...}}` or prefixed with `input.`.
- If conditions can also reference other step outputs via `steps.<nodeId>.data.<field>` (use the node code shown in the inspector).
- Zoom + fit-to-screen; minimap drag to pan.
- Sticky notes are free-form, color selectable, not part of execution; show title/body + last edited user/time; resizable and movable.
- Save debounced with toast; Run opens logs drawer streaming lines; clicking a log focuses node.
- Undo/redo for canvas edits; version dropdown supports switching/cloning with unsaved-change prompt.
- Run detail auto-scrolls inspector; errors expanded by default.
- Settings forms support autosave toggle; destructive actions confirm via modal.

## Engineering Notes
- Frontend: separate UI components from logic (hooks) per feature folder; keep large pages as composition shells.
  - Example: project settings page uses `useProjectSettings()` and small cards (info/members/danger/docs).
- Backend: Temporal node implementations are split by concern (app dispatch, Gmail, Sheets, GitHub, shared utils).

## Testing (Unit)
- API: `cd api` then `go test ./...`
- Web (pure TS utilities): `cd web` then `pnpm test` (runs `node --test test`)

## Microcopy
- Empty states: "No flows yet. Create your first automation." / "No runs found for this filter." / "Drag a node here to start building." / "No logs yet. Run the flow to see execution output."
- Toasts: "Saved changes." / "Run started…" / "Run succeeded." / "Run failed. Check logs." / "Version switched."
