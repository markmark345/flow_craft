-- +goose Up
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
    CONSTRAINT users_role_ck CHECK (role IN ('user', 'system_admin'));

-- +goose Down
ALTER TABLE users DROP COLUMN IF EXISTS role;
