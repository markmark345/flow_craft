-- +goose Up
ALTER TABLE flows
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE flows
    ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS flows_created_by_idx ON flows(created_by);

-- +goose Down
DROP INDEX IF EXISTS flows_created_by_idx;
ALTER TABLE flows DROP COLUMN IF EXISTS updated_by;
ALTER TABLE flows DROP COLUMN IF EXISTS created_by;

