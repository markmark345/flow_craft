---
trigger: manual
description: Use when adding a new real-time WebSocket channel (e.g., a new event type for live updates).
---

# Skill: Add WebSocket Channel

FlowCraft uses a **PostgreSQL NOTIFY → Go Hub → WebSocket → React** pipeline.

---

## Architecture

```
Postgres NOTIFY "channel_name"
    ↓
realtime.PostgresListener (postgres_listener.go)
    ↓ hub.Broadcast("channel_name", payload)
websocket.Hub (hub.go)
    ↓ JSON: { "channel": "...", "payload": {...} }
Browser WebSocket
    ↓ useWebSocket().subscribe("channel_name", handler)
React Component / Hook
```

---

## Two Patterns

### Pattern A: Database-Driven (Postgres NOTIFY)
Use when an event originates from a database change (e.g., run status update, step completion).

### Pattern B: API-Driven (via RealtimeService port)
Use when an event originates from an API action (e.g., flow triggered, user action).

---

## Pattern A: Database-Driven

### Step 1: Define the Domain Event

In `api/internal/core/domain/`, add the event type (create a new file or add to `run_event.go`):

```go
type <EventName>Event struct {
    <Field> string `json:"<field>"`
    // ...
}
```

### Step 2: Add LISTEN in PostgresListener

In `api/internal/adapters/realtime/postgres_listener.go`:

**2a.** Add the channel to the LISTEN call:
```go
_, err = conn.Exec(ctx, "LISTEN run_updates; LISTEN <new_channel>")
```

**2b.** Add handler in `handleNotification`:
```go
if n.Channel == "<new_channel>" {
    var event domain.<EventName>Event
    if err := json.Unmarshal([]byte(n.Payload), &event); err != nil {
        l.logger.Error().Err(err).Msg("failed to unmarshal <new_channel> payload")
        return
    }
    l.hub.Broadcast("<new_channel>", event)
}
```

### Step 3: Trigger NOTIFY from Postgres

In a migration or in the repository, add a trigger or manual NOTIFY:

```sql
-- In repository (Go):
_, err = db.Exec(ctx, `SELECT pg_notify($1, $2)`, "<new_channel>", jsonPayload)
```

---

## Pattern B: API-Driven

### Step 1: Define the Domain Event (same as Pattern A, Step 1)

### Step 2: Call via RealtimeService in Service Layer

In `api/internal/core/services/<service>.go`:
```go
// Inject ports.RealtimeService via constructor
func (s *RunService) SomeAction(ctx context.Context, ...) error {
    // ... business logic ...
    s.realtime.Broadcast("<channel_name>", domain.<EventName>Event{
        // fields...
    })
    return nil
}
```

The `RealtimeService` port is defined in `api/internal/core/ports/realtime.go`.

---

## Step 3 (Both Patterns): Frontend Subscription

### 3a. Define TypeScript payload type

In the relevant feature file or `web/src/types/dto.ts`:
```typescript
export type <EventName>Event = {
  <field>: string;
  // ... (no `any` types)
};
```

### 3b. Subscribe in the relevant hook

In `web/src/features/<feature>/hooks/use-<feature>.ts` (or a new hook):
```typescript
import { useWebSocket } from "@/hooks/use-websocket";
import type { <EventName>Event } from "@/types/dto";

export function useSomeFeature() {
  const { subscribe } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribe("<channel_name>", (payload: <EventName>Event) => {
      // handle real-time update
      // e.g., update state, invalidate query
    });
    return unsubscribe; // cleanup on unmount
  }, [subscribe]);
}
```

---

## Channel Naming Convention

| Pattern | Channel Name | Example |
|---------|-------------|---------|
| Single entity update | `<entity>_update` | `run_update` |
| Entity-specific stream | `<entity>.<id>` | `runs.abc-123` |
| Broad system event | `system` | `system` |
| Dashboard aggregates | `dashboard` | `dashboard` |

---

## Checklist

- [ ] Domain event struct defined in `api/internal/core/domain/`
- [ ] Go: LISTEN added (Pattern A) OR `Broadcast()` called via service (Pattern B)
- [ ] TypeScript payload type defined (no `any`)
- [ ] Frontend hook subscribes with correct channel name
- [ ] Hook returns `unsubscribe` and calls it on unmount
- [ ] Channel name follows naming convention
