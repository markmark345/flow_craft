# OAuth Setup (Google + GitHub)

FlowCraft supports OAuth login and credential connections for Google and GitHub. You must configure OAuth apps and set the environment variables below.

## Required env vars (API)

- `APP_BASE_URL` (e.g. `http://localhost:3000`)
- `OAUTH_STATE_SECRET` (random secret, used to sign state)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URL` (e.g. `http://localhost:8080/api/v1/auth/oauth/google/callback`)
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_REDIRECT_URL` (e.g. `http://localhost:8080/api/v1/auth/oauth/github/callback`)

## Google OAuth

1. Go to Google Cloud Console → APIs & Services.
2. Create an OAuth Consent Screen (External or Internal).
3. Create OAuth Client ID (Web application).
4. Add redirect URI:
   - `http://localhost:8080/api/v1/auth/oauth/google/callback`
5. Add scopes:
   - `openid`, `email`, `profile` (login)
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/spreadsheets`
   - *(optional)* `https://www.googleapis.com/auth/drive` (required for `gsheets.deleteSpreadsheet`)

## GitHub OAuth

1. Go to GitHub → Settings → Developer settings → OAuth Apps.
2. Create new OAuth app.
3. Authorization callback URL:
   - `http://localhost:8080/api/v1/auth/oauth/github/callback`
4. Required scopes:
   - `read:user`, `user:email` (login)
   - `repo` (issues + file/contents actions on private repos)
   - *(optional)* `public_repo` (issues + file actions on public repos only)

## Notes

- Use HTTPS in production.
- `OAUTH_STATE_SECRET` should be a long random string.
- For Google credentials, you must request offline access (handled by FlowCraft when connecting credentials).
