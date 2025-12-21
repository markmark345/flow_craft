# PROMPT: Theme Tokens + Dark Mode (Light Default) for FlowCraft

You are working inside this repository:

(this repo)

This project uses:

- Next.js + Tailwind + Zustand (web/)
- Design reference: docs/figma-spec.md

Your task is to create a proper theme system using **design tokens**.
The app MUST support Dark Mode, but **default theme is Light**.

This is NOT a mockup. You must create and modify real files.

---

## Theme Requirements

- Default theme: **Light**
- Optional theme: **Dark**
- Theme switching via **Zustand global store**
- Use **CSS variables** as the single source of truth
- Tailwind must reference CSS variables (no hardcoded colors in components)
- Easy to scale later (more themes if needed)

---

## A) Design Tokens (READ FIRST)

Read and map tokens from:
`docs/figma-spec.md`

Expected token groups:

- Colors: bg, panel, surface, border, text, muted, accent, accent-strong, success, warning, error
- Spacing: 4, 8, 12, 16, 20, 24, 32, 40, 48
- Radius: xs, sm, md, lg, pill
- Shadows: soft, lift, focus
- Typography: font-sans, font-mono

---

## B) Create Tokens CSS (CREATE FILE)

Create:
`web/src/shared/styles/tokens.css`

Requirements:

- Define `:root` for **Light theme**
- Define `[data-theme="dark"]` for Dark theme
- Only CSS variables here (NO classes)

Example structure:

```css
:root {
  --bg: ...;
  --panel: ...;
  --text: ...;
}

[data-theme="dark"] {
  --bg: ...;
  --panel: ...;
  --text: ...;
}
```

