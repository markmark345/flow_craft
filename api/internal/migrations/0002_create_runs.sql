-- +goose Up
CREATE TABLE IF NOT EXISTS runs (
    id UUID PRIMARY KEY,
    flow_id UUID NOT NULL REFERENCES flows(id),
    status TEXT NOT NULL,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    log TEXT,
    temporal_workflow_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- +goose Down
DROP TABLE IF EXISTS runs;
