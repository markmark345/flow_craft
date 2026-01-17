---
trigger: always_on
---

# AI DEVELOPMENT RULES
You are an expert Senior Engineer capable of working across the full stack (Go, Python, TypeScript/React).

---

# 🌍 GLOBAL RULES (All Stacks)
These rules apply to **BOTH** Frontend and Backend development.

### 1. **Git & Deployment Workflow**
- **Branching**: Create a new branch for every task (e.g., `feature/add-auth`, `fix/nav-bug`). NEVER work on `main`.
- **Commits**: Descriptive messages immediately after completing logical steps.
- **Process**: Branch -> Implement -> Test -> Commit -> Push -> Merge.

### 2. **Step-by-Step Implementation**
- Do not generate full code at once. Break complex tasks into small, verifiable steps.
- Ask for confirmation after each logical step.

### 3. **Configuration & Secrets**
- **No Hardcoding**: Extract API keys, URLs, and timeouts to `.env` or config files.
- **Privacy**: Do NOT log PII or sensitive financial data in production.

### 4. **Roadmap & Documentation**
- **Update Roadmap**: Must update `docs/ROADMAP.md` after completing features.
- **Single Source of Truth**: Keep documentation in sync with code changes.

### 5. **Strict Typing**
- ❌ **BAN**: Usage of `any` (or `interface{}` in Go) unless absolutely necessary.
- ✅ **USE**: Strict types, Interfaces, or Generics.

---

# 🔙 BACKEND AND AI RULES (Go / Python)
Primary Stack: **Go** (Hexagonal Architecture), **Python** (AI Engine).

### 1. **Architecture (Go)**
- **Dependency Rule**: `internal/core` CANNOT import `internal/adapters` or `cmd`.
- **Pure Domain**: `internal/core/domain` must be pure Go (No external libs, No SQL tags).
- **Ports & Adapters**: Define Interfaces in `internal/core/ports` BEFORE implementation.

### 2. **Testing**
- **Separation**: Mirror source structure in `test/` directory.
- **Style**: Use Table-Driven Tests for logic.
- **Coverage**: Maintain 100% coverage for core logic.

### 3. **API Standards**
- **Response Format**: Use consistent JSON structure: `{"success": true, "data": {...}, "error": null}`.
- **Error Codes**: Define codes in `pkg/apierrors` (e.g., `ERR_001`).
- **Resiliency**: All external calls must have timeouts and retry logic.

### 4. **File Structure (Go)**
- `cmd/app`: Entry point.
- `internal/core/domain`: Entities & Value Objects.
- `internal/core/ports`: Interfaces.
- `internal/core/services`: Business logic.
- `internal/adapters`: Implementations (DB, HTTP handlers).

### 5. **Context Propagation**
- **Rule**: Every function performing I/O (DB, API, HTTP) **MUST** accept `context.Context` as the FIRST argument.
- **Cancellation**: Respect context cancellation in long-running processes.

### 6. **Structured Logging**
- ❌ **BAN**: `fmt.Println` or `log.Print`.
- ✅ **USE**: Structured logging (slog/zap). Logs must include `TraceID`, `UserID`, and key-value pairs.

---

# 🎨 FRONTEND RULES (Next.js / React)
Primary Stack: **Next.js 14+** (App Router), **Tailwind CSS**, **Zustand**.

### 1. **Shared Components Only**
- ❌ **BAN**: Direct HTML tags (`<div>`, `<button>`) in feature components for UI elements.
- ✅ **USE**: Shared Components from `src/components/ui/` only.
- **Action**: If a component is missing, create/update it in `src/components/ui/` first.

### 2. **Hook Separation**
- ❌ **BAN**: Hooks (`useState`, `useEffect`) inside UI components.
- ✅ **USE**: Dedicated hooks in `hooks/useXxx.ts`.
- **Rule**: 1 File = 1 Hook. Keep components responsible ONLY for rendering.

### 3. **Clean Code Constraints**
- **File Size**: Max **150 lines**. Split component if larger.
- **Extraction**: If JSX/Logic is used 2+ times, extract to Shared Component or Custom Hook.
- **Pages**: `page.tsx` should only compose components, not contain logic.

### 4. **File Structure (Frontend)**
- `src/app/`: Pages & Routing.
- `src/components/ui/`: Shared Primitives (Button, Card, Input).
- `src/features/[feature]/`: Modular feature/domain logic (components, hooks, types).
- `src/lib/api/`: Typed API clients.
- `src/stores/`: Global state (Zustand).

### 5. **State Management Hierarchy**
- **Server State** (React Query) > **URL State** (Search Params) > **Global UI State** (Zustand) > **Local State** (`useState`).
- **Rule**: Only specific UI settings (Sidebar, Theme) belong in Zustand. Don't cache API data in Zustand manually.

### 6. **Folder Organization Rules** 📁
- **Group Related Files**: ไฟล์ที่เกี่ยวข้องกันให้อยู่ใน sub-folder เดียวกัน
- **UI Components Structure**:
  ```
  components/ui/
  ├── data-display/   # Card, Table, Text, Icon, Layout
  ├── forms/          # Button, Input, Select
  ├── feedback/       # Badge, Skeleton, Toast
  ├── overlay/        # Modal, Dropdown, Tooltip
  └── index.ts        # Barrel export for backward compatibility
  ```
- **Feature Structure**: Each feature folder should have:
  ```
  features/[feature]/
  ├── components/     # Feature-specific components
  ├── hooks/          # Feature-specific hooks
  └── index.ts        # Barrel export
  ```
- **Barrel Exports**: Use `index.ts` to re-export components for cleaner imports
- **Reference**: See `apps/frontend/FOLDER_STRUCTURE.md` for full guidelines

---

# 📁 FOLDER ORGANIZATION RULES (All Stacks)

> **หลักการสำคัญ**: ถ้ามีไฟล์ 3 ตัวขึ้นไปที่ทำหน้าที่คล้ายกัน ให้สร้าง sub-folder!

### 1. **Global Rules**
- **3+ Files Rule**: ถ้ามี 3 ไฟล์ขึ้นไปที่เกี่ยวข้องกัน → สร้าง sub-folder
- **Naming Convention**: Folder = พหูพจน์ (e.g., `loaders/`, `mocks/`, `services/`)
- **Index/Init Files**: สร้าง `index.ts`, `__init__.py` สำหรับ barrel exports

---

### 2. **Backend (Go) Organization**

```
internal/adapters/outbound/
├── mocks/                    # All mock implementations
│   ├── mock_ai_model.go
│   ├── mock_market_data.go
│   └── mock_sentiment.go
├── stubs/                    # Stub implementations
│   ├── stub_news.go
│   └── stub_notification.go
├── news/                     # News-related adapters
│   ├── aggregated_news.go
│   ├── rss_feeds.go
│   ├── finnhub.go
│   └── newsapi.go
├── trading/                  # Trading-related adapters
│   ├── paper_trading.go
│   └── coingecko.go
└── ai/                       # AI-related adapters
    ├── python_ai.go
    └── python_market.go
```

**Rule**: Group outbound adapters by domain (news, trading, ai, mocks)

---

### 3. **AI Engine (Python) Organization**

```
data/
├── loaders/                  # Data loading utilities
│   ├── loader.py
│   └── preprocessor.py
├── sources/                  # External data sources
│   ├── alpha_vantage.py
│   ├── fundamentals.py
│   ├── events.py
│   └── metadata.py
└── finders/                  # Data finding/searching
    └── peers.py

models/
├── forecasting/              # Price forecasting models
│   ├── mamba_ts.py
│   └── base.py
├── sentiment/                # Sentiment models
│   └── finbert.py
└── market/                   # Market analysis models
    └── regime_detector.py

inference/
├── analysis/                 # Analysis components
│   ├── predictor.py
│   └── advanced_analysis.py
└── explanation/              # Explanation/interpretation
    └── explainer.py
```

**Rule**: Group by function (loaders, sources, finders)

---

### 4. **Frontend (Next.js) Organization**

```
components/ui/
├── data-display/             # Card, Table, Text, Icon
├── forms/                    # Button, Input, Select  
├── feedback/                 # Badge, Skeleton, Toast
├── overlay/                  # Modal, Dropdown, Tooltip
└── index.ts                  # Barrel export

features/[feature]/
├── components/               # Feature-specific components
├── hooks/                    # Feature-specific hooks
├── types/                    # Feature-specific types (optional)
└── index.ts                  # Barrel export

lib/
├── api/                      # API clients
│   ├── clients/              # Base HTTP clients (axios, fetch config)
│   └── services/             # Domain-specific APIs (ai.ts, portfolio.ts)
├── utils/                    # Utility functions
└── constants/                # Constants and config
```

**Rule**: ใช้ barrel `index.ts` export เสมอ

---

### 5. **When to Create Sub-Folders**

| Condition | Action |
|-----------|--------|
| 3+ files ที่ทำหน้าที่คล้ายกัน | ✅ สร้าง sub-folder |
| Files share common prefix (mock_, stub_) | ✅ สร้าง sub-folder |
| Files are domain-related (news, trading) | ✅ Group by domain |
| Only 1-2 files | ❌ ไม่ต้องสร้าง folder |

---

### 6. **Example: Before vs After**

**Before** (flat structure ❌):
```
outbound/
├── mock_ai_model.go
├── mock_market_data.go
├── mock_sentiment.go
├── finnhub.go
├── newsapi.go
└── paper_trading.go
```

**After** (organized ✅):
```
outbound/
├── mocks/
│   ├── ai_model.go
│   └── market_data.go
├── news/
│   ├── finnhub.go
│   └── newsapi.go
└── trading/
    └── paper_trading.go
```