# PROMPT: Neon Gradient Accents (Topbar + Active Nav) for FlowCraft

Repo root:
(this repo)

Goal:
Add subtle neon gradients to key UI accents (NOT full background):

- Top bar: thin gradient highlight line (and optional subtle glow)
- Active nav item: gradient pill/underline + glow
- Keep Light mode clean (white) and Dark mode deep navy
- No new dependencies

Rules:

- Do not redesign the whole UI.
- Use CSS variables/tokens where possible.
- Keep changes minimal and consistent with existing components.
- Apply changes directly to the repository (create/modify files).
- Avoid duplicated styling: create reusable utilities/classes.

---

## A) Add gradient tokens (MODIFY FILE)

Modify:
`web/src/shared/styles/tokens.css`

Add these NEW variables under both themes (`:root` and `[data-theme="dark"]`):

- --grad-accent: linear-gradient(90deg, var(--accent) 0%, var(--error) 50%, var(--success) 100%)
- --grad-accent-soft: linear-gradient(90deg, rgba(0,212,255,0.0) 0%, rgba(0,212,255,0.7) 50%, rgba(255,59,122,0.0) 100%)

For dark theme, adjust opacities slightly lower if needed.

Also add:

- --topbar-highlight: var(--grad-accent-soft)
- --nav-active-grad: var(--grad-accent)

If rgba values are needed, derive them from the existing neon palette used in 05b (cyan/pink/green). Do not introduce unrelated colors.

---

## B) Create shared gradient utility styles (CREATE FILE)

Create:
`web/src/shared/styles/gradients.css`

Include utility classes that use the tokens:

- `.fc-topbar-highlight` -> adds a 2px top border/line using --topbar-highlight
- `.fc-nav-active` -> background uses --nav-active-grad with subtle glow, proper contrast
- `.fc-accent-underline` -> underline/indicator using --grad-accent

Use only CSS variables for colors. No hardcoded hex besides transparent/rgba if necessary.

---

## C) Wire gradients.css globally (MODIFY FILE)

Modify:
`web/app/globals.css`

Import gradients.css after tokens import.

---

## D) Apply to Top Bar (MODIFY FILES)

Find the TopBar component in the web app. Likely locations:

- `web/src/shared/components/TopBar.tsx`
- or `web/src/features/**/components/*TopBar*`
- or a layout header component under `web/src/shared/components/`

Apply:

- Add a thin top highlight line using `.fc-topbar-highlight`
- Keep it subtle (2px line or pseudo-element)
- Ensure it looks good in both themes

---

## E) Apply to Active Nav item (MODIFY FILES)

Find the Sidebar/Nav component (left navigation). Likely locations:

- `web/src/shared/components/Sidebar.tsx`
- `web/src/shared/components/Nav*`
- or `web/src/features/**/components/*Sidebar*`

Requirements:

- Active item should have:
  - gradient pill background using `.fc-nav-active` (subtle)
  - optional left indicator bar using `.fc-accent-underline` or a small 3px bar
- Non-active items remain simple.
- Hover state uses a faint surface background (not full neon).

---

## F) Ensure accessibility

- Text on active item remains readable in both light/dark.
- If gradient makes contrast low, add:
  - `color: var(--text);`
  - `backdrop-filter` is optional but avoid if not already used.

---

## Output

Apply changes to repo and print summary:

- Created files
- Modified files
- Where gradient accents were applied (TopBar / Sidebar active item)

Proceed now.

