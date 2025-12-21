package repositories

import (
	"context"
	"database/sql"
	"strings"

	"flowcraft-api/internal/entities"
	"flowcraft-api/internal/utils"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, user entities.User) error {
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO users (id, name, email, username, password_hash)
		VALUES ($1, $2, $3, $4, $5)
	`, user.ID, user.Name, strings.ToLower(user.Email), strings.ToLower(user.Username), user.PasswordHash)
	return err
}

func (r *UserRepository) GetByEmailOrUsername(ctx context.Context, identifier string) (*entities.User, error) {
	ident := strings.ToLower(strings.TrimSpace(identifier))
	var u entities.User
	err := r.db.QueryRowContext(ctx, `
		SELECT id, name, email, username, password_hash, created_at, updated_at
		FROM users
		WHERE email = $1 OR username = $1
	`, ident).Scan(&u.ID, &u.Name, &u.Email, &u.Username, &u.PasswordHash, &u.CreatedAt, &u.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, utils.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}
