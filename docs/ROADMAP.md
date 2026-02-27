# Project Roadmap

This document outlines the planned work, in-progress tasks, and completed milestones for FlowCraft.

## 🚀 Recently Completed

### Frontend Cleanup & Standardization (Jan 2026)
- **Standardized UI Components**: Replaced raw HTML tags (`<button>`, `<input>`, `<textarea>`, `<select>`) with shared UI components across all features.
- **Component Modularity**: Refactored complex components like `FlowNode` and `NodeIcon` by splitting them into smaller, modular sub-components.
- **Improved Type Safety**: Enhanced `Input` component with `forwardRef` and ensured strict typing across refactored files.
- **Cleanup**: Removed legacy temporary files and fixed minor visual bugs (e.g., broken characters in modals).

### Monorepo Restructure
- Finalized restructuring to a monorepo layout with clear separation of `api/`, `web/`, and `docs/`.
- Updated CI/CD and local development workflows for the new structure.

---

## 🛠️ In Progress

### ✅ Phase 1: Foundation & Refactoring (Completed)
- [x] Establish Project Roadmap (`docs/ROADMAP.md`)
- [x] Refactor FlowNode and NodeIcon for strict compliance
- [x] Refactor `settings-page.tsx`
- [x] Refactor `run-detail-page.tsx`
- [x] Refactor `docs-app.tsx`
- [x] Systematic elimination of `any` types
- [x] Refactor Builder Store & Components
- [x] Architecture Audit (Backend)

### 🚧 Phase 2: Features & Integrations (Current Focus)
- [x] **Dashboard Enhancements**: Added Run Activity Chart showing 7-day history.
- [x] **Global Variable Scoping**: Expand variable management to support more granular scoping (global, project, user).
- [x] **Integrations**:
    - [x] Slack (Send Message node)
    - [x] Notion (Create Page node)
- [x] **E2E Testing**: Implemented Playwright tests for auth and dashboard flows (4/4 passing).
- [x] **Real-time Architecture (WebSockets)**: Implement WebSocket server (Go) and client (React) for real-time logs and dashboard stats.

---

## 📅 Planned (Future)

### Phase 3: Core Features (Started)
- [x] **Custom HTTP Request Node**: Added support for Auth (API Key, Bearer, Basic), Custom Headers, Content-Type, and Timeout.
- [x] **Advanced Error Handling in Workflows**: Implemented Node-level Retry Policies (Max Attempts, Linear Backoff) and Visual Error Branching.
- [x] **Performance Monitoring**: Integrated Prometheus metrics for API server and Temporal Workers.
- [ ] **Docker Deployment Optimization**: Streamline production Docker builds and multi-stage deployments.
