package postgres

import (
	"context"
	"database/sql"

	"flowcraft-api/internal/core/domain"
	"flowcraft-api/internal/utils"
)

type AuthSessionRepository struct {
	db *sql.DB
}

func NewAuthSessionRepository(db *sql.DB) *AuthSessionRepository {
	return &AuthSessionRepository{db: db}
}

func (r *AuthSessionRepository) Create(ctx context.Context, token string, userID string) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO auth_sessions (token, user_id)
		VALUES ($1, $2)
	`, token, userID)
	return err
}

func (r *AuthSessionRepository) Delete(ctx context.Context, token string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM auth_sessions WHERE token = $1`, token)
	return err
}

func (r *AuthSessionRepository) GetUserByToken(ctx context.Context, token string) (*domain.User, error) {
	var u domain.User
	var passwordHash sql.NullString
	err := r.db.QueryRowContext(ctx, `
		SELECT u.id, u.name, u.email, u.username, u.password_hash, u.created_at, u.updated_at
		FROM auth_sessions s
		JOIN users u ON u.id = s.user_id
		WHERE s.token = $1
	`, token).Scan(&u.ID, &u.Name, &u.Email, &u.Username, &passwordHash, &u.CreatedAt, &u.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, utils.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	if passwordHash.Valid {
		u.PasswordHash = passwordHash.String
	}
	return &u, nil
}
