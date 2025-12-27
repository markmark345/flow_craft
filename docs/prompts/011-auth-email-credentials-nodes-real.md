# PROMPT: OAuth (Google/GitHub) + Email Reset + Credentials + Real App Nodes (Gmail/Sheets/GitHub) for FlowCraft

Repo root:
C:\Users\Mark\OneDrive\Documents\Projects\flowcraft

Goal (must be REAL working end-to-end):

1. Auth: Sign up / Login using Email+Password + OAuth (Google, GitHub).
2. Email: Forgot password -> send reset email (SMTP) -> reset password page works.
3. Credentials system (n8n-like): store external app connections.
   - Minimum apps: Google (Sheets+Gmail), GitHub.
4. Variables system (n8n-like): key/value store for personal + project scopes.
5. Builder Nodes: create node actions that call real APIs using stored credentials:
   - Unified **Action in an app** node (similar to n8n) with selectable app/actions.
   - Gmail: Send email
   - Google Sheets: create spreadsheet, append/update rows, get rows, clear range, create/delete sheet, delete rows/columns, delete spreadsheet (Drive scope)
   - GitHub: file actions + issue actions (create/comment/edit/get/lock), org repos list
6. Integrate with Temporal run: workflow executes nodes sequentially using stored credentials.

Constraints:

- Keep clean architecture (handler/service/repo/entities/utils)
- FE separates UI from logic/hooks/stores/services
- Use Postgres for persistence
- Use secure token storage patterns (hash passwords, store refresh tokens encrypted, etc.)
- Provide docs for required env vars and OAuth setup steps
- Keep docs/spec readable (this prompt + docs/*.md)

---

## A) Backend — Authentication & Users

### Entities / DB

Create or extend tables:

- users:
  - id (uuid)
  - email (unique)
  - name
  - password_hash (nullable for OAuth-only accounts)
  - created_at, updated_at
- oauth_accounts:
  - id
  - user_id
  - provider ("google" | "github")
  - provider_user_id
  - access_token (nullable; short-lived)
  - refresh_token (nullable)
  - token_expiry (nullable)
  - scopes (text)
  - created_at, updated_at
- password_resets:
  - id
  - user_id
  - token_hash
  - expires_at
  - used_at (nullable)
  - created_at

Password hashing:

- Use bcrypt/argon2 (bcrypt acceptable for now)

Token security:

- Reset tokens: store ONLY hash in DB; email contains raw token
- Expiry: default 60 minutes

### API Endpoints (v1)

Auth (email/password):

- POST /auth/signup {email, password, name?}
- POST /auth/login {email, password}
- POST /auth/logout
- GET /auth/me

Password reset:

- POST /auth/forgot-password {email}
  - Always return 200 (do not reveal if user exists)
  - If user exists -> create reset token -> send email
- POST /auth/reset-password {token, newPassword}
  - Validate token hash + expiry + not used
  - Update password_hash, mark token used

Session/Auth method:

- Use Authorization: Bearer <accessToken> (JWT or opaque token)
- Minimal JWT ok for dev
- Store JWT secret in env

---

## B) Backend — OAuth (Google + GitHub)

Implement OAuth flow:

- GET /auth/oauth/google/start
- GET /auth/oauth/google/callback
- GET /auth/oauth/github/start
- GET /auth/oauth/github/callback

Requirements:

- Use OAuth Authorization Code flow
- Store provider account link in oauth_accounts
- For Google: request offline access to get refresh_token
- After success:
  - create user if not exists (by email when available)
  - issue FlowCraft session token (JWT)
  - redirect to frontend callback route with token (or set cookie)

Env vars needed:

- GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URL
- GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET / GITHUB_REDIRECT_URL
- APP_BASE_URL (frontend) + API_BASE_URL

---

## C) Backend — Email Sending (SMTP)

Implement SMTP mailer:

- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
- Provide utils/mailer with HTML template support

Create email template for reset password (bilingual):

- Subject: "[FlowCraft] Password Reset Request"
- Header includes FlowCraft logo (simple inline SVG ok)
- CTA button uses accent strong (#00a8ff or token-based)
- Include expiry line (60 minutes)
- Include support/login links

Content reference (must follow this structure):
Subject Line:
[FlowCraft] Password Reset Request
Greeting:
Hello [name/email],
Body:
Explain request, include Reset link/button, expiry, ignore if not requested.
Closing:
Best regards,
The FlowCraft Team
Optional:
FAQ/support link, login link

Create template file(s):

- `api/internal/mailer/templates/reset_password_en.html`
- `api/internal/mailer/templates/reset_password_th.html`
  and a renderer that picks language by user preference or default EN.

Reset link format:
APP_BASE_URL + "/reset-password?token=..."

---

## D) Backend — Credentials system (n8n-like)

Create tables:

- credentials:
  - id
  - user_id (owner)
  - project_id (nullable; empty = personal, set = project scope)
  - provider ("google" | "github")
  - name (user-friendly)
  - data_encrypted (jsonb encrypted string)
  - created_at, updated_at

Encryption:

- Use AES-GCM with master key CREDENTIALS_ENC_KEY in env
- Store encrypted payload containing refresh_token, scopes, metadata

Scope rules:

- Personal: owned by user (project_id = null)
- Project: tied to project_id; only project admins can create/update/delete
- Project members can list/get project credentials for use in nodes

API endpoints:

- GET /credentials?scope=personal|project&projectId=...
- POST /credentials (body: {provider, name, scope, projectId, data})
- GET /credentials/:id
- PUT /credentials/:id
- DELETE /credentials/:id

For Google:

- credential contains refresh_token, scopes, account_email
  For GitHub:
- credential contains access_token (classic token) OR oauth token

Add minimal UI later in FE.

---

## E) Backend — Variables system (n8n-like)

Create tables:

- variables:
  - id
  - user_id (owner)
  - project_id (nullable; empty = personal, set = project scope)
  - key (string)
  - value (text)
  - created_at, updated_at

Rules:

- Personal: owned by the user (project_id = null)
- Project: tied to project_id; only project admins can create/update/delete
- Project members can list/get project variables for use in nodes

API endpoints:

- GET /variables?scope=personal|project&projectId=...
- POST /variables
- PUT /variables/:id
- DELETE /variables/:id

---

## F) Backend — App Connectors (Google Sheets, Gmail, GitHub)

Create connector services:

- `api/internal/connectors/google/*`
- `api/internal/connectors/github/*`

Google:

- Use refresh_token to obtain access_token when needed
- Gmail: send email endpoint using Gmail API
- Sheets: multiple actions using Sheets API
  - Note: deleting spreadsheets requires Google Drive API scope (`drive` or `drive.file`)

GitHub:

- File actions via Contents API (create/edit/delete/get/list)
- Issue actions (create/comment/edit/get/lock)
- Org repos list
- Use GitHub API with stored token (OAuth token)

Expose internal service functions for workflow execution.

---

## G) Temporal — Execute nodes with credentials

Update Temporal workflow execution:

- Each node has type and config, including credentialId reference
- Worker loads credential from DB, decrypts, obtains access token, calls connector
- Persist execution step results to run logs table (if exists)

Minimum node actions:

1. `gmail.sendEmail`
2. `gsheets.appendRow`
3. `github.createIssue`

Plus additional app actions for Sheets and GitHub.

Return outputs per node for chaining.

---

## H) Frontend — Auth UI and Flows

Create pages (App Router):

- /login
- /signup
- /forgot-password
- /reset-password?token=

Login page:

- Email/password login
- Buttons: "Continue with Google", "Continue with GitHub"
- Links: signup, forgot password
- Uses toast + loading

Forgot password:

- email input
- success state: "If an account exists, we sent a reset link"

Reset password:

- token from query
- new password + confirm
- on success redirect to login

Implement auth store (zustand):

- token + user
- hydrateFromStorage
- guard protected routes
- logout

OAuth handling:

- Create FE callback route if backend redirects with token, e.g.
  - /auth/callback?token=...
  - store token then redirect to dashboard

---

## H) Frontend — Credentials UI (minimal but real)

Add section:

- Settings -> "Credentials" (personal)
- Project Settings -> "Credentials" (project)

Pages:

- /settings/credentials (personal)
- /projects/:projectId/credentials (project)
  Features:
- list credentials (provider, name, connected email)
- create credential:
  - Google: "Connect Google" button starts OAuth (backend start url)
  - GitHub: "Connect GitHub" button starts OAuth
- delete credential (confirm)

NOTE:
OAuth results must create a credential record in backend associated with user.

---

## I) Frontend — Node Config uses credentials

In Flow Builder:

- For Gmail/Sheets/GitHub node types:
  - Node Config panel must include "Credential" dropdown (list credentials by provider + scope)
  - When flow belongs to a project, query project credentials (scope=project, projectId)
  - When flow is personal, query personal credentials (scope=personal)
  - Save selected credentialId into node data/config

Provide node templates:

- Gmail node: To/Subject/Body
- Sheets node: SpreadsheetId/SheetName/Values
- GitHub node: Owner/Repo/Title/Body

---

## J) Docs

Create docs:

- `docs/auth-oauth-setup.md` (Google Cloud + GitHub app setup + redirect urls)
- `docs/smtp-setup.md` (Gmail SMTP/app password or any SMTP)
- `docs/credentials.md` (how to connect, scopes needed)
- `docs/node-connectors.md` (what nodes do, required fields)

Include env examples in:

- `api/.env.example`
- `web/.env.example`

---

## K) Output

Apply changes to the repository.
At end print:

- New DB tables/migrations created
- New endpoints
- New FE routes
- Manual test plan:
  1. Signup/login
  2. OAuth google/github login
  3. Forgot password -> email received -> reset works
  4. Connect Google -> create credential
  5. Build flow with Gmail + Sheets nodes -> Run -> verify actual email sent and sheet row appended
  6. Build flow with GitHub issue node -> Run -> issue created

Proceed now.
