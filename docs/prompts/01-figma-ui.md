# PROMPT: Figma-first UI/UX for FlowCraft (n8n-like)

You are a senior product designer and UX architect.
Design the UI BEFORE any code. This output will be used to manually recreate the UI in Figma.

## Product

Name: FlowCraft  
Type: Visual workflow / automation builder (similar to n8n)

Primary users:

- Developers
- Automation builders
- Internal platform teams

## Design Principles

- Developer-tool aesthetic (clean, sharp, minimal)
- High information density but readable
- Fast interactions, low friction
- Grid-based layout, resizable panels

## Screens (Desktop 1440px)

1. Dashboard
2. Flows List
3. Flow Builder (MAIN SCREEN)
4. Run History
5. Run Detail
6. Settings

---

## Flow Builder - Core Layout (Most Important)

### Layout Zones

- Left Sidebar: Node Palette
- Top Bar: Flow controls
- Center: Canvas
- Right Sidebar: Inspector
- Bottom Drawer: Execution logs (collapsible)

### Left Sidebar (Node Palette)

- Search input
- Categories:
  - Triggers
  - Actions
  - Utilities
- Draggable node items

### Top Bar

- Editable Flow Name
- Status badge (Draft / Active)
- Buttons: Save, Run
- Version dropdown
- Undo / Redo icons

### Canvas

- Infinite grid
- Zoom controls
- Minimap (bottom-right)
- Right-click context menu
- Supports:
  - Nodes
  - Edges
  - Sticky Notes (like n8n)

### Sticky Notes

- Free text
- Resizable
- Color selectable
- Collapse / expand
- Not part of execution

### Right Sidebar (Inspector)

Tabs:

1. Node Config
2. Inputs / Outputs
3. Notes

### Bottom Drawer

- Appears when flow is running
- Shows execution logs in real time
- Each step expandable

---

## Components to Define

- Button (primary / secondary / ghost / danger)
- Sidebar item
- Node card (trigger, action, disabled, error)
- Inspector panel
- Tabs
- Toast notification
- Modal dialog
- Status badge
- Data table
- Sticky Note

---

## Design Tokens

Define:

- Colors (light + dark)
- Spacing (8px system)
- Border radius
- Shadows
- Typography scale

---

## Output Format

Return ONLY:

1. Design tokens
2. App navigation structure
3. Screen-by-screen spec
4. Component specs
5. Interaction notes
6. Microcopy (labels, empty states, toasts)

Do NOT generate code.

