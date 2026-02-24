---
trigger: manual
description: Use when adding a new database migration (new table, alter column, new index, etc.)
---

# Skill: Add Database Migration

Follow this process every time you need to change the database schema.

---

## Step 1: Determine the Next Migration Number

```bash
ls api/internal/migrations/ | sort | tail -3
```

Take the last number and increment by 1. Zero-pad to 4 digits.
Example: last is `0016_...` → next is `0017_`.

---

## Step 2: Create the Migration File

**File path:**
```
api/internal/migrations/<NNNN>_<description>.sql
```

**Naming rules:**
- `NNNN` = zero-padded number (e.g., `0017`)
- `description` = snake_case, concise (e.g., `add_run_retries`, `create_webhooks`)

**File template:**
```sql
-- +goose Up
-- Your forward migration here
-- Use IF NOT EXISTS / IF EXISTS for idempotency

-- +goose Down
-- Your rollback migration here
-- Must fully reverse the Up migration
```

---

## Common Patterns

### Create a new table
```sql
-- +goose Up
CREATE TABLE IF NOT EXISTS <table_name> (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- +goose Down
DROP TABLE IF EXISTS <table_name>;
```

### Add a column
```sql
-- +goose Up
ALTER TABLE <table_name> ADD COLUMN IF NOT EXISTS <col> <type> [NOT NULL DEFAULT ...];

-- +goose Down
ALTER TABLE <table_name> DROP COLUMN IF EXISTS <col>;
```

### Add an index
```sql
-- +goose Up
CREATE INDEX IF NOT EXISTS <table>_<col>_idx ON <table> (<col>);

-- +goose Down
DROP INDEX IF EXISTS <table>_<col>_idx;
```

### Alter column nullability
```sql
-- +goose Up
ALTER TABLE <table_name> ALTER COLUMN <col> DROP NOT NULL;

-- +goose Down
ALTER TABLE <table_name> ALTER COLUMN <col> SET NOT NULL;
```

---

## Step 3: Run the Migration

```bash
go -C api run ./cmd/migrate
```

Or with Docker Compose:
```bash
docker compose -f api/docker-compose.yml run --rm migrate
```

---

## Step 4: Update Go Domain/Repository (if needed)

If you added a column or table, update:
1. **Domain struct** in `api/internal/core/domain/<entity>.go`
2. **Repository interface** in `api/internal/core/ports/repositories.go`
3. **Repository implementation** in `api/internal/adapters/database/postgres/<entity>_repository.go`
4. **DTO** in `web/src/types/dto.ts` (frontend type)

---

## Checklist

- [ ] Migration file created with correct `NNNN_description.sql` format
- [ ] Both `-- +goose Up` and `-- +goose Down` sections present
- [ ] Uses `IF NOT EXISTS` / `IF EXISTS` for idempotency
- [ ] Migration runs without error locally
- [ ] Domain struct updated (if columns added/removed)
- [ ] Repository interface & implementation updated
- [ ] Frontend `dto.ts` types updated (if shape changed)
- [ ] No raw SQL string concatenation in repositories (use parameterized queries)
