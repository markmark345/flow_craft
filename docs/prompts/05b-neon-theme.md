# PROMPT: Neon Theme Upgrade (Light = White, Dark = Deep Navy) for FlowCraft

Repo root:
(this repo)

Goal:

- Make Light mode actually white/bright (not dark-blue-ish)
- Keep Dark mode deep navy
- Add subtle neon accents (cyan/pink/lime) for a modern dev-tool vibe
- Apply changes with minimal code edits and no new dependencies

IMPORTANT:

- Apply changes directly to the repository (create/modify files)
- Do not introduce new packages
- Keep existing architecture and structure

---

## A) Update design tokens (MODIFY FILE)

Modify:
`web/src/shared/styles/tokens.css`

Replace the color/shadow tokens for BOTH themes with the following:

### Light theme (default) in `:root`

- bg: #ffffff
- panel: #f7f8fb
- surface: #ffffff
- surface-2: #f2f4f8
- border: #e6e8f0
- text: #0b1220
- muted: #5a6477
- accent: #00d4ff (neon cyan)
- accent-strong: #00a8ff
- success: #22ff88 (neon green)
- warning: #ffd400 (neon yellow)
- error: #ff3b7a (neon pink)
- shadow-soft: 0 1px 2px rgba(10,20,40,0.06)
- shadow-lift: 0 10px 30px rgba(10,20,40,0.12)
- shadow-focus: 0 0 0 3px rgba(0,212,255,0.28)
- glow-accent: 0 0 18px rgba(0,212,255,0.35)
- glow-error: 0 0 18px rgba(255,59,122,0.28)
- glow-success: 0 0 18px rgba(34,255,136,0.25)

### Dark theme in `[data-theme="dark"]`

- bg: #070a12
- panel: #0c1220
- surface: #0f1730
- surface-2: #121c38
- border: rgba(255,255,255,0.08)
- text: #e7eefc
- muted: rgba(231,238,252,0.68)
- accent: #00e5ff
- accent-strong: #00b8ff
- success: #3dff9a
- warning: #ffe066
- error: #ff4d8d
- shadow-soft: 0 1px 2px rgba(0,0,0,0.5)
- shadow-lift: 0 18px 50px rgba(0,0,0,0.55)
- shadow-focus: 0 0 0 3px rgba(0,229,255,0.22)
- glow-accent: 0 0 18px rgba(0,229,255,0.28)
- glow-error: 0 0 18px rgba(255,77,141,0.22)
- glow-success: 0 0 18px rgba(61,255,154,0.18)

Ensure the file still has the correct structure:
`:root { ... }` and `[data-theme="dark"] { ... }`

---

## B) Ensure globals use tokens (MODIFY FILE)

Modify:
`web/app/globals.css`

Requirements:

- body background uses `var(--bg)`
- text uses `var(--text)`
- default page background is white in light mode
- ensure focus styles are visible (do not remove outline without adding focus ring)

---

## C) Tailwind token mapping (MODIFY FILE)

Modify:
`web/tailwind.config.ts`

Ensure theme uses CSS variables (extend, do not replace):

- colors:
  - bg: var(--bg)
  - panel: var(--panel)
  - surface: var(--surface)
  - surface2: var(--surface-2)
  - border: var(--border)
  - text: var(--text)
  - muted: var(--muted)
  - accent: var(--accent)
  - accentStrong: var(--accent-strong)
  - success: var(--success)
  - warning: var(--warning)
  - error: var(--error)
- boxShadow:
  - soft: var(--shadow-soft)
  - lift: var(--shadow-lift)
  - focus: var(--shadow-focus)
  - glowAccent: var(--glow-accent)
  - glowError: var(--glow-error)
  - glowSuccess: var(--glow-success)

---

## D) Make the neon visible (MINIMAL component tweaks)

Goal: Without redesigning everything, ensure the accent looks neon-ish.

1. Find shared Button component (likely under `web/src/shared/components/Button.tsx` or similar)

   - For primary button:
     - background uses accent
     - hover adds subtle glowAccent shadow
   - Focus-visible adds shadow-focus

2. Find shared Input component (or common input styles)
   - focus-visible adds shadow-focus and border accent

If the project does not have shared Button/Input, apply minimal changes to the most used button/input components in `web/src/shared/components/` to achieve the above.

---

## E) Output

Apply changes to repo. Then print a summary:

- Modified files list
- Brief note: Light mode is now white; dark is deep navy; neon accents enabled.

Proceed now.

