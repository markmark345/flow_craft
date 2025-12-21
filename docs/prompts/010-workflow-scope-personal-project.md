# PROMPT: Implement Personal vs Project Workflows (n8n-style)

Repo root:
C:\Users\Mark\OneDrive\Documents\Projects\flowcraft

Reference:

- n8n workflow separation:
  - Personal workflows (owned by user)
  - Project workflows (shared within a project)
- UI example provided (tabs + project settings)

Goal:
Introduce proper workflow scoping:

- Personal workflows
- Project workflows
  with real backend support, permissions, and UI switching.

This is a functional feature, not UI-only.

---

## A) Domain Model Changes (Backend)

### 1) Workflow ownership model

Update workflow entity to support scope:

Workflow:

- id
- name
- description
- owner_user_id (nullable)
- project_id (nullable)
- scope: "personal" | "project"
- definition_json
- status
- created_at
- updated_at

Rules:

- Personal workflow:
  - owner_user_id = current user
  - project_id = NULL
- Project workflow:
  - project_id = some project
  - owner_user_id = NULL or creator
- Exactly ONE of (owner_user_id, project_id) must be set.

---

### 2) Project model (if not exists)

Project:

- id
- name
- description
- created_by
- created_at

ProjectMember:

- project_id
- user_id
- role: "admin" | "member"

Permissions:

- Only project members can see project workflows
- Only admins can delete project

---

## B) Backend API (Implement or Extend)

### Workflow endpoints

- GET /workflows?scope=personal

  - returns workflows owned by current user

- GET /workflows?scope=project&projectId=:id

  - returns workflows for a project user belongs to

- POST /workflows
  Request:
  {
  "name": string,
  "scope": "personal" | "project",
  "projectId"?: string
  }

- GET /workflows/:id

  - permission check based on scope

- PUT /workflows/:id
- DELETE /workflows/:id
  - permission-aware

---

### Project endpoints

- GET /projects

  - list projects user belongs to

- GET /projects/:id
- POST /projects
- PUT /projects/:id
- DELETE /projects/:id (admin only)

- GET /projects/:id/members
- POST /projects/:id/members
- DELETE /projects/:id/members/:userId

Minimal implementation is acceptable (no invites email required).

---

## C) Frontend State & Services

### 1) API services (CREATE)

- `features/workflows/services/workflowsApi.ts`
- `features/projects/services/projectsApi.ts`

Methods:

- listPersonalWorkflows()
- listProjectWorkflows(projectId)
- createWorkflow(payload)
- listProjects()

---

### 2) Global scope state (CREATE)

Zustand store:
`features/workspaces/store/useWorkspaceStore.ts`

State:

- activeScope: "personal" | "project"
- activeProjectId: string | null
- projects: Project[]

Actions:

- setScope(scope)
- setActiveProject(projectId)
- loadProjects()

Persist:

- activeScope + projectId in localStorage

---

## D) UI Changes (Frontend)

### 1) Left Sidebar (Global)

Update sidebar to include:

- Section: "Personal"
- Section: "Projects"
  - Expandable list of projects
  - Click project switches scope

Active item clearly highlighted.

---

### 2) Workflows Page (`/flows`)

Replace single list with scoped view:

Header:

- Title:
  - "Personal Workflows"
  - OR "Project: <project name>"
- Subtitle explaining scope

Toolbar:

- Search
- Sort
- "Create workflow" dropdown:
  - Create personal workflow
  - Create project workflow (only if project scope)

List:

- Uses correct API based on active scope
- Empty state message differs:
  - "No personal workflows yet"
  - "This project has no workflows yet"

---

### 3) Create Workflow Flow

When clicking "Create workflow":

- Ask:
  - Personal
  - Project (if applicable)
- Create via API with correct scope
- Redirect to builder

---

### 4) Project Settings Page

Route:
`/projects/:id/settings`

Tabs:

- General (name, description)
- Members (add/remove, role)
- Danger zone (delete project)

Only project admins can access settings.

---

## E) Builder Permissions

In Flow Builder:

- Read scope from workflow
- If project workflow:
  - verify user is project member
- If personal workflow:
  - verify owner

Disable save/run with clear error if unauthorized.

---

## F) UX & Consistency Rules

- Never mix personal and project workflows in same list
- Always show current scope context
- Always enforce permissions both FE and BE
- Toast feedback for create/update/delete
- Graceful empty states

---

## G) Output

Apply changes directly to the repository.

After completion, print:

1. New database fields / tables added
2. New API endpoints
3. UI routes added
4. How to test:
   - Create personal workflow
   - Create project + project workflow
   - Switch scopes
   - Verify permissions

Proceed now.
