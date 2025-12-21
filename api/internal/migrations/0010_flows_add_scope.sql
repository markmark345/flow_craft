-- +goose Up
ALTER TABLE flows
    ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';

ALTER TABLE flows
    ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT 'personal';

ALTER TABLE flows
    ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE flows
    ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

UPDATE flows
SET owner_user_id = created_by
WHERE owner_user_id IS NULL AND created_by IS NOT NULL;

ALTER TABLE flows
    DROP CONSTRAINT IF EXISTS flows_scope_ck;
ALTER TABLE flows
    ADD CONSTRAINT flows_scope_ck CHECK (scope IN ('personal', 'project'));

ALTER TABLE flows
    DROP CONSTRAINT IF EXISTS flows_scope_rules_ck;
ALTER TABLE flows
    ADD CONSTRAINT flows_scope_rules_ck CHECK (
        (scope = 'personal' AND project_id IS NULL) OR
        (scope = 'project' AND project_id IS NOT NULL)
    );

CREATE INDEX IF NOT EXISTS flows_scope_idx ON flows(scope);
CREATE INDEX IF NOT EXISTS flows_owner_user_id_idx ON flows(owner_user_id);
CREATE INDEX IF NOT EXISTS flows_project_id_idx ON flows(project_id);

-- +goose Down
DROP INDEX IF EXISTS flows_project_id_idx;
DROP INDEX IF EXISTS flows_owner_user_id_idx;
DROP INDEX IF EXISTS flows_scope_idx;
ALTER TABLE flows DROP CONSTRAINT IF EXISTS flows_scope_rules_ck;
ALTER TABLE flows DROP CONSTRAINT IF EXISTS flows_scope_ck;
ALTER TABLE flows DROP COLUMN IF EXISTS project_id;
ALTER TABLE flows DROP COLUMN IF EXISTS owner_user_id;
ALTER TABLE flows DROP COLUMN IF EXISTS scope;
ALTER TABLE flows DROP COLUMN IF EXISTS description;

