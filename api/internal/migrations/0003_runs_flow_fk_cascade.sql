-- +goose Up
ALTER TABLE runs DROP CONSTRAINT IF EXISTS runs_flow_id_fkey;
ALTER TABLE runs
    ADD CONSTRAINT runs_flow_id_fkey
    FOREIGN KEY (flow_id) REFERENCES flows(id)
    ON DELETE CASCADE;

-- +goose Down
ALTER TABLE runs DROP CONSTRAINT IF EXISTS runs_flow_id_fkey;
ALTER TABLE runs
    ADD CONSTRAINT runs_flow_id_fkey
    FOREIGN KEY (flow_id) REFERENCES flows(id);

