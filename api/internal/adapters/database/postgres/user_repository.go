package postgres

import (
	"context"
	"database/sql"
	"strings"

	"flowcraft-api/internal/core/domain"
	"flowcraft-api/internal/utils"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(ctx context.Context, user domain.User) error {
	var passwordHash any
	if strings.TrimSpace(user.PasswordHash) != "" {
		passwordHash = user.PasswordHash
	}
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO users (id, name, email, username, password_hash)
		VALUES ($1, $2, $3, $4, $5)
	`, user.ID, user.Name, strings.ToLower(user.Email), strings.ToLower(user.Username), passwordHash)
	return err
}

func (r *UserRepository) GetByEmailOrUsername(ctx context.Context, identifier string) (*domain.User, error) {
	ident := strings.ToLower(strings.TrimSpace(identifier))
	var u domain.User
	var passwordHash sql.NullString
	err := r.db.QueryRowContext(ctx, `
		SELECT id, name, email, username, password_hash, role, created_at, updated_at
		FROM users
		WHERE email = $1 OR username = $1
	`, ident).Scan(&u.ID, &u.Name, &u.Email, &u.Username, &passwordHash, &u.Role, &u.CreatedAt, &u.UpdatedAt)
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

func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	ident := strings.ToLower(strings.TrimSpace(email))
	var u domain.User
	var passwordHash sql.NullString
	err := r.db.QueryRowContext(ctx, `
		SELECT id, name, email, username, password_hash, role, created_at, updated_at
		FROM users
		WHERE email = $1
	`, ident).Scan(&u.ID, &u.Name, &u.Email, &u.Username, &passwordHash, &u.Role, &u.CreatedAt, &u.UpdatedAt)
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

func (r *UserRepository) Get(ctx context.Context, id string) (*domain.User, error) {
	var u domain.User
	var passwordHash sql.NullString
	err := r.db.QueryRowContext(ctx, `
		SELECT id, name, email, username, password_hash, role, created_at, updated_at
		FROM users
		WHERE id = $1
	`, id).Scan(&u.ID, &u.Name, &u.Email, &u.Username, &passwordHash, &u.Role, &u.CreatedAt, &u.UpdatedAt)
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

func (r *UserRepository) UpdatePassword(ctx context.Context, userID string, passwordHash string) error {
	res, err := r.db.ExecContext(ctx, `
		UPDATE users
		SET password_hash = $2,
		    updated_at = NOW()
		WHERE id = $1
	`, userID, passwordHash)
	if err != nil {
		return err
	}
	count, _ := res.RowsAffected()
	if count == 0 {
		return utils.ErrNotFound
	}
	return nil
}
