# PROMPT: Redesign App Action Node + AI Agent Node UI (n8n-style, scalable)

Repo root:
C:\Users\Mark\OneDrive\Documents\Projects\flowcraft

Context:

- FlowCraft is an n8n-like workflow builder
- Uses React Flow for canvas
- Frontend: Next.js App Router + Tailwind + Zustand
- Nodes: App Action + AI Agent

## Goals

- One unified App Action node (app.action) that supports all apps/actions
- AI Agent node uses attachable sub-nodes: Model (required), Memory (optional), Tools (optional, multi)
- Works in Light + Dark
- Avoid breaking existing flow schema

---

## PART 1 — App Action Node (Unified)

### Concept

There is only ONE canvas node type:

type: "app.action"

This node can represent:

- Google Sheets → Append row / Create sheet / Delete sheet / Update row / etc
- Gmail → Send email
- GitHub → Create issue
- Bannerbear → Create image
- more in the future

### Visual Design (n8n-inspired)

- Rounded card (16px radius)
- Left: app icon
- Title: action name
- Subtitle: app name
- Status badge: error if missing credential/config
- Ports: left input, right output
- Do not show technical IDs

### Wizard / Inspector (step-based)

1. Select App (searchable list, official icons)
2. Select Action (grouped categories)
3. Select Credential (reusable)
4. Configure Fields (schema-driven, required markers)
5. Test (optional)
6. Save

### Data structure

Node data must store app, action, credentialId, config.

---

## PART 2 — AI Agent Node (n8n-style)

### Concept

AI Agent is a container node that:

- requires Chat Model
- can attach Memory
- can attach multiple Tools
  Model/Memory/Tools are NOT standalone canvas nodes; they are attachable sub-nodes visually connected to the Agent.

### Visual Structure (Important)

Main Agent node shows:

- Title: AI Agent
- Icon
- Status: error badge if model missing

Below the node show attachment slots:

- Chat Model\* (required) with "+" button
- Memory (optional) with "+" button
- Tool(s) (optional, multiple) with "+" button

Clicking a slot opens the relevant Inspector tab.

### Sub-node style

Attached items look like small n8n-style nodes:

- icon + short label
- dotted curved connector to agent
- show configured/error badge

### Inspector tabs

- Model (required)
- Memory
- Tools (multi)

Tools tab must reuse the SAME app/action catalog + schemas as App Action.

### Data structure

AI agent node data stores:

- model provider/model/credential/baseUrl
- optional memory config
- tools array (same shape as app.action config)

---

## Visual Style Rules

- Light: white surfaces, soft shadows
- Dark: deep navy surfaces, subtle glow on active/selected
- Neon gradient only for: selected border, active underline, primary CTA
- Keep it professional

---

## Output requirements

- Update node renderers for App Action + AI Agent
- Ensure App Action is unified (single node type)
- Redesign AI Agent to match n8n mental model
- Don’t break existing flows
- Print modified files list + manual test checklist

Proceed with implementation.
