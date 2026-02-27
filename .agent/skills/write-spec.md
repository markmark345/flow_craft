---
trigger: manual
description: Use before starting ANY coding task to write a spec doc. Also use after finishing to update it with actual changes.
---

# Skill: Write Spec Document

This skill covers the full spec lifecycle: **before** (plan) and **after** (living doc update).

---

## Phase 1: Before Writing Code

### Step 1: Create the File

```
docs/plans/YYYY-MM-DD-<topic>.md
```

Example: `docs/plans/2026-02-24-add-notion-integration.md`

### Step 2: Fill the Template

```markdown
# Spec: <Task Title>

**Date:** YYYY-MM-DD
**Branch:** feature/<branch-name>
**Status:** 🟡 Planning

---

## Goal
One paragraph. What problem does this solve? Why now?

## Scope

**In scope:**
- Bullet list of what will be built

**Out of scope:**
- Explicitly state what will NOT be done (prevents scope creep)

---

## Design

### Architecture / Approach
Describe the approach chosen and why. If you considered alternatives, note why they were rejected.

### Affected Files
List every file that will be created or modified:
- `api/internal/...` — what changes
- `web/src/...` — what changes

### Data Flow (if applicable)
```
User action → Component → Hook → API → Service → DB
```

### Edge Cases & Error Handling
- What can go wrong?
- How will errors surface to the user?

---

## Implementation Checklist
Step-by-step tasks in order. Each item = one logical commit.

- [ ] Step 1: ...
- [ ] Step 2: ...
- [ ] Step 3: ...
- [ ] Step 4: Update docs/ROADMAP.md
- [ ] Step 5: Run tests / E2E

---

## Open Questions
- Questions that need answers before or during implementation
- Remove entries as they get resolved
```

---

## Phase 2: After Finishing Code

Update the **same spec file** — do not create a new one.

### Add/update these sections:

```markdown
**Status:** ✅ Complete  ← update from 🟡 Planning

---

## Deviations from Plan
Document anything that changed from the original design, and why.

| Original Plan | Actual Implementation | Reason |
|---|---|---|
| Was going to do X | Did Y instead | Found that X caused Z issue |

*(If nothing deviated, write: "No deviations — implemented as planned.")*

---

## Changelog
Summary of what was actually built. Written for a future developer reading this.

- Added `api/internal/temporal/app_nodes_notion.go` — handles createPage action
- Added Notion API client in `api/internal/adapters/external/notion/`
- Frontend catalog: `web/src/features/builder/nodeCatalog/apps/notion.ts`
- Migration `0017_add_notion_credentials.sql` — not needed, uses existing credentials table
```

---

## Status Indicators

| Emoji | Meaning |
|---|---|
| 🟡 | Planning — spec written, coding not started |
| 🔵 | In Progress — coding underway |
| ✅ | Complete — code done, spec updated |
| ❌ | Cancelled — with reason noted |

---

## Checklist

**Before coding:**
- [ ] File created at `docs/plans/YYYY-MM-DD-<topic>.md`
- [ ] Goal is one clear paragraph
- [ ] Scope explicitly lists what is out of scope
- [ ] All affected files are listed
- [ ] Implementation checklist has ≥3 steps
- [ ] Open questions documented

**After coding:**
- [ ] Status updated to ✅ Complete
- [ ] All checklist items marked ✅ / ❌
- [ ] Deviations section filled (or "no deviations" noted)
- [ ] Changelog written with actual files changed
- [ ] `docs/ROADMAP.md` updated
