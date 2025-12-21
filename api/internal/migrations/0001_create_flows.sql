-- +goose Up
CREATE TABLE IF NOT EXISTS flows (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    version INT NOT NULL,
    definition_json JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- +goose Down
DROP TABLE IF EXISTS flows;
