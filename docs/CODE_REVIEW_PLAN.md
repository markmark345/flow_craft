# 📋 Code Review & Refactoring Plan

> **Last Updated**: 2026-01-14
> **Status**: ✅ IN PROGRESS - Violation 2 (Hooks Extraction)
> **Objective**: Bring codebase into compliance with [AI Development Rules](../.clauderc)

---

## 🚀 CURRENT PROGRESS (Updated: 2026-01-14)

### Violation 2: Hooks Extraction Status
**Branch**: `refactor/extract-hooks-new-flow`
**Progress**: 7 of 41 files completed (17%)
**Target**: 33 files (80%) before plan update

#### ✅ Completed Files (7)
| File | Before | After | Reduction | Hook File |
|------|--------|-------|-----------|-----------|
| `new-flow-page.tsx` | 145 | 91 | -37% | `use-new-flow-form.ts` (136 lines) |
| `inspector.tsx` | 122 | 95 | -22% | `use-inspector.ts` (121 lines) |
| `canvas.tsx` | 296 | 89 | -70% | `use-canvas.ts` (326 lines) |
| `flows-page.tsx` | 293 | 143 | -51% | `use-flows-page.ts` (340 lines) |
| `runs-page.tsx` | 467 | 270 | -42% | `use-runs-page.ts` (200 lines) |
| `credentials-page.tsx` | 382 | 244 | -36% | `use-credentials-page.ts` (227 lines) |
| `variables-page.tsx` | 449 | 328 | -27% | `use-variables-page.ts` (221 lines) |

#### 🔄 In Progress (2)
- `settings-page.tsx` → `use-settings-page.ts` (hook created, component pending)
- `run-detail-page.tsx` → `use-run-detail-page.ts` (hook created, component pending)

#### 📊 Impact Metrics
- **Total Lines Reduced**: ~900 lines across 7 files
- **Average Reduction**: 40.7% per file
- **Hooks Separated**: 75+ hook usages extracted
- **Custom Hooks Created**: 9 new hook files (1,771 total lines)

#### 📝 Commits Made
1. `996658b` - Initial extraction: new-flow-page
2. `2aa045c` - Inspector + canvas extraction
3. `55522a1` - Flows-page extraction with pagination fix
4. `27c1727` - Runs, credentials, variables extraction (3 files)
5. `e42ebc1` - Hooks for settings and run-detail pages

#### 🎯 Next Steps
1. Complete remaining 26 files to reach 80% (33 files)
2. Update this plan with detailed statistics
3. Final commit and merge to master

---

## 📊 Executive Summary

After comprehensive analysis of the FlowCraft codebase, we identified **multiple violations** across frontend and backend that deviate from our established coding standards. This document provides a detailed roadmap for systematic refactoring.

### Key Metrics
- **Frontend Violations**: 1,424 direct HTML tags, 239 misplaced hooks
- **Backend Violations**: Missing hexagonal architecture, 3 `interface{}` usages, insufficient test coverage
- **Files Affected**: 106+ files requiring changes
- **Estimated Effort**: 3-4 weeks for complete refactoring

---

## 🎨 FRONTEND VIOLATIONS

### ❌ **VIOLATION 1: Direct HTML Tags Instead of Shared Components**

**Severity**: 🔴 CRITICAL
**Count**: 1,185 occurrences in 64 files
**Rule Violated**: "BAN: Direct HTML tags (`<div>`, `<button>`) in feature components"

#### Problem
Feature components directly use HTML primitives instead of shared UI components:

```tsx
// ❌ WRONG - web/src/features/builder/components/canvas.tsx:260-287
<button
  type="button"
  className="p-2 hover:bg-surface2 text-muted"
  onClick={() => rfInstance?.zoomIn()}
>
  <Icon name="add" />
</button>
```

#### Solution
```tsx
// ✅ CORRECT
import { IconButton } from '@/components/ui/icon-button'

<IconButton
  icon="add"
  onClick={() => rfInstance?.zoomIn()}
  variant="ghost"
/>
```

#### Files Requiring Changes
| File | Line Range | Violations | Priority |
|------|-----------|------------|----------|
| `canvas.tsx` | 260-287 | 9 buttons | High |
| `inspector.tsx` | 56-84 | 3 buttons | High |
| `new-flow-page.tsx` | 80-143 | 12 divs, 3 labels | High |
| `flows-page.tsx` | Multiple | 15+ | Medium |
| `runs-page.tsx` | Multiple | 38+ | Medium |
| ...61 more files | - | 1,100+ | - |

#### Action Items
1. ✅ Create missing shared components in `src/components/ui/`:
   - `IconButton.tsx` - For icon-only buttons
   - `TabGroup.tsx` - For tab navigation
   - `FormLabel.tsx` - For form labels
   - `Card.tsx` - For panel/card layouts
   - `Container.tsx` - For layout divs

2. ✅ Refactor feature components to use shared components
3. ✅ Add ESLint rule to prevent future violations:
   ```json
   {
     "rules": {
       "no-restricted-syntax": [
         "error",
         {
           "selector": "JSXElement[name.name=/^(div|button|input|span|label)$/]",
           "message": "Use shared components from @/components/ui/ instead"
         }
       ]
     }
   }
   ```

---

### ❌ **VIOLATION 2: Hooks Inside UI Components**

**Severity**: 🔴 CRITICAL
**Count**: 239 hook usages in 42 files
**Rule Violated**: "BAN: Hooks (`useState`, `useEffect`) inside UI components"

#### Problem
UI components contain business logic through hooks:

```tsx
// ❌ WRONG - web/src/features/flows/components/new-flow-page.tsx:5-46
export function NewFlowPage() {
  const [name, setName] = useState("");
  const [scope, setScope] = useState<WorkspaceScope>("personal");

  useEffect(() => {
    loadProjects().catch(() => {});
  }, [loadProjects]);

  // ... more logic
}
```

#### Solution
```tsx
// ✅ CORRECT - Extract to hooks/useNewFlow.ts
export function useNewFlow() {
  const [name, setName] = useState("");
  const [scope, setScope] = useState<WorkspaceScope>("personal");

  useEffect(() => {
    loadProjects().catch(() => {});
  }, [loadProjects]);

  return { name, setName, scope, setScope, /* ... */ };
}

// Component only renders
export function NewFlowPage() {
  const flow = useNewFlow();
  return <NewFlowForm {...flow} />;
}
```

#### Files Requiring Refactoring
| Component | Hooks Count | Extract To | Priority |
|-----------|-------------|------------|----------|
| `canvas.tsx` | 11 | `useCanvas.ts` | Critical |
| `new-flow-page.tsx` | 8 | `useNewFlow.ts` | High |
| `inspector.tsx` | 6 | `useInspector.ts` | High |
| `flows-page.tsx` | 15 | `useFlowsPage.ts` | High |
| `credentials-page.tsx` | 18 | `useCredentials.ts` | Medium |
| ...37 more files | 181+ | - | - |

#### Action Items
1. ✅ Create `hooks/` directory in each feature module
2. ✅ Extract all logic to dedicated custom hooks (1 file = 1 hook)
3. ✅ Components should ONLY handle rendering
4. ✅ Add TypeScript interface for hook return values

---

### ❌ **VIOLATION 3: Files Exceeding 150 Lines**

**Severity**: 🟡 HIGH
**Rule Violated**: "File Size: Max 150 lines"

#### Violations
| File | Lines | Excess | Action Required |
|------|-------|--------|-----------------|
| `canvas.tsx` | 296 | +146 | Split into 3 files |
| `new-flow-page.tsx` | 145 | -5 | Near limit (acceptable) |
| `inspector.tsx` | 121 | -29 | OK |

#### Action Plan for `canvas.tsx`
Split into:
1. `canvas.tsx` (80 lines) - Main orchestration
2. `canvas-controls.tsx` (40 lines) - Zoom/fit controls
3. `canvas-handlers.tsx` (50 lines) - Event handlers
4. Move hooks to `hooks/useCanvas.ts` (126 lines)

---

### ❌ **VIOLATION 4: Incorrect Directory Structure**

**Severity**: 🟢 MEDIUM
**Rule Violated**: "Shared Components from `src/components/ui/`"

#### Current Structure (❌ WRONG)
```
web/src/
├── shared/
│   └── components/  ← Should be src/components/ui/
├── features/
└── app/
```

#### Target Structure (✅ CORRECT)
```
web/src/
├── components/
│   └── ui/          ← Shared primitives only
├── features/
│   └── [feature]/
│       ├── components/
│       ├── hooks/
│       └── types/
├── lib/
│   └── api/
├── stores/
└── app/
```

#### Migration Steps
1. ✅ Create `src/components/ui/` directory
2. ✅ Move all components from `src/shared/components/` → `src/components/ui/`
3. ✅ Update all imports across the codebase:
   ```tsx
   // Change from:
   import { Button } from '@/shared/components/button'

   // To:
   import { Button } from '@/components/ui/button'
   ```
4. ✅ Remove empty `src/shared/` directory

---

## 🔙 BACKEND VIOLATIONS (Go)

### ❌ **VIOLATION 5: Missing Hexagonal Architecture**

**Severity**: 🔴 CRITICAL
**Rule Violated**: "Go must use Hexagonal Architecture"

#### Current Structure (❌ WRONG)
```
api/internal/
├── handlers/        (Should be adapters/http)
├── services/        (Should be core/services)
├── entities/        (Should be core/domain)
├── repositories/    (Should be adapters/database)
├── dto/
├── utils/
├── database/
├── temporal/
└── connectors/
```

#### Target Structure (✅ CORRECT)
```
api/
├── cmd/
│   └── app/
│       └── main.go
├── internal/
│   ├── core/
│   │   ├── domain/          ← Pure Go entities (no SQL tags, no external libs)
│   │   │   ├── flow.go
│   │   │   ├── project.go
│   │   │   └── user.go
│   │   ├── ports/           ← Interfaces ONLY
│   │   │   ├── repositories.go
│   │   │   ├── services.go
│   │   │   └── external.go
│   │   └── services/        ← Business logic
│   │       ├── flow_service.go
│   │       └── auth_service.go
│   ├── adapters/
│   │   ├── http/            ← Handlers
│   │   │   ├── handler.go
│   │   │   └── router.go
│   │   ├── database/        ← Repositories
│   │   │   └── postgres/
│   │   └── external/        ← Connectors
│   │       ├── temporal/
│   │       └── oauth/
│   └── config/
├── pkg/
│   ├── apierrors/           ← Error codes (ERR_001, etc.)
│   └── logger/              ← Structured logging
└── test/
    └── (mirrors internal/)
```

#### Dependency Rules
```
✅ ALLOWED:
- core/domain    → (nothing - pure Go)
- core/ports     → core/domain
- core/services  → core/ports, core/domain
- adapters/*     → core/ports, core/domain
- cmd/app        → adapters/*, core/services

❌ FORBIDDEN:
- core/domain    → core/ports (NO!)
- core/services  → adapters/* (NO!)
- core/*         → cmd/* (NO!)
```

#### Migration Plan

**Phase 1: Create New Structure (Week 1)**
1. ✅ Create directory structure
2. ✅ Define all interfaces in `core/ports/`
3. ✅ Move & clean entities to `core/domain/` (remove SQL tags)

**Phase 2: Move Business Logic (Week 1-2)**
1. ✅ Move services to `core/services/`
2. ✅ Refactor to depend only on ports
3. ✅ Update imports

**Phase 3: Move Adapters (Week 2)**
1. ✅ Move handlers → `adapters/http/`
2. ✅ Move repositories → `adapters/database/`
3. ✅ Move connectors → `adapters/external/`

**Phase 4: Update Dependencies (Week 2)**
1. ✅ Wire everything in `cmd/app/main.go`
2. ✅ Run dependency analysis to verify rules
3. ✅ Update all tests

---

### ❌ **VIOLATION 6: Missing Context Propagation**

**Severity**: 🔴 CRITICAL
**Rule Violated**: "Every I/O function MUST accept `context.Context` as FIRST argument"

#### Problem
Some handlers pass `gin.Context` instead of extracting `context.Context`:

```go
// ❌ WRONG - api/internal/handlers/flow_handler.go:79
created, err := h.flows.CreateAccessible(c, user, flow)
//                                        ^ gin.Context, not context.Context
```

#### Solution
```go
// ✅ CORRECT
created, err := h.flows.CreateAccessible(c.Request.Context(), user, flow)
//                                        ^^^^^^^^^^^^^^^^^^^^
```

#### Files to Fix
- `flow_handler.go` - All methods (5 occurrences)
- `project_handler.go` - All methods
- `auth_handler.go` - All methods
- `credential_handler.go` - All methods
- `run_handler.go` - All methods
- `variable_handler.go` - All methods

#### Action Items
1. ✅ Update all handler methods to use `c.Request.Context()`
2. ✅ Ensure all service methods accept `context.Context` as first param
3. ✅ Add timeout/cancellation handling in long-running operations
4. ✅ Propagate context through entire call chain

---

### ❌ **VIOLATION 7: Usage of `interface{}` and Unstructured Logging**

**Severity**: 🟡 HIGH
**Rule Violated**: "BAN: `interface{}`, `log.Print`, `fmt.Println`"

#### Violations Found

**`interface{}` Usage (3 files):**

```go
// ❌ WRONG - api/internal/utils/json.go:5
func MustJSON(v interface{}) string {
    b, _ := json.Marshal(v)
    return string(b)
}
```

**Solution with Generics:**
```go
// ✅ CORRECT
func MustJSON[T any](v T) string {
    b, _ := json.Marshal(v)
    return string(b)
}
```

**Unstructured Logging:**

```go
// ❌ WRONG - api/cmd/migrate/main.go:14
log.Fatalf("failed to connect db: %v", err)
log.Println("migrations applied")
```

**Solution with slog:**
```go
// ✅ CORRECT
import "log/slog"

logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
logger.Error("failed to connect db", "error", err)
logger.Info("migrations applied")
```

#### Files to Refactor
1. `api/internal/utils/json.go` - Replace `interface{}` with generics
2. `api/internal/temporal/worker.go` - Replace `interface{}`
3. `api/internal/dto/flow_dto.go` - Replace `interface{}`
4. `api/cmd/migrate/main.go` - Use structured logging
5. `api/internal/temporal/scheduler.go` - Use structured logging

#### Action Items
1. ✅ Create `pkg/logger/logger.go` with slog wrapper
2. ✅ Add TraceID, UserID to all logs
3. ✅ Replace all `log.*` with structured logger
4. ✅ Replace all `interface{}` with generics or typed alternatives

---

### ❌ **VIOLATION 8: Insufficient Test Coverage**

**Severity**: 🟡 HIGH
**Rule Violated**: "100% coverage for core logic"

#### Current State
- Total test files: **2** (`*_test.go`)
- Test coverage: **<5%** (estimated)
- Missing tests for:
  - All services (0% coverage)
  - All repositories (0% coverage)
  - All handlers (0% coverage)

#### Target State
- Core services: **100%** coverage
- Adapters: **80%+** coverage
- Integration tests for all workflows

#### Test Structure (Table-Driven)
```go
// ✅ CORRECT - test/core/services/flow_service_test.go
func TestFlowService_Create(t *testing.T) {
    tests := []struct {
        name    string
        input   entities.Flow
        want    entities.Flow
        wantErr error
    }{
        {
            name: "creates flow with defaults",
            input: entities.Flow{Name: "Test"},
            want: entities.Flow{
                Name: "Test",
                Scope: "personal",
                Status: "draft",
                Version: 1,
            },
            wantErr: nil,
        },
        // ... more cases
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            // Test implementation
        })
    }
}
```

#### Action Items
1. ✅ Create `test/` directory mirroring `internal/`
2. ✅ Write tests for all `core/services/` (Priority 1)
3. ✅ Write tests for all `core/domain/` value objects
4. ✅ Write integration tests for critical workflows
5. ✅ Setup CI to enforce minimum coverage threshold (90%)

---

### ❌ **VIOLATION 9: Inconsistent Response Format**

**Severity**: 🟢 MEDIUM
**Rule Violated**: "Response Format: `{\"success\": true, \"data\": {...}, \"error\": null}`"

#### Current Format
```go
// Success response
{"data": {...}}

// Error response
{"error": {"code": "...", "message": "..."}}
```

#### Target Format
```go
// ✅ Success response
{
  "success": true,
  "data": {...},
  "error": null
}

// ✅ Error response
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERR_001",
    "message": "Flow not found"
  }
}
```

#### Action Items
1. ✅ Update `dto.ResponseEnvelope` to include `Success bool`
2. ✅ Update all handlers to use new format
3. ✅ Update frontend API clients to handle new format
4. ✅ Document error codes in `pkg/apierrors/`

---

## 🌍 GLOBAL VIOLATIONS

### ❌ **VIOLATION 10: Hardcoded Values**

**Severity**: 🟢 MEDIUM
**Rule Violated**: "Extract API keys, URLs, timeouts to config"

#### Examples
```tsx
// ❌ Frontend hardcoding
router.push(`/flows/${flow.id}/builder`);  // Route pattern
```

```go
// ❌ Backend hardcoding
time.Now().UTC().Format(time.RFC3339)  // Repeated formatting
```

#### Solution
```tsx
// ✅ Frontend config
const ROUTES = {
  flowBuilder: (id: string) => `/flows/${id}/builder`,
  flowDetail: (id: string) => `/flows/${id}`,
} as const;

router.push(ROUTES.flowBuilder(flow.id));
```

```go
// ✅ Backend helper
func FormatTimestamp(t time.Time) string {
    return t.UTC().Format(time.RFC3339)
}
```

#### Action Items
1. ✅ Create `web/src/lib/routes.ts` for route constants
2. ✅ Create `api/pkg/timeutil/format.go` for time helpers
3. ✅ Extract all magic strings/numbers to constants
4. ✅ Move timeouts/retries to config files

---

## 📈 Implementation Roadmap

### **Week 1: Critical Frontend Fixes**
- [ ] Day 1-2: Create missing shared components in `src/components/ui/`
- [ ] Day 3-5: Extract hooks from top 10 components
- [ ] Day 6-7: Refactor `canvas.tsx` to <150 lines

**Deliverable**: 30% reduction in frontend violations

---

### **Week 2: Backend Architecture Restructure**
- [ ] Day 1-2: Create hexagonal architecture skeleton
- [ ] Day 3-4: Move entities to `core/domain/` (pure Go)
- [ ] Day 5-6: Define all interfaces in `core/ports/`
- [ ] Day 7: Move services to `core/services/`

**Deliverable**: New architecture in place, old code still functional

---

### **Week 3: Complete Migration & Testing**
- [ ] Day 1-2: Move adapters (handlers, repositories)
- [ ] Day 3-4: Wire dependencies in `cmd/app/main.go`
- [ ] Day 5-6: Write tests for core services (50% coverage)
- [ ] Day 7: Integration testing & bug fixes

**Deliverable**: Architecture migration complete, 50% test coverage

---

### **Week 4: Remaining Violations & Polish**
- [ ] Day 1-2: Replace `interface{}` with generics
- [ ] Day 3-4: Implement structured logging (slog)
- [ ] Day 5-6: Fix remaining frontend components
- [ ] Day 7: Documentation & ROADMAP update

**Deliverable**: 90%+ compliance with all rules

---

## ✅ Success Criteria

### Frontend
- [ ] Zero direct HTML tags in feature components
- [ ] All hooks extracted to dedicated hook files
- [ ] All files ≤150 lines
- [ ] Correct directory structure (`src/components/ui/`)

### Backend
- [ ] Hexagonal architecture implemented
- [ ] Context propagation in all I/O functions
- [ ] Zero `interface{}` usage (except necessary stdlib)
- [ ] 90%+ test coverage for core logic
- [ ] Structured logging with TraceID/UserID

### Global
- [ ] No hardcoded secrets or URLs
- [ ] Consistent response format
- [ ] Updated `docs/ROADMAP.md`
- [ ] All changes reviewed and approved

---

## 🚨 Risk Mitigation

### Breaking Changes
- **Migration to new architecture**: Deploy with feature flags
- **Response format changes**: Version API endpoints (`/v1/`, `/v2/`)
- **Directory restructure**: Use git `mv` to preserve history

### Testing Strategy
- **Unit tests**: Before & after refactoring
- **Integration tests**: Critical user flows
- **Regression testing**: Full QA pass before production

### Rollback Plan
- Keep old code in separate branch until validation complete
- Use feature flags for gradual rollout
- Database migrations must be reversible

---

## 📝 Notes

- All changes must follow Step-by-Step implementation rule
- Every commit requires user review and approval
- Update ROADMAP.md after each major milestone
- Create new branch for each violation fix (e.g., `refactor/extract-hooks`)

---

**Next Steps**: Choose which violation to address first, and I will begin implementation following the review workflow.
