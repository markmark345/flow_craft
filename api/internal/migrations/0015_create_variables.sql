-- +goose Up
CREATE TABLE IF NOT EXISTS variables (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS variables_user_key_unique
    ON variables (user_id, key)
    WHERE project_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS variables_project_key_unique
    ON variables (project_id, key)
    WHERE project_id IS NOT NULL;

-- +goose Down
DROP TABLE IF EXISTS variables;
