package repositories

import (
	"context"
	"database/sql"
	"time"

	"flowcraft-api/internal/entities"
	"flowcraft-api/internal/utils"
)

type PasswordResetRepository struct {
	db *sql.DB
}

func NewPasswordResetRepository(db *sql.DB) *PasswordResetRepository {
	return &PasswordResetRepository{db: db}
}

func (r *PasswordResetRepository) Create(ctx context.Context, reset entities.PasswordReset) error {
	_, err := r.db.ExecContext(ctx, `
        INSERT INTO password_resets (id, user_id, token_hash, expires_at, used_at)
        VALUES ($1, $2, $3, $4, $5)
    `, reset.ID, reset.UserID, reset.TokenHash, reset.ExpiresAt, reset.UsedAt)
	return err
}

func (r *PasswordResetRepository) GetByTokenHash(ctx context.Context, tokenHash string) (*entities.PasswordReset, error) {
	var res entities.PasswordReset
	var usedAt sql.NullTime
	err := r.db.QueryRowContext(ctx, `
        SELECT id, user_id, token_hash, expires_at, used_at, created_at
        FROM password_resets
        WHERE token_hash = $1
        ORDER BY created_at DESC
        LIMIT 1
    `, tokenHash).Scan(&res.ID, &res.UserID, &res.TokenHash, &res.ExpiresAt, &usedAt, &res.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, utils.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	if usedAt.Valid {
		t := usedAt.Time
		res.UsedAt = &t
	}
	return &res, nil
}

func (r *PasswordResetRepository) MarkUsed(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `
        UPDATE password_resets
        SET used_at = NOW()
        WHERE id = $1
    `, id)
	return err
}

func (r *PasswordResetRepository) DeleteExpired(ctx context.Context, before time.Time) error {
	_, err := r.db.ExecContext(ctx, `
        DELETE FROM password_resets WHERE expires_at < $1
    `, before)
	return err
}
