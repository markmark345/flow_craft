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
- [ ] **Dashboard Enhancements**: Add more detailed run statistics and analytics to the main dashboard.
- [ ] **Global Variable Scoping**: Expand variable management to support more granular scoping and encryption.
- [ ] **Integrations**:
    - [ ] Slack Real-time Triggers
    - [ ] Notion Integration (Database/Page nodes)
- [ ] **E2E Testing**: Implement Playwright/Cypress tests for critical user flows.
- [ ] **Real-time Architecture (WebSockets)**: Implement WebSocket server (Go) and client (React) for real-time logs and dashboard stats.

---

## 📅 Planned (Future)

### Core Features
- [ ] **Advanced Error Handling in Workflows**: Add retry policies and error-branching logic to the builder.
- [ ] **Custom HTTP Request Node**: Robust HTTP node with support for various auth methods and payload types.

### Infrastructure
- [ ] **Performance Monitoring**: Integrate logging and monitoring for Temporal workers and API server.
- [ ] **Docker Deployment Optimization**: Streamline production Docker builds and multi-stage deployments.
