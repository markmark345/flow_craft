# PROMPT: Brand Logo Design + Wiring (FlowCraft)

You are working inside this repository:

(this repo)

This is a monorepo with:

- Frontend: Next.js + Tailwind + Zustand (web/)
- Backend: Go (api/)

Your task is to DESIGN a brand logo and APPLY it directly into the frontend codebase.
This is NOT a mockup. You must create real files.

---

## Brand

Name: FlowCraft  
Tagline (optional): Workflow Builder

## Logo Design Requirements

- Generate logo as **pure SVG** (no external images, no downloads).
- Free to use, no copyright issues.
- Style: modern developer tool (clean, minimal, flat).
- Concept:
  - Primary: workflow nodes connected by edges (3 nodes + 2 edges)
  - Fallback: monogram "FC" inside a rounded square
- Must work on both light and dark backgrounds.
- Use accent color from design tokens in `docs/figma-spec.md` when possible.

---

## A) Assets (CREATE FILES)

Create the following files:

1. `web/public/logo.svg`

   - Square viewBox (32x32)
   - Scalable (no fixed px inside SVG)
   - Centered icon

2. `web/public/favicon.svg`
   - Same icon as logo.svg
   - Optimized for browser tab

---

## B) UI Component (CREATE FILE)

Create:

`web/src/shared/components/BrandLogo.tsx`

Requirements:

- Uses `next/image`
- Props:
  - `size?: number` (default: 28)
  - `compact?: boolean` (default: false)
  - `showTagline?: boolean` (default: false)
- Behavior:
  - compact = true -> icon only
  - compact = false -> icon + "FlowCraft" text
  - showTagline = true -> show tagline under name
- Must NOT duplicate logo markup elsewhere.

---

## C) Wire Logo into App Layout (MODIFY FILES)

1. Locate the main sidebar component and insert `<BrandLogo />` at the top.
2. If a top bar exists:
   - Show compact logo on smaller screens (responsive).
3. Remove any hardcoded text logo if exists.

---

## D) Metadata & Favicon (MODIFY FILE)

Locate the Next.js root layout file:

- `web/app/layout.tsx` OR
- `web/app/(main)/layout.tsx`

Update metadata safely:

- title: "FlowCraft"
- description: "n8n-like workflow builder"
- icon: `/favicon.svg`

Do NOT break existing metadata exports.

---

## E) Rules

- Do NOT add new dependencies.
- Reuse existing design tokens and Tailwind setup.
- Keep code minimal and readable.
- Follow existing project structure and patterns.

---

## Output & Execution

- Apply all changes directly to the repository (create/modify files).
- After finishing, print a short summary:
  - Created files
  - Modified files

Proceed now.

