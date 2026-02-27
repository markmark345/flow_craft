---
trigger: manual
description: Use before designing or building any new UI — page, component, modal, form, or widget. Ensures design stays on-theme.
---

# Skill: FlowCraft UI/UX Design System

Reference this skill before designing any new UI element. All new UI must align with this system.

---

## Theme & Identity

FlowCraft has a **dark-first, developer-tool aesthetic**:
- Clean, minimal, data-dense — not decorative
- Dark mode is primary (`data-theme="dark"`) — navy/dark-teal palette
- Accent is electric blue (`#0099ff`) — used sparingly for interactive elements
- Typography-driven hierarchy — weight and size, not decoration

---

## Color Tokens (Always use CSS vars, never hardcode)

```
/* Backgrounds — use in this order (outermost → innermost) */
--bg         #0f1b23   page/canvas background
--panel      #15202b   sidebar, drawer, topbar
--surface    #15202b   card, modal, input
--surface-2  #0f1b23   nested section, code block bg

/* Text */
--text       #f8fafc   primary text
--muted      #94a3b8   secondary / placeholder / labels

/* Borders */
--border     #1e293b   all borders, dividers

/* Accent (interactive / brand) */
--accent         #0099ff   primary actions, links, focus
--accent-strong  #60a5fa   hover state, gradient end

/* Semantic */
--success   #22c55e   green — running / success
--warning   #fbbf24   amber — pending / warning
--error     #f87171   red — failed / destructive
--trigger   #a855f7   purple — trigger nodes
--slack     #ff4081   pink-red — Slack brand
```

**Tailwind mapping (use these class names):**
```
bg-bg / bg-panel / bg-surface / bg-surface2
border-border
text-text / text-muted
bg-accent / text-accent / bg-accentStrong
bg-success / bg-warning / bg-error / text-success / text-error
```

---

## Typography

| Use | Class | Detail |
|---|---|---|
| Page title | `text-xl font-semibold` | PageHeading h1 |
| Section title | `text-base font-semibold` | Modal title, card header |
| Body | `text-sm` | Default for content |
| Secondary | `text-sm text-muted` | Descriptions, help text |
| Caption/label | `text-xs text-muted` | Table headers, metadata |
| Code / monospace | `font-mono text-sm` | JetBrains Mono |

- Never use `text-lg` or larger in content areas (reserved for marketing)
- Inter for all UI text, JetBrains Mono for code/IDs/JSON

---

## Spacing (8px base grid)

Always use multiples of 4px. Prefer Tailwind spacing scale:

| Value | Tailwind | Usage |
|---|---|---|
| 4px | `p-1 / gap-1` | Icon internal padding |
| 8px | `p-2 / gap-2` | Tight spacing (badge, chip) |
| 12px | `p-3 / gap-3` | Component internal |
| 16px | `p-4 / gap-4` | Card padding default |
| 20px | `p-5` | Modal padding |
| 24px | `p-6` | Page section padding |
| 32px | `p-8` | Page outer padding (md+) |

---

## Border Radius

| Token | Value | Use |
|---|---|---|
| `rounded` (xs) | 4px | Tag, chip, small badge |
| `rounded-sm` | 6px | Button, input, small card |
| `rounded-md` | 8px | Panel, card, dropdown |
| `rounded-lg` | 12px | Modal, large card, sidebar |
| `rounded-full` (pill) | 999px | Status dot, avatar, toggle |

---

## Shadows

| Token | Use |
|---|---|
| `shadow-soft` | Panel, card (default elevation) |
| `shadow-lift` | Modal, dropdown, popover (floating) |
| `shadow-focus` | Input/button focus ring (2px accent glow) |
| `shadow-glowAccent` | Accent highlight on hover |
| `shadow-glowError` | Danger/error button hover |
| `shadow-glowSuccess` | Success state |

---

## Component Patterns

### Button
```tsx
<Button variant="primary" />   // bg-accent, white text — primary CTA
<Button variant="secondary" /> // bg-surface + border — secondary action
<Button variant="ghost" />     // transparent, hover bg-surface2 — toolbar
<Button variant="danger" />    // bg-red — destructive action
<Button variant="link" />      // text only, underline on hover
```
- Size: `md` (h-10) default, `sm` (h-9) for compact areas
- Always use `<Button>` from `@/components/ui/button` — never `<button>`
- Primary button: max 1 per view section

### Input / Textarea
```tsx
<Input />     // h-10, rounded-md, border-border, focus:shadow-focus
<Textarea />  // same, multiline
```
- Pair with `<label className="text-sm text-muted">` above input
- Help text: `<p className="text-xs text-muted mt-1">`
- Error state: add `border-red` class + error message below in `text-xs text-error`

### Panel (container)
```tsx
<Panel>        // bg-surface border-border rounded-md shadow-soft
<Panel className="p-4">  // always add padding explicitly
```

### Modal
- Width: `w-[400px]` standard, `w-[560px]` for forms with more fields
- Background: `bg-panel border border-border rounded-lg shadow-lift`
- Header: `text-base font-semibold` + close `<IconButton icon="close" />`
- Padding: `p-5`
- Footer: `flex justify-end gap-2` with Cancel (ghost) + Confirm (primary/danger)

### Badge
```tsx
<Badge label="Running" tone="success" />   // green
<Badge label="Failed" tone="danger" />     // red
<Badge label="Pending" tone="warning" />   // amber
<Badge label="Info" tone="default" />      // muted
```
- Uses `color-mix` for tinted bg — always use `<Badge>` component

### Page Layout
```tsx
// Standard page shell
<div className="min-h-screen bg-bg">
  <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
    <PageHeading title="..." description="..." actions={<Button>...</Button>} />
    <div className="mt-6">
      {/* content */}
    </div>
  </div>
</div>
```

### Grid layouts
```tsx
// Single sidebar
<div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">

// Equal columns
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

// Stat widgets
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
```

---

## Custom CSS Classes (use when needed)

| Class | Effect |
|---|---|
| `.fc-topbar-highlight` | 2px accent gradient line at top |
| `.fc-nav-active` | Active nav item: tinted bg + left accent bar |
| `.fc-accent-underline` | Underline effect with accent color |
| `.fc-canvas` | Workflow canvas background |

---

## Interactive States

| State | How to express |
|---|---|
| Hover | `hover:bg-surface2` (light) or `hover:bg-panel` (on surface) |
| Focus | `focus:outline-none focus:shadow-focus` (always both) |
| Active/selected | `bg-accent/10 text-accent` or `.fc-nav-active` |
| Disabled | `disabled:opacity-60` + no cursor change needed |
| Loading | `<Skeleton />` component or `opacity-50 pointer-events-none` |
| Error | `border-red shadow-glowError` on input |

---

## Iconography

- Use `<Icon name="..." />` or `<IconButton icon="..." />` from `@/components/ui/icon`
- Keep icon sizes consistent: `size-4` (16px) in text, `size-5` (20px) in buttons

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Use CSS var tokens (`bg-accent`, `text-muted`) | Hardcode colors (`text-[#0099ff]`) |
| Use `<Panel>` for card surfaces | Use raw `<div className="bg-white rounded">` |
| Use `shadow-soft` for cards, `shadow-lift` for modals | Use `shadow-md` or Tailwind defaults |
| Keep spacing on 8px grid | Use arbitrary values like `mt-[13px]` |
| Max 1 primary button per section | Stack multiple primary buttons |
| Use `text-muted` for secondary info | Use `text-gray-400` or raw colors |
| Match dark theme by default | Design only for light mode |

---

## Design Checklist (before building)

- [ ] Colors use CSS var tokens only (no hardcoded hex)
- [ ] Component uses existing UI primitives (`<Button>`, `<Input>`, `<Panel>`, etc.)
- [ ] Spacing on 8px grid
- [ ] Border radius matches token scale
- [ ] Shadow level matches elevation (card=soft, modal=lift)
- [ ] Both light & dark mode considered (tokens handle both automatically)
- [ ] Interactive states defined (hover, focus, disabled)
- [ ] Loading and empty states defined
- [ ] Mobile layout considered (`md:` breakpoint minimum)
- [ ] No raw HTML tags in feature components
