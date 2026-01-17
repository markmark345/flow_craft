package postgres

import (
	"context"
	"database/sql"

	"flowcraft-api/internal/core/domain"
	"flowcraft-api/internal/utils"
)

type OAuthAccountRepository struct {
	db *sql.DB
}

func NewOAuthAccountRepository(db *sql.DB) *OAuthAccountRepository {
	return &OAuthAccountRepository{db: db}
}

func (r *OAuthAccountRepository) Upsert(ctx context.Context, account domain.OAuthAccount) error {
	_, err := r.db.ExecContext(ctx, `
        INSERT INTO oauth_accounts (id, user_id, provider, provider_user_id, access_token, refresh_token, token_expiry, scopes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (provider, provider_user_id) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          access_token = EXCLUDED.access_token,
          refresh_token = EXCLUDED.refresh_token,
          token_expiry = EXCLUDED.token_expiry,
          scopes = EXCLUDED.scopes,
          updated_at = NOW()
    `, account.ID, account.UserID, account.Provider, account.ProviderUserID, account.AccessToken, account.RefreshToken, account.TokenExpiry, account.Scopes)
	return err
}

func (r *OAuthAccountRepository) GetByProviderUserID(ctx context.Context, provider string, providerUserID string) (*domain.OAuthAccount, error) {
	var acc domain.OAuthAccount
	var expiry sql.NullTime
	err := r.db.QueryRowContext(ctx, `
        SELECT id, user_id, provider, provider_user_id, access_token, refresh_token, token_expiry, scopes, created_at, updated_at
        FROM oauth_accounts
        WHERE provider = $1 AND provider_user_id = $2
    `, provider, providerUserID).Scan(
		&acc.ID,
		&acc.UserID,
		&acc.Provider,
		&acc.ProviderUserID,
		&acc.AccessToken,
		&acc.RefreshToken,
		&expiry,
		&acc.Scopes,
		&acc.CreatedAt,
		&acc.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, utils.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	if expiry.Valid {
		t := expiry.Time
		acc.TokenExpiry = &t
	}
	return &acc, nil
}

func (r *OAuthAccountRepository) ListByUser(ctx context.Context, userID string) ([]domain.OAuthAccount, error) {
	rows, err := r.db.QueryContext(ctx, `
        SELECT id, user_id, provider, provider_user_id, access_token, refresh_token, token_expiry, scopes, created_at, updated_at
        FROM oauth_accounts
        WHERE user_id = $1
        ORDER BY created_at DESC
    `, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []domain.OAuthAccount
	for rows.Next() {
		var acc domain.OAuthAccount
		var expiry sql.NullTime
		if err := rows.Scan(
			&acc.ID,
			&acc.UserID,
			&acc.Provider,
			&acc.ProviderUserID,
			&acc.AccessToken,
			&acc.RefreshToken,
			&expiry,
			&acc.Scopes,
			&acc.CreatedAt,
			&acc.UpdatedAt,
		); err != nil {
			return nil, err
		}
		if expiry.Valid {
			t := expiry.Time
			acc.TokenExpiry = &t
		}
		items = append(items, acc)
	}
	return items, rows.Err()
}

func (r *OAuthAccountRepository) DeleteByUser(ctx context.Context, userID string, provider string) error {
	_, err := r.db.ExecContext(ctx, `
        DELETE FROM oauth_accounts WHERE user_id = $1 AND provider = $2
    `, userID, provider)
	return err
}
