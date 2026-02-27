-- +goose Up
ALTER TABLE variables ALTER COLUMN user_id DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS variables_global_key_unique
    ON variables (key)
    WHERE user_id IS NULL AND project_id IS NULL;

-- +goose Down
DROP INDEX IF EXISTS variables_global_key_unique;
ALTER TABLE variables ALTER COLUMN user_id SET NOT NULL;
