# PROMPT: Typography Upgrade (Inter + JetBrains Mono) for FlowCraft

Repo root:
(this repo)

Goal:

- Add modern, readable fonts suitable for a developer tool UI
- Use Inter for UI text
- Use JetBrains Mono for code / logs / data
- Wire fonts into design tokens + Tailwind
- Keep Dark/Light themes working correctly

Constraints:

- Use Google Fonts (free)
- No new UI libraries
- Follow existing theme/token architecture
- Apply changes directly to the repo

---

## A) Add fonts via Next.js font system (MODIFY FILE)

Locate root layout file:

- `web/app/layout.tsx` OR
- `web/app/(main)/layout.tsx`

Requirements:

1. Import fonts using `next/font/google`
2. Configure:
   - Inter: weights 400, 500, 600, 700
   - JetBrains Mono: weights 400, 500
3. Expose CSS variables:
   - --font-sans
   - --font-mono
4. Apply fonts on `<html>` or `<body>`

Example intent (do NOT copy blindly):

- font variables attached to body className
- fonts available globally

---

## B) Wire fonts into design tokens (MODIFY FILE)

Modify:
`web/src/shared/styles/tokens.css`

Add typography tokens:

- --font-sans: Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif
- --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace

Ensure:

- These tokens exist for both Light and Dark themes
- Do not break existing tokens

---

## C) Tailwind font mapping (MODIFY FILE)

Modify:
`web/tailwind.config.ts`

Extend theme:

- fontFamily:
  - sans -> var(--font-sans)
  - mono -> var(--font-mono)

Ensure existing config remains intact.

---

## D) Apply fonts to common UI (MINIMAL tweaks)

Requirements:

- Default text uses font-sans
- Code/log/output areas use font-mono
  Examples:
- Logs panel
- Node config JSON / schema views
- Any <code> or <pre> elements

Apply minimal class changes only where appropriate.

---

## E) Output

Apply changes to repository files.
Print a summary:

- Modified files
- Fonts added and where they are used

Proceed now.
