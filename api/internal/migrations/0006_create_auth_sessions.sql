-- +goose Up
CREATE TABLE IF NOT EXISTS auth_sessions (
    token UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS auth_sessions_user_id_idx ON auth_sessions(user_id);

-- +goose Down
DROP TABLE IF EXISTS auth_sessions;

