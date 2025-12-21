-- +goose Up
CREATE TABLE IF NOT EXISTS project_members (
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (project_id, user_id),
    CONSTRAINT project_members_role_ck CHECK (role IN ('admin', 'member'))
);

CREATE INDEX IF NOT EXISTS project_members_user_id_idx ON project_members(user_id);

-- +goose Down
DROP INDEX IF EXISTS project_members_user_id_idx;
DROP TABLE IF EXISTS project_members;

