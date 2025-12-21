# Stitch: Flow Builder

- Folder: `docs/ui/stitch_flowcraft_dashboard__5_`
- Screenshot: `docs/ui/stitch_flowcraft_dashboard__5_/screen.png`
- Prototype HTML: `docs/ui/stitch_flowcraft_dashboard__5_/code.html`

## Implemented In App

- Route: `/flows/[id]/builder`
- Components:
  - `web/src/features/builder/components/builder-topbar.tsx`
  - `web/src/features/builder/components/canvas.tsx`
  - `web/src/features/builder/components/node-palette.tsx`
  - `web/src/features/builder/components/inspector.tsx`
  - `web/src/features/builder/components/logs-drawer.tsx`

## What This Screen Covers

- Topbar controls: **Versions**, **Run**, **Save**, undo/redo
- Left palette: node search + categorized node list (drag & drop)
- Canvas: zoom controls, minimap, node graph editing
- Inspector: **Configuration / Input-Output / Notes** tabs and node config forms
- Bottom drawer: execution logs (polling)

