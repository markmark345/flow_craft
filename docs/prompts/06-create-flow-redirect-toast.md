# PROMPT: Create Flow -> Redirect to Builder + Success Toast (FlowCraft)

Repo root:
(this repo)

Context:

- Frontend: Next.js (App Router) + Tailwind + Zustand
- Architecture separates logic (hooks/store/services) from UI
- There is a "New Flow" page with a Create button
- Flow Builder page exists at route like: /flows/[id]/builder

Goal:
When user clicks "Create" on New Flow:

1. Create flow (API or mock)
2. Show success popup/toast
3. Redirect to Flow Builder page immediately after success

This is NOT a mockup. Apply real code changes.

---

## A) Identify/Create shared Toast system (MODIFY or CREATE)

Check if a global toast system already exists:

- e.g. `web/src/shared/hooks/useToast`
- or `web/src/shared/components/Toast`
- or Zustand-based toast store

If not present, create a minimal global toast system:

Create:
`web/src/shared/store/useToastStore.ts`

Requirements:

- Zustand store
- Methods:
  - showSuccess(message: string)
  - showError(message: string)
- Toast auto-dismiss after ~2-3 seconds
- Support multiple toasts (stacked)

Create UI if missing:
`web/src/shared/components/ToastContainer.tsx`

- Renders toasts globally
- Positioned top-right
- Uses existing theme tokens (accent/success/error)
- Uses subtle neon glow (shadow-focus / glow-success)

Ensure ToastContainer is mounted once in root layout.

---

## B) Create Flow logic (HOOK level)

Locate New Flow feature:
Likely under:

- `web/src/features/flows/`

Create or update:
`web/src/features/flows/hooks/useCreateFlow.ts`

Responsibilities:

- Accept flow name
- Call API client (or mock if API not ready)
- Return created flow id
- Handle loading/error

Example behavior (conceptual):

- await createFlow({ name })
- return flow.id

NO routing or UI logic here.

---

## C) Wire Create button behavior (CONTAINER level)

Locate New Flow page container:

- e.g. `NewFlowPage.tsx` or `/app/flows/new/page.tsx`

Modify container logic:

- On submit:
  1. Call useCreateFlow
  2. On success:
     - show success toast: "Flow created"
     - redirect to `/flows/{id}/builder`
  3. On error:
     - show error toast

Use:

- Next.js router (`useRouter` from next/navigation)
- Toast store

Ensure:

- No duplicated logic
- UI components remain presentational only

---

## D) UX details (IMPORTANT)

- Disable Create button while submitting
- Prevent double submit
- Redirect should feel instant (toast can remain visible after navigation)
- Do NOT block redirect waiting for toast animation

---

## E) Files likely to be modified / created

Expected changes may include:

- `web/src/features/flows/hooks/useCreateFlow.ts`
- `web/src/features/flows/components/NewFlowForm.tsx`
- `web/app/(main)/flows/new/page.tsx`
- `web/src/shared/store/useToastStore.ts` (if missing)
- `web/src/shared/components/ToastContainer.tsx`
- `web/app/layout.tsx` (mount ToastContainer)

Follow existing structure and naming.

---

## F) Output

Apply changes directly to the repository.
After completion, print a short summary:

- Created files
- Modified files
- Final redirect path used after create

Proceed now.



