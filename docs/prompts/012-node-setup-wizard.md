# PROMPT: Node Setup Wizard (n8n-style) — supports App nodes and AI Agent with sub-slots (Model/Memory/Tools)

Repo root:
C:\Users\Mark\OneDrive\Documents\Projects\flowcraft

Context:

- Frontend: Next.js App Router + Tailwind + Zustand
- Builder uses React Flow with:
  - top-level nodes (e.g. app.action, ai.agent)
  - Inspector panel on the right
- IMPORTANT NEW RULE:
  - "Chat Model" is NOT a top-level node
  - Model is a sub-config (slot) of AI Agent:
    - agent.data.model
    - agent.data.memory
    - agent.data.tools[]
- Credentials system exists or will exist (Google, GitHub, etc)
- App icons system exists (AppIcon)

Goal:
Create a step-by-step Wizard that helps users add and configure nodes correctly:
A) Add App Action Node (top-level)
B) Add AI Agent Node (top-level) with required Model sub-config
C) Add Tools into AI Agent (sub-items) via wizard or inspector

Must work in both Light/Dark themes.
Must avoid duplicated forms: schema-driven form renderer reused by wizard + inspector.

---

## 0) UX Overview

Wizard opens as modal or right drawer (pick whichever already exists; prefer modal).
Wizard has:

- Left: Stepper (App/Action/Credential/Config/Test/Review) OR (Agent/Model/Memory/Tools/Review)
- Right: Step content
- Footer: Back / Next / Cancel and final Confirm button
- Validation: cannot proceed without required fields
- Toast: test success/fail, added success

---

## 1) Node Types Supported

### 1.1 App Action Node (top-level)

Examples:

- google-sheets.appendRow
- gmail.sendEmail
- github.createIssue

Wizard flow (App Node):

1. Choose App
2. Choose Action
3. Choose Credential (required)
4. Configure fields (schema-driven)
5. Test step (optional but recommended)
6. Review -> Add Node to canvas

### 1.2 AI Agent Node (top-level)

Agent has sub-slots:

- Model (REQUIRED)
- Memory (optional)
- Tools (optional, multiple)

Wizard flow (Agent Node):

1. Agent basics (label)
2. Model config (REQUIRED)
3. Memory (optional)
4. Tools (optional add now, can add later)
5. Review -> Add Agent Node to canvas

### 1.3 Add Tool into Agent (sub-item, not canvas node)

Wizard flow (Add Tool):

1. Choose Tool (from catalog)
2. Choose Credential (required if tool needs it)
3. Configure fields
4. Test tool (optional)
5. Confirm -> add into agent.data.tools[] and save

IMPORTANT:

- Tools inside agent are NOT top-level nodes on canvas
- They appear in Agent Inspector (Tools tab) and/or as small chips in the Agent node UI

---

## 2) Node Catalog (Create or Update)

Create/Update:
`web/src/features/builder/nodeCatalog/catalog.ts`

Catalog must support:

- apps and actions for app nodes
- agent tools (toolKey) reusing the same actions list

Include at least:
Apps:

- "google-sheets" -> actions: appendRow
- "gmail" -> actions: sendEmail
- "github" -> actions: createIssue
  Agent:
- tools can include same actions (gmail.sendEmail, google-sheets.appendRow, github.createIssue)
  Model providers (for agent model slot):
- "openai" | "gemini" | "grok" | "custom"
  Model schema fields:
- provider (required)
- credentialId (optional)
- apiKeyOverride (optional)
- model (required)
- baseUrl (optional)
  Validation: require model and (credentialId OR apiKeyOverride)

---

## 3) Shared Schema Form Renderer (No duplication)

Create/Update:
`web/src/shared/components/SchemaForm/SchemaForm.tsx`

- Render form fields from schema:
  - string -> Input
  - text -> Textarea
  - string[] -> multiline textarea (one value per line) OR simple tags
  - select -> Select
- Show required markers + inline errors
- Reusable by:
  - Wizard configure step
  - Inspector (for app nodes and agent tools)

---

## 4) Wizard Store (Zustand)

Create:
`web/src/features/builder/wizard/store/useWizardStore.ts`

Support 3 modes:

- mode: "add-app-node" | "add-agent" | "add-agent-tool"

State:

- isOpen
- mode
- flowId
- stepIndex
- draft: object holding selection + config
- validationErrors
- testResult
- isTesting
- isSubmitting

Actions:

- openAddAppNode(flowId, presetApp?, presetAction?)
- openAddAgent(flowId)
- openAddAgentTool(flowId, agentNodeId)
- close()
- nextStep()/prevStep()
- setDraft(...)
- validateCurrentStep()
- runTest() (calls backend test endpoint)
- confirm()

---

## 5) Wizard UI Components

Create:
`web/src/features/builder/wizard/components/WizardModal.tsx`

Create step components:
`web/src/features/builder/wizard/components/steps/*`

App-node steps:

- AppSelectStep
- ActionSelectStep
- CredentialSelectStep
- ConfigureStep (SchemaForm)
- TestStep
- ReviewStep

Agent steps:

- AgentBasicsStep
- AgentModelStep (dedicated UI, not schema-based but can reuse inputs)
- AgentMemoryStep
- AgentToolsStep (optional tool picker)
- ReviewStep

Agent-tool steps:

- ToolSelectStep
- CredentialSelectStep
- ConfigureStep
- TestStep
- ReviewStep

Use AppIcon in cards/rows.

---

## 6) Integrations with Builder

### 6.1 Palette

Update Node Palette:

- App Actions group (adds app nodes)
- AI Agent group (adds agent node)
  Remove standalone "Chat Model" from palette.

Each palette item supports:

- Click "Add" -> opens wizard with presets
- Drag & drop (keep existing). OPTIONAL enhancement:
  - on drop, open wizard immediately for configuration (if you already support it)

### 6.2 Canvas insertion

On confirm:

- For app node: create React Flow node with type "app.action" + config
- For agent: create node type "ai.agent" with nested data.model/memory/tools
  Position: center of viewport or last drop position.

### 6.3 Agent Tools insertion

On confirm in "add-agent-tool" mode:

- Mutate selected agent node data.tools[]
- Update builder state and mark dirty
- Persist on Save

---

## 7) Backend Test Endpoint (Required)

Implement or ensure exists:
POST /nodes/test
Request:
{
"kind": "app-action" | "agent-tool" | "agent-model",
"provider": "gmail"|"google-sheets"|"github"|"openai"|"gemini"|"grok"|"custom",
"action": "sendEmail"|"appendRow"|"createIssue" (optional for model),
"credentialId"?: string,
"apiKeyOverride"?: string,
"baseUrl"?: string,
"model"?: string,
"config"?: object
}

Behavior:

- For Gmail/Sheets/GitHub tests: validate auth and permissions without destructive write by default
- If destructive action is required, gate behind explicit "performWrite": true (optional)
  Return:
  { success, message, preview?, output? }

Wizard shows test result nicely.

---

## 8) Inspector Reuse

Update Inspector:

- For app node:
  - render SchemaForm from catalog schema
- For ai.agent:
  - tabs: Model / Memory / Tools
  - tools list uses same SchemaForm per tool schema
  - Add Tool button opens wizard in "add-agent-tool" mode

No duplicate forms.

---

## 9) Output

Apply changes directly to repository.
After completion print:

- Created/modified files
- How to test:
  1. Open builder
  2. Add AI Agent -> configure Model -> save -> reload
  3. Add tool under agent -> configure -> save -> reload
  4. Add app node -> configure -> add -> save
  5. Test steps in wizard

Proceed now.
