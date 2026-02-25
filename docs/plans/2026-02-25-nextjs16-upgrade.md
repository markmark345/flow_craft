# Next.js 16 Upgrade

**Date:** 2026-02-25
**Branch:** feature/realtime-sockets

## Goal
Upgrade Next.js from 14.2.5 → 16.x to resolve 10 known CVEs (CRITICAL severity).

## Scope
- In: dependency upgrade, async params migration, next.config.js cleanup
- Out: React Flow v11→v12 migration (separate concern), E2E test execution

## Design

**Key breaking changes 14→15→16:**
1. `params` / `searchParams` in Page/Layout components are now `Promise<…>` — must `await` them
2. React 19 required (React 18 may still be compatible via peer dep)
3. `eslint-config-next` must match Next.js version

**Pages with dynamic params (7 files):**
- `app/(builder)/flows/[id]/builder/page.tsx` → `params.id`
- `app/(main)/runs/[id]/page.tsx` → `params.id`
- `app/(main)/flows/[id]/page.tsx` → `params.id`
- `app/(main)/projects/[id]/settings/page.tsx` → `params.id`
- `app/(main)/projects/[id]/variables/page.tsx` → `params.id`
- `app/(main)/projects/[id]/credentials/page.tsx` → `params.id`
- `app/(docs)/docs/[...slug]/page.tsx` → `params.slug`

**Layouts:** None use params — no changes needed.

## Checklist

- [x] Upgrade Next.js + eslint-config-next to ^16
- [x] Upgrade React + react-dom + @types to 19 (if required)
- [x] Fix async params in 7 dynamic route pages
- [x] Update next.config.js (remove experimental.typedRoutes if promoted to stable)
- [x] Run `pnpm tsc --noEmit` — fix all type errors
- [x] Run `pnpm build` — must succeed

## Deviations

1. **React 19 `useRef` overloads changed**: In React 19, `useRef<T>(null)` now returns `RefObject<T | null>` (overload: `T | null → RefObject<T | null>`). Cascading fix required across ~15 files — all `RefObject<T>` in function signatures updated to `RefObject<T | null>`.
2. **`eslint-config-next@16` requires ESLint 9**: Only a `WARN` (not error), not blocking. ESLint upgrade deferred to avoid flat-config migration.
3. **`typedRoutes` promoted to stable**: Moved from `experimental.typedRoutes` to top-level `typedRoutes: true` in `next.config.js`.
4. **`tsconfig.json` auto-updated by build**: Next.js 16 added `.next/dev/types/**/*.ts` to includes and changed `jsx: "preserve"` → `"react-jsx"`.
5. **Turbopack workspace warning**: Next.js infers incorrect workspace root due to unrelated `~/package-lock.json`. Non-blocking, deferred.

## Changelog

- Upgraded `next` 14.2.5 → 16.1.6 (resolves 10 CVEs including CRITICAL)
- Upgraded `react` + `react-dom` 18.3.1 → 19.2.4
- Upgraded `@types/react` + `@types/react-dom` 18.x → 19.x
- Upgraded `eslint-config-next` 14.x → 16.1.6
- Migrated async `params` in all 7 dynamic route pages (`Promise<{ id }>` + `await`)
- Fixed `useRef` signatures across 15 files for React 19 type overload change
- Fixed `JSX.Element` → `ReactElement` in `run-utils.tsx`
- Fixed `useRef<T>()` → `useRef<T>(undefined)` in `use-auth-gate.ts`
- Moved `typedRoutes` from `experimental` to stable config
- `pnpm tsc --noEmit` → 0 errors, `pnpm build` → ✅ success
