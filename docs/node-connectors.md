# Node Connectors

These nodes execute real API calls using stored credentials.

## Unified App node (`app`)

Use **Action in an app** to call external apps in a future-proof way (similar to n8n). The node stores:

- `app`: `googleSheets` | `gmail` | `github`
- `action`: action key (see below)
- `credentialId`: connected credential to use

### Gmail actions

**Action**: `gmail.sendEmail`

Required:

- `credentialId` (Google credential)
- `to`
- `subject`

Optional:

- `from`
- `bodyText`
- `bodyHtml`

### Google Sheets actions

All require `credentialId` (Google credential).

- `gsheets.createSpreadsheet`: `title` (required), `sheetName` (optional)
- `gsheets.deleteSpreadsheet`: `spreadsheetId` (required) *(requires Google Drive scope; see OAuth docs)*
- `gsheets.appendRow`: `spreadsheetId` (required), `sheetName` (optional), `values` (required)
- `gsheets.updateRow`: `spreadsheetId` (required), `range` (required), `values` (required)
- `gsheets.getRows`: `spreadsheetId` (required), `range` (required)
- `gsheets.clearRange`: `spreadsheetId` (required), `range` (required)
- `gsheets.createSheet`: `spreadsheetId` (required), `sheetName` (required)
- `gsheets.deleteSheet`: `spreadsheetId` (required), `sheetName` (required)
- `gsheets.deleteRowsOrColumns`: `spreadsheetId`, `sheetName`, `dimension` (`ROWS`/`COLUMNS`), `startIndex`, `endIndex`

### GitHub actions

All require `credentialId` (GitHub credential).

File actions:

- `github.createFile`: `owner`, `repo`, `path`, `message`, `content`, `branch?`
- `github.editFile`: `owner`, `repo`, `path`, `message`, `content`, `sha?`, `branch?` *(auto-resolves SHA if blank)*
- `github.deleteFile`: `owner`, `repo`, `path`, `message`, `sha?`, `branch?` *(auto-resolves SHA if blank)*
- `github.getFile`: `owner`, `repo`, `path`, `ref?`
- `github.listFiles`: `owner`, `repo`, `path?`, `ref?` *(empty path lists repo root)*

Issue actions:

- `github.createIssue`: `owner`, `repo`, `title`, `body?`
- `github.createIssueComment`: `owner`, `repo`, `issueNumber`, `body`
- `github.editIssue`: `owner`, `repo`, `issueNumber`, `title?`, `body?`, `state?` (`open`/`closed`)
- `github.getIssue`: `owner`, `repo`, `issueNumber`
- `github.lockIssue`: `owner`, `repo`, `issueNumber`, `lockReason?`

Organization actions:

- `github.listOrgRepos`: `org`

## Gmail Send (`gmail`)

Required:

- `credentialId` (Google credential)
- `to`
- `subject`

Optional:

- `from`
- `bodyText`
- `bodyHtml`

## Google Sheets Append Row (`gsheets`)

Required:

- `credentialId` (Google credential)
- `spreadsheetId`
- `values` (JSON array or comma-separated)

Optional:

- `sheetName` (default `Sheet1`)

## GitHub Create Issue (`github`)

Required:

- `credentialId` (GitHub credential)
- `owner`
- `repo`
- `title`

Optional:

- `body`

## Outputs

Each node returns:

- `status`: HTTP-like status code
- `data`: provider response payload
- `meta.duration_ms`: execution time
