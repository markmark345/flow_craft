# Spec: Fix Issues from feature/realtime-sockets Code Review

**Date:** 2026-02-24
**Branch:** fix/realtime-sockets-review *(สร้างตอนจะแก้)*
**Status:** ✅ Complete — all fixes shipped, `tsc --noEmit` clean

---

## Goal

แก้ปัญหาที่พบจาก code review ของ `feature/realtime-sockets` ก่อน merge เข้า master
จัดลำดับตาม severity: Critical → Important → Suggestions

---

## Scope

**In scope:**
- แก้ทุก Critical และ Important issues (ต้องเสร็จก่อน merge)
- แก้ Suggestions ที่ทำได้เร็ว (ย้าย DTO, แก้ `any` types, สี tooltip)

**Out of scope:**
- Rewrite E2E tests ใหม่ทั้งหมด (แค่ fix ให้ not be no-op)
- Auth system redesign (WS auth ใช้ short-lived token พอก่อน)

---

## Issues Backlog

### 🔴 Critical

- [ ] **C1 — Data Race ใน WebSocket Hub** `api/internal/adapters/websocket/hub.go:62-71`
  - ปัญหา: ถือ `RLock` แต่ `delete(h.clients, client)` ภายใน loop → data race
  - แก้: เปลี่ยนเป็น `Lock()` + collect dead clients ก่อน แล้วค่อย delete หลัง loop
  ```go
  // pattern ที่ถูก:
  var dead []*Client
  h.mu.RLock()
  for client := range h.clients { ... dead = append(dead, client) }
  h.mu.RUnlock()
  h.mu.Lock()
  for _, c := range dead { delete(h.clients, c); close(c.send) }
  h.mu.Unlock()
  ```

- [ ] **C2 — Postgres Listener ไม่มี Reconnect** `api/internal/adapters/realtime/postgres_listener.go:53-59`
  - ปัญหา: connection drop → listener return → WS updates หยุดเงียบๆ
  - แก้: เพิ่ม retry loop ด้วย exponential backoff ใน `Listen()` หรือใน goroutine caller ใน main.go

---

### 🟠 Important

- [ ] **I1 — WebSocket Endpoint ไม่มี Auth** `router.go`
  - ปัญหา: `/ws` อยู่ใน `apiPublic` → ทุกคน connect ได้
  - แก้: รับ `?token=` query param → validate ใน `HandleWS` ก่อน upgrade

- [ ] **I2 — `RealtimeService` Port ไม่ได้ถูกใช้จริง** `api/internal/core/ports/realtime.go`
  - ปัญหา: interface ประกาศแต่ Hub ถูก wire โดยตรง ไม่ผ่าน port → dead code
  - แก้: implement interface บน Hub หรือลบ port แล้ว wire ผ่าน interface ที่ main.go

- [ ] **I3 — `json.Marshal` errors ถูก ignore** `slack/slack.go:23`, `notion/notion.go:73`
  - ปัญหา: `jsonBody, _ := json.Marshal(body)` — error ถูก discard
  - แก้: return error ถ้า Marshal fail

- [ ] **I4 — `GetDailyStats` ไม่ filter user** `run_repository.go:240-268`
  - ปัญหา: stats ของทุก user รวมกัน → user เห็น aggregate ของทั้ง platform
  - แก้: เพิ่ม `userID string` parameter ใน port signature + WHERE clause

- [ ] **I5 — Global Variables ไม่มี admin check** `variable_service.go:100-103, 169-172`
  - ปัญหา: ทุกคน update/delete global var ได้
  - แก้: เพิ่ม role check ก่อน mutate global variable

- [ ] **I6 — `broadcast` channel บล็อกได้** `hub.go:89`
  - ปัญหา: unbuffered channel send → บล็อกถ้า Hub ไม่ run
  - แก้: ใช้ buffered channel (`make(chan []byte, 256)`) หรือ non-blocking select

- [ ] **I7 — `interface{}` ใน core ports และ Hub** `ports/realtime.go:12`, `hub.go:79`
  - ปัญหา: ขัด rule "no `any`/`interface{}`"
  - แก้: ใช้ typed parameter หรือ `json.RawMessage`

- [ ] **I8 — `useWebSocket()` ไม่ใช่ singleton — เปิด N connections ถ้า call จาก N components**
  - ปัญหา: hook ใช้ `useRef` ต่อ instance → แต่ละ component ที่ call `useWebSocket()` เปิด WebSocket ใหม่แยกกัน
  - ตัวอย่างในปัจจุบัน: `use-run-detail-page.ts` call `useWebSocket()` โดยตรง (line 67) + `useRunDetailQuery` ก็ call ด้วย → 2 connections ต่อ 1 page
  - แก้: เปลี่ยนเป็น module-level singleton หรือ React Context Provider pattern
  ```ts
  // Option A: module-level singleton (ง่ายที่สุด)
  let _instance: ReturnType<typeof createWebSocketClient> | null = null;
  export function useWebSocket() { return _instance ??= createWebSocketClient(); }

  // Option B: WebSocketProvider + useContext (ดีกว่าสำหรับ SSR / testing)
  ```

---

### 🟡 Suggestions

- [ ] **S1 — `any` types ใน WebSocket hook** `use-websocket.ts:13,15`
  - แก้: เปลี่ยน `any` → `unknown` + narrow type ที่ subscriber

- [ ] **S2 — Tooltip hardcode สีใน RunActivityChart** `RunActivityChart.tsx:86-94`
  - แก้: เปลี่ยน `rgba(255,255,255,...)` / `#1a1a1a` → `var(--panel)` / `var(--text)`

- [ ] **S3 — Dashboard E2E test เป็น no-op** `e2e/dashboard.spec.ts:19-31`
  - แก้: assert stat cards ปรากฏ, ลบ `waitForTimeout`, ลบ debug screenshots

- [ ] **S4 — `DailyStatDTO` อยู่ผิดที่** `runsApi.ts:53-58`
  - แก้: ย้ายไป `web/src/types/dto.ts`

- [ ] **S5 — `days` hardcode ใน history endpoint** `run_handler.go:306-308`
  - แก้: รับ `?days=N` query param, default 7

- [ ] **S6 — `c.Next()` ค้างใน router** `router.go:53-55`
  - แก้: ลบ middleware stub ที่เขียนค้างไว้ออก

- [ ] **S7 — `RECONNECT_INTERVAL` hardcode ใน use-websocket.ts:18**
  - ปัญหา: `const RECONNECT_INTERVAL = 3000` อยู่ inline ขัด no-hardcode rule
  - แก้: ย้ายไป `web/src/lib/constants.ts` เป็น `constants.wsReconnectIntervalMs`

- [ ] **S8 — `// log error` comment ไม่ log จริง** `hub.go:110`
  - ปัญหา: `if websocket.IsUnexpectedCloseError(...)` block มี comment แต่ไม่ call logger → error ถูก discard เงียบๆ
  - แก้: เพิ่ม `h.logger.Warn()...` จริงๆ

- [ ] **S9 — `console.log`/`console.error` ใน use-websocket.ts production code**
  - `ws.onopen`, `ws.onclose`, `ws.onerror` (line 34, 39, 46)
  - แก้: ลบออก หรือ wrap ด้วย `process.env.NODE_ENV === "development"` guard

---

### 🔴 Critical (Frontend Data Fetching)

- [ ] **F1 — `queryClient.invalidateQueries` เป็น no-op** `use-run-detail-page.ts:78-79`
  - ปัญหา: เรียก `queryClient.invalidateQueries({ queryKey: ["run", runId] })` และ `["run-steps", runId]` แต่ `useRunDetailQuery` / `useRunStepsQuery` ใช้ manual `useEffect`+Zustand ไม่ใช่ React Query → **invalidate ไม่มีผลเลย** เป็น dead code ที่ทำให้เข้าใจผิด
  - แก้: ลบ `queryClient.invalidateQueries` ทั้ง 2 บรรทัดออก (WS → `reloadRun()` + `reloadSteps()` ทำงานอยู่แล้ว) หรือ migrate ทั้ง feature ไปใช้ React Query จริงๆ

---

### 🟠 Important (Frontend Data Fetching)

- [ ] **F2 — Migrate ทุกอย่างไป React Query** ✅ ตัดสินใจแล้ว: Option A
  - **Decision:** Migrate ทั้งโปรเจคไปใช้ `@tanstack/react-query` เป็น standard เดียว
  - ลบ manual `useEffect`+`useState` fetching ออกจากทุก hook
  - ลบ Zustand stores ที่ cache server data ออก (flows, runs, run-steps)
  - เก็บ Zustand ไว้เฉพาะ **pure UI state** (sidebar open/close, theme, active run id ฯลฯ)

  **Hooks ที่ต้อง migrate:**
  | Hook | Query Key แนะนำ |
  |---|---|
  | `useFlowsQuery` | `["flows", scope, projectId]` |
  | `useRunsQuery` | `["runs", scope, projectId]` |
  | `useRunDetailQuery` | `["run", runId]` |
  | `useRunStepsQuery` | `["run-steps", runId]` |
  | `useFlowDetailQuery` | `["flow", flowId]` |
  | `useCredentialsPage` (fetch part) | `["credentials", scope, projectId]` |
  | `useVariablesPage` (fetch part) | `["variables", scope, projectId]` |
  | `useBuilderLoad` | `["flow", flowId]` (shared กับ detail) |

  **Pattern ที่จะใช้หลังจาก migrate:**
  ```ts
  // แทน manual useEffect+useState
  const { data: flows = [], isLoading, error } = useQuery({
    queryKey: ["flows", scope, projectId],
    queryFn: () => listFlows(scope, projectId),
    enabled: scope !== "project" || !!projectId,
  });

  // WS invalidation ทำงานได้จริงหลัง migrate
  subscribe("run_update", (payload: RunUpdateEvent) => {
    queryClient.invalidateQueries({ queryKey: ["runs"] });
    queryClient.invalidateQueries({ queryKey: ["run", payload.runId] });
  });
  ```

  **Mutations:**
  ```ts
  const createMutation = useMutation({
    mutationFn: createVariable,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["variables"] }),
  });
  ```

- [ ] **F3 — `onCancel` และ `onRerun` กลืน error เงียบ** `use-run-detail-page.ts:119,129`
  - ปัญหา: `catch {}` — error ถูก ignore → user กดปุ่มแล้วไม่มีอะไรเกิดขึ้น ไม่รู้ว่า fail
  - แก้: เพิ่ม `showError(...)` ใน catch blocks

- [ ] **F4 — `loading` flash ทุกครั้งที่ WS trigger reload** `use-run-steps.ts:22`, `use-run-detail.ts:17`
  - ปัญหา: `setLoading(true)` ถูกเรียกทุก reload รวมถึง background refresh จาก WS/polling → UI กระพริบ
  - แก้: แยก initial load vs background refresh — เฉพาะ initial load ที่ยังไม่มีข้อมูลให้ setLoading(true)
  ```ts
  // pattern ที่ดีกว่า:
  if (!steps.length) setLoading(true);  // initial only
  ```

- [ ] **F5 — `any` ใน WS payload ของ run hooks** `use-run-detail.ts:66`, `use-run-steps.ts:65`
  - ปัญหา: `(payload: any)` ขัด no-any rule
  - แก้: ใช้ `RunUpdateEvent` type ที่นิยามไว้ใน `use-websocket.ts` แล้ว

- [ ] **F6 — `router.replace(returnPath as any)` type cast** `use-credentials-page.ts:90`
  - ปัญหา: ใช้ `as any` bypass TypeScript type check
  - แก้: ใช้ proper Next.js route type หรือ cast เป็น `string` แทน `any`

---

### 🟡 Suggestions (Frontend Data Fetching)

- [ ] **F7 — ไม่มี request cancellation ใน credentials/variables page**
  - `use-credentials-page.ts:65-79`, `use-variables-page.ts:55-69`
  - ปัญหา: inner async IIFE (`void (async () => {...})()`) ไม่มี cleanup ถ้า unmount ระหว่าง fetch
  - แก้: ใช้ `AbortController` + `signal` หรือ ignore-after-unmount pattern

- [ ] **F8 — `useFlowsQuery` และ `useRunsQuery` ไม่มี error state ที่ consistent กัน**
  - `use-flows.ts:27`: ใช้ `getErrorMessage(err)` helper
  - `use-runs.ts:26`: ใช้ `err instanceof Error ? err.message : "..."` โดยตรง
  - แก้: ใช้ `getErrorMessage(err)` helper เหมือนกันทุกที่

---

## Implementation Checklist

*(กรอกตอนจะเริ่มแก้จริง)*

- [x] C1: Fix Hub data race
- [x] C2: Add PG listener reconnect loop
- [x] I1: Add WS token auth
- [x] I2: Wire RealtimeService port properly
- [x] I3: Handle json.Marshal errors
- [x] I4: Scope GetDailyStats by userID
- [x] I5: Add global variable admin check
- [x] I6: Buffer broadcast channel
- [x] I7: Remove interface{} from ports/hub
- [x] I8: Make useWebSocket a singleton (module-level or Context Provider)
- [x] S1: Fix `any` in use-websocket.ts
- [x] S2: Fix tooltip colors in RunActivityChart
- [x] S3: Fix dashboard E2E test
- [x] S4: Move DailyStatDTO to dto.ts
- [x] S5: Accept `?days=` query param
- [x] S6: Remove dangling c.Next() in router
- [x] S7: Move RECONNECT_INTERVAL to constants.ts
- [x] S8: Actually log error in hub.go IsUnexpectedCloseError block
- [x] S9: Remove/guard console.log calls in use-websocket.ts
- [x] F1: Remove dead queryClient.invalidateQueries calls
- [x] F2a: Migrate useFlowsQuery → React Query
- [x] F2b: Migrate useRunsQuery → React Query
- [x] F2c: Migrate useRunDetailQuery → React Query
- [x] F2d: Migrate useRunStepsQuery → React Query
- [x] F2e: Migrate useFlowDetailQuery → React Query
- [x] F2f: Migrate useCredentialsPage fetch → React Query
- [x] F2g: Migrate useVariablesPage fetch → React Query
- [x] F2h: Remove Zustand stores for server data (flows, runs, run-steps)
- [x] F3: Add showError to onCancel/onRerun catch blocks
- [x] F4: Fix loading flash on background WS refresh
- [x] F5: Replace `any` payload with RunUpdateEvent in run hooks
- [x] F6: Fix `router.replace(returnPath as any)` cast
- [x] F7: Mitigated — credentials/variables data fetch now uses React Query (auto-cancels); project IIFE left as-is (low risk)
- [x] F8: Standardize error extraction with getErrorMessage helper

---

## Deviations

- **F6**: `router.replace(returnPath as any)` → replaced with `window.history.replaceState(null, "", returnPath)` instead of a type cast. The `RouteImpl<T>` branded type in Next.js 14 typed routes cannot be safely satisfied with a dynamic string; `replaceState` is semantically more correct for OAuth param cleanup (no re-render needed).
- **F7**: Partially mitigated. The credentials/variables data fetch is now handled by React Query which cancels automatically on unmount. The project-loading IIFE (`getProject`) still has no AbortController — risk is low (single small request) and left for a future cleanup pass.
- **S5**: Was already implemented in a previous session (accepted `?days=N` param, default 7, max 90).

## Changelog

All issues from the feature/realtime-sockets code review resolved across 6 commits:

| Commit | Items |
|--------|-------|
| `5be94ec` | I4, I5 — stats scoped to user, global variable admin check |
| `30643ad` | I8, S1, S7, S9 — WS singleton, any→unknown, constant extraction, remove console.log |
| `89d32e8` | F1, F3, F4, F5 — dead invalidations, error surfacing, loading flash, any payload |
| `bde6c9e` | S2, S4 — tooltip CSS vars, DailyStatDTO moved to dto.ts |
| `4e86172` | F2 (all) — full React Query migration, remove Zustand server caches |
| `30bfeec` | F6, F8, S3 — as-any router cast, getErrorMessage standardization, E2E test |

Earlier commits (from previous sessions): C1, C2, I1, I2, I3, I6, I7, S6, S8
