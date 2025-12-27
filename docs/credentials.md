# Credentials (Personal + Project)

Credentials store external app connections (Google, GitHub) and are used by workflow nodes.

Related:

- `docs/auth-oauth-setup.md` (how to create OAuth apps + scopes)
- `docs/node-connectors.md` (available node actions)

## Scopes

- **Personal**: owned by the current user.
- **Project**: tied to a project; only project admins can create/update/delete.
- Project members can list and use project credentials in nodes.

## How to connect

1. Go to **Settings → Credentials** (personal) or **Project Settings → Credentials** (project).
2. Click **Connect Google** or **Connect GitHub**.
3. Complete the OAuth flow.

## Stored payloads

- Google: `refresh_token`, `scopes`, `account_email`
- GitHub: `access_token`, `scopes`, `account_login`

## Encryption

Credential payloads are encrypted with `CREDENTIALS_ENC_KEY` (base64-encoded 32-byte key).
