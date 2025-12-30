# PROMPT: Refactor Builder Node System — AI Agent owns sub-nodes (Model/Memory/Tools), separate from App nodes

Repo root:
C:\Users\Mark\OneDrive\Documents\Projects\flowcraft

Context:

- Current UI shows separate nodes:
  - "Action in an app" node (app.action)
  - "AI Agent" node (ai.agent)
  - "Chat Model" node (model) with its own inspector (provider, credential, api key, base url, model)
- We want the architecture to match modern agent builders:
  - AI Agent is a parent node
  - Chat Model is a sub-node attached to AI Agent (not a standalone top-level node)
  - Memory and Tools are also sub-nodes of the Agent
- App actions remain separate nodes (top-level), connect into Agent or downstream nodes

Goal:

1. Introduce a hierarchical node concept:
   - Parent node: ai.agent
   - Sub-nodes: ai.model, ai.memory, ai.tool (0..n)
2. Update canvas rendering so sub-nodes appear visually “inside/under” the Agent node (or anchored below it),
   not as independent top-level nodes.
3. Update inspector:
   - When selecting AI Agent -> show tabs: Model / Memory / Tools (sub-node configs)
   - When selecting an app action node -> show its config as before
4. Update persistence:
   - Flow definition_json must store Agent with nested sub-configs
   - Backward compatible migration from existing flows where model was separate
5. Update wizard:
   - Node wizard must support adding:
     - App action nodes (top-level)
     - AI Agent node (top-level) with built-in sub-step to configure Model immediately
     - Add/Manage tools under agent
6. Update execution:
   - Temporal worker resolves agent config by reading nested model/memory/tools
   - Model credentials come from Credentials system (preferred) or direct API key (optional)

This must be real, not mock.

---

## A) Data Model Changes (Frontend definition_json)

Define canonical structure:

Top-level nodes array contains:

- app.action nodes
- ai.agent nodes

ai.agent node structure:
{
id,
type: "ai.agent",
position,
data: {
label,
// nested subnodes
model: {
provider, // "openai" | "gemini" | "grok" etc
credentialId?: string, // preferred
apiKeyOverride?: string, // optional
baseUrl?: string,
model: string
} | null,
memory: {
type: "none" | "conversation" | "vector",
config: {...}
} | null,
tools: Array<{
toolKey: string, // e.g. "http.request" | "google-sheets.appendRow"
credentialId?: string,
config: {...}
}>
}
}

Edges remain between top-level nodes only (for now).
Sub-nodes do not create independent edges; they are referenced inside the agent.

---

## B) Canvas Rendering (Frontend)

Implement an "Agent Node" UI that visually displays sub-node slots:

- Within the agent node card show three slots/ports:
  - Model
  - Memory
  - Tools
- If configured, show small pill/summary:
  - Model: provider icon + model name
  - Memory: type label
  - Tools: count + top 2 icons

Sub-node visuals:

- Sub-nodes should NOT appear as separate draggable nodes on canvas.
- Instead, appear as:
  - internal sections inside the agent node
  - OR small attached chips beneath the node (but not selectable as independent nodes)
- Clicking a slot opens the corresponding tab in Inspector.

Make sure existing layout still works with React Flow.

---

## C) Selection & Inspector Behavior

Update selection logic:

- Selecting ai.agent node opens Inspector with tabs:
  - "Model" tab (configure model)
  - "Memory" tab
  - "Tools" tab (list, add, remove, configure tool items)
- Selecting app.action nodes shows their schema form as before.

Model tab fields (match screenshot):

- Label
- Provider dropdown
- Credential dropdown (optional)
- API key override (optional)
- Model name (required)
- Base URL (optional)
- Inline validation: require Model and (credentialId OR apiKeyOverride)

Tools tab:

- Add tool button opens tool picker (from node catalog)
- Each tool has:
  - credential select
  - schema config form
  - enable/disable
  - delete tool
- Tools list should be reorderable (simple up/down buttons ok)

Memory tab:

- Minimal: "None" vs "Conversation memory"
- Optional later: vector store

---

## D) Wizard Update

Update wizard flow:

### 1) Add AI Agent (top-level)

Wizard steps:

- Agent basics (label)
- Model config (required)
- Memory (optional)
- Tools (optional add later)
- Review -> Add

### 2) Add App Action node (top-level)

Same as before.

IMPORTANT:
Remove "Chat Model" from top-level node palette.
Instead:

- Provide "AI Agent" node in palette
- Under AI Agent, user configures Model via inspector/wizard

---

## E) Backward Compatibility Migration

If existing flows contain standalone "chat model" nodes:

- On flow load:
  - detect model nodes connected to an ai.agent
  - migrate into agent.data.model and remove model node & related edge
  - keep behavior stable
- If model node exists without agent:
  - keep it as legacy OR convert into an ai.agent with model subnode automatically

Add a one-time migration function in FE (safe, idempotent).

---

## F) Backend Execution / Temporal Worker

Update execution mapping:

- When an ai.agent node runs:
  - read nested model config
  - resolve credential (decrypt token/apiKey)
  - call provider API (for now, can be stubbed if AI provider integration not complete)
- Tools under agent:
  - execute tool calls using same connector system as app nodes
  - tool actions must be real for at least:
    - google-sheets.appendRow
    - gmail.sendEmail
    - github.createIssue

Even if full agent planning is not implemented yet,
make sure the structure is ready and validation prevents running without model.

---

## G) Files/Code Organization Rules

- Avoid duplicated forms:
  - Use SchemaForm for tool configs
  - Model config uses dedicated small form component but shared inputs
- Keep logic in hooks/services/stores, not in UI components
- Add clear types:
  - AgentNodeData
  - AgentModelConfig
  - AgentToolConfig

---

## H) Output

Apply changes to repository.
At end list:

- Removed/Deprecated top-level model node
- New/updated Agent node UI
- Updated inspector + wizard
- Migration behavior
- Manual test checklist:
  1. Add AI Agent -> configure model -> save
  2. Reload -> config persists
  3. Add tool under agent -> configure -> save
  4. Run flow -> validation checks model presence
  5. Load old flow with model node -> auto migrate

Proceed now.
