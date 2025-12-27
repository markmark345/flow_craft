# Codex usage notes (for this repo)

This file exists to reduce re-triage when Codex gets interrupted or shows quota errors.

## When Codex shows “You’re out of Codex messages…”

Sometimes the Codex UI can show the “out of messages” banner even when usage looks available.

Try (in order):

1. Hard reload the page (`Cmd+Shift+R` / `Ctrl+Shift+R`)
2. Sign out of `chatgpt.com`, then sign back in (verify the correct account)
3. Try Incognito/Private window
4. Clear cookies/site data for `chatgpt.com`, then sign in again

## Local environment constraints observed

- `network_access=restricted`: package installs (pnpm/npm/go get) may fail due to blocked network.
- Some commands may print `/bin/ps: Operation not permitted` (Homebrew shellenv). It is noisy but not related to FlowCraft.
- Go tooling may fail to write cache depending on environment. Workaround:
  - `GOCACHE=$(mktemp -d) go test ./...` (run from `api/`)

