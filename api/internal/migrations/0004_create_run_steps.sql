-- +goose Up
CREATE TABLE IF NOT EXISTS run_steps (
    id UUID PRIMARY KEY,
    run_id UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
    step_key TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    node_id TEXT,
    node_type TEXT,
    inputs_json JSONB,
    outputs_json JSONB,
    log TEXT,
    error TEXT,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS run_steps_run_id_idx ON run_steps(run_id);
CREATE UNIQUE INDEX IF NOT EXISTS run_steps_run_id_step_key_idx ON run_steps(run_id, step_key);

-- +goose Down
DROP TABLE IF EXISTS run_steps;
