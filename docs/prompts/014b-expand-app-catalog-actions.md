# PROMPT: Expand App Catalog (Gmail/GitHub/Bannerbear/Google Sheets) to show grouped Actions like n8n

Goal:
Right now App Action selection shows too few items. Implement a scalable app catalog with categories + many actions so the UI can list Actions (count), grouped sections, with search — similar to n8n.

Do:

1. Create/expand app catalog registry under:

- web/src/features/builder/nodeCatalog/apps/
  - googleSheets.ts
  - gmail.ts
  - github.ts
  - bannerbear.ts
- web/src/features/builder/nodeCatalog/catalog.ts exports a unified structure.

2. Data model for each app:

- appKey: string (e.g. "gmail")
- label: string
- icon: React component or static asset
- categories: Array<{
  key: string,
  label: string,
  items: Array<ActionDef>
  }>
- ActionDef includes:
  - actionKey (string)
  - label
  - description (short)
  - fieldsSchema (for inspector forms):
    - required fields
    - optional fields
    - types: text/textarea/number/select/json
    - placeholder/help text
  - supportsTest: boolean

3. Minimum action coverage:

- Gmail: include at least 12 actions grouped into:
  - Message actions: send message, reply, get message, list messages, add/remove label, mark read/unread
  - Label actions: create/delete/get/list labels
  - Draft actions: create/delete/get drafts
- GitHub: include at least 15 actions grouped into:
  - Issue actions: create/edit/get/list issues, comment, lock
  - Repo actions: list repos, create file, update file, delete file
  - Release actions: create/get/list releases
- Bannerbear: include at least 6 actions grouped into:
  - Image actions: create image, get image
  - Template actions: get template, list templates
  - Video actions (future-ready placeholder): create video, get video (can be disabled/coming soon)
- Google Sheets: include at least 12 actions grouped into:
  - Document actions: create spreadsheet, delete spreadsheet
  - Sheet actions: create sheet, delete sheet, clear sheet
  - Row actions: append row, update row, get row(s), delete rows/cols
  - Triggers: on row added, on row updated (marked trigger)

4. Update the App Action selection UI:

- Show header with App name + Search input (like n8n)
- Show "Actions (N)" count
- Render grouped category sections with list items
- Each item shows icon + label (and optional short description)
- Selecting an action updates node.data.action and opens config form

Constraints:

- Keep existing flow data shape: node.data.app, node.data.action, node.data.credentialId, node.data.config
- No duplicated code: reuse shared components for list/search/group sections
- Works in Light + Dark mode

Output:

- List modified files
- Manual test steps: select each app, see action counts, search works, pick action -> inspector config loads schema form
  Proceed.
