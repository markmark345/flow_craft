---
trigger: manual
description: Use when adding a new external service integration (e.g., Airtable, Stripe, Twilio) as a workflow node.
---

# Skill: Add App Integration

Follow this checklist **in order** when adding a new app integration to FlowCraft.

---

## Overview

Adding a new app requires changes in 5 areas:
1. External API client (Go)
2. Temporal activity (Go)
3. Dispatch router (Go)
4. Frontend node catalog (TypeScript)
5. Roadmap update (Markdown)

---

## Step 1: External API Client (Go)

Create `api/internal/adapters/external/<appname>/<appname>.go`

```go
package <appname>

import (
    "context"
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

const defaultTimeout = 10 * time.Second

func SomeAction(ctx context.Context, token string, param string) (map[string]any, error) {
    client := &http.Client{Timeout: defaultTimeout}

    // build request...
    req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.<appname>.com/...", body)
    if err != nil {
        return nil, fmt.Errorf("<appname>.SomeAction: %w", err)
    }
    req.Header.Set("Authorization", "Bearer "+token)
    req.Header.Set("Content-Type", "application/json")

    resp, err := client.Do(req)
    if err != nil {
        return nil, fmt.Errorf("<appname>.SomeAction: request failed: %w", err)
    }
    defer resp.Body.Close()

    if resp.StatusCode >= 400 {
        return nil, fmt.Errorf("<appname>.SomeAction: API error %d", resp.StatusCode)
    }

    var result map[string]any
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return nil, fmt.Errorf("<appname>.SomeAction: decode error: %w", err)
    }
    return result, nil
}
```

**Rules:**
- All functions accept `context.Context` as first argument.
- Always set a timeout on the HTTP client.
- Wrap errors with `fmt.Errorf("appname.FunctionName: %w", err)`.
- Never hardcode tokens — receive as parameter.

---

## Step 2: Temporal Activity (Go)

Create `api/internal/temporal/app_nodes_<appname>.go`

```go
package temporal

import (
    "context"
    "errors"
    "fmt"
    "strings"
    "time"

    "<module>/internal/adapters/external/<appname>"
)

func executeApp<AppName>(ctx context.Context, config map[string]any, deps stepDependencies, action string) (map[string]any, string, error) {
    credentialID := strings.TrimSpace(readString(config, "credentialId"))
    if credentialID == "" {
        return map[string]any{"status": 0}, "missing credential", errors.New("<appname>: credentialId is required")
    }

    cred, payload, err := loadCredentialPayload(ctx, deps, credentialID)
    if err != nil {
        return map[string]any{"status": 0}, "credential load failed", err
    }

    if !strings.EqualFold(cred.Provider, "<appname>") {
        return map[string]any{"status": 0}, "credential provider mismatch",
            fmt.Errorf("<appname>: expected <appname> credential, got %s", cred.Provider)
    }

    token := strings.TrimSpace(readAnyString(payload["access_token"]))
    if token == "" {
        return map[string]any{"status": 0}, "missing token", errors.New("<appname>: access token missing")
    }

    started := time.Now()
    var out map[string]any

    switch strings.ToLower(strings.TrimSpace(action)) {
    case "<appname>.someaction":
        param := strings.TrimSpace(readString(config, "param"))
        if param == "" {
            return map[string]any{"status": 0}, "missing fields", errors.New("<appname>.someAction: param is required")
        }
        out, err = <appname>.SomeAction(ctx, token, param)

    default:
        return map[string]any{"status": 0}, "unsupported action",
            fmt.Errorf("app(<appname>): unsupported action %q", action)
    }

    duration := time.Since(started)
    outputs := map[string]any{
        "status": 200,
        "data":   out,
        "meta": map[string]any{
            "duration_ms": duration.Milliseconds(),
        },
    }
    if err != nil {
        outputs["status"] = 0
        outputs["error"] = err.Error()
        return outputs, "<appname> action failed", err
    }

    return outputs, fmt.Sprintf("%s (%dms)", action, duration.Milliseconds()), nil
}
```

---

## Step 3: Register in Dispatch Router (Go)

Edit `api/internal/temporal/app_nodes_dispatch.go`

**3a. Add prefix detection** (in the `app == ""` block):
```go
case strings.HasPrefix(strings.ToLower(action), "<appname>."):
    app = "<appname>"
```

**3b. Add case in `switch strings.ToLower(app)`**:
```go
case "<appname>":
    if action == "" {
        action = "<appname>.someAction"
    }
    return executeApp<AppName>(ctx, config, deps, action)
```

---

## Step 4: Frontend Node Catalog (TypeScript)

**4a.** Create `web/src/features/builder/nodeCatalog/apps/<appname>.ts`

```typescript
import type { SchemaField } from "@/components/ui/SchemaForm/types";
import type { AppCatalogApp, AppCatalogCategory } from "../catalog";

const baseFields: SchemaField[] = [
  {
    key: "credentialId",
    label: "Credential",
    type: "credential",
    provider: "<appname>",
    required: true,
    helpText: "Connect a <AppName> account.",
  },
];

const someCategory: AppCatalogCategory = {
  key: "<category>",
  label: "<Category Label>",
  items: [
    {
      actionKey: "<appname>.someAction",
      label: "Some Action",
      description: "Description of what this does",
      kind: "action",
      supportsTest: false,
      fields: [
        {
          key: "param",
          label: "Parameter",
          type: "text",
          required: true,
          placeholder: "value",
        },
      ],
    },
  ],
};

export const <appname>App: AppCatalogApp = {
  appKey: "<appname>",
  label: "<AppName>",
  description: "Short description of the integration",
  icon: "<appname>",
  baseFields,
  categories: [someCategory],
};
```

**4b.** Register in `web/src/features/builder/nodeCatalog/catalog.ts`:
```typescript
import { <appname>App } from "./apps/<appname>";

// Add to the apps array:
<appname>App,
```

---

## Step 5: Update Roadmap

In `docs/ROADMAP.md`, mark the integration as completed under Phase 2 Integrations:
```markdown
- [x] <AppName> (<action description>)
```

---

## Checklist Summary

- [ ] `api/internal/adapters/external/<appname>/<appname>.go` — API client
- [ ] `api/internal/temporal/app_nodes_<appname>.go` — Activity executor
- [ ] `app_nodes_dispatch.go` — Prefix detection + switch case
- [ ] `web/src/features/builder/nodeCatalog/apps/<appname>.ts` — Catalog entry
- [ ] `catalog.ts` — App registered
- [ ] `docs/ROADMAP.md` — Marked complete
- [ ] Tests for the Go activity (table-driven)
- [ ] No `any` types in TypeScript catalog file
