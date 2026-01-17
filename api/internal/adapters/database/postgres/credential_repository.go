package postgres

import (
	"context"
	"database/sql"
	"time"

	"flowcraft-api/internal/core/domain"
	"flowcraft-api/internal/utils"
)

type CredentialRepository struct {
	db *sql.DB
}

func NewCredentialRepository(db *sql.DB) *CredentialRepository {
	return &CredentialRepository{db: db}
}

func (r *CredentialRepository) Create(ctx context.Context, cred domain.Credential) error {
	var projectID any
	if cred.ProjectID != "" {
		projectID = cred.ProjectID
	}
	_, err := r.db.ExecContext(ctx, `
        INSERT INTO credentials (id, user_id, project_id, provider, name, data_encrypted)
        VALUES ($1, $2, $3, $4, $5, $6)
    `, cred.ID, cred.UserID, projectID, cred.Provider, cred.Name, cred.DataEncrypted)
	return err
}

func (r *CredentialRepository) ListForUser(ctx context.Context, userID string) ([]domain.Credential, error) {
	rows, err := r.db.QueryContext(ctx, `
        SELECT id, user_id, project_id, provider, name, data_encrypted, created_at, updated_at
        FROM credentials
        WHERE user_id = $1 AND project_id IS NULL
        ORDER BY created_at DESC
    `, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanCredentials(rows)
}

func (r *CredentialRepository) ListForProject(ctx context.Context, projectID string) ([]domain.Credential, error) {
	rows, err := r.db.QueryContext(ctx, `
        SELECT id, user_id, project_id, provider, name, data_encrypted, created_at, updated_at
        FROM credentials
        WHERE project_id = $1
        ORDER BY created_at DESC
    `, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanCredentials(rows)
}

func (r *CredentialRepository) Get(ctx context.Context, id string) (*domain.Credential, error) {
	var cred domain.Credential
	var projectID sql.NullString
	var createdAt time.Time
	var updatedAt time.Time
	err := r.db.QueryRowContext(ctx, `
        SELECT id, user_id, project_id, provider, name, data_encrypted, created_at, updated_at
        FROM credentials
        WHERE id = $1
    `, id).Scan(&cred.ID, &cred.UserID, &projectID, &cred.Provider, &cred.Name, &cred.DataEncrypted, &createdAt, &updatedAt)
	if err == sql.ErrNoRows {
		return nil, utils.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	if projectID.Valid {
		cred.ProjectID = projectID.String
	}
	cred.CreatedAt = createdAt
	cred.UpdatedAt = updatedAt
	return &cred, nil
}

func (r *CredentialRepository) Update(ctx context.Context, cred domain.Credential) error {
	var projectID any
	if cred.ProjectID != "" {
		projectID = cred.ProjectID
	}
	res, err := r.db.ExecContext(ctx, `
        UPDATE credentials
        SET user_id = $2,
            project_id = $3,
            provider = $4,
            name = $5,
            data_encrypted = $6,
            updated_at = NOW()
        WHERE id = $1
    `, cred.ID, cred.UserID, projectID, cred.Provider, cred.Name, cred.DataEncrypted)
	if err != nil {
		return err
	}
	count, _ := res.RowsAffected()
	if count == 0 {
		return utils.ErrNotFound
	}
	return nil
}

func (r *CredentialRepository) Delete(ctx context.Context, id string) error {
	res, err := r.db.ExecContext(ctx, `
        DELETE FROM credentials WHERE id = $1
    `, id)
	if err != nil {
		return err
	}
	count, _ := res.RowsAffected()
	if count == 0 {
		return utils.ErrNotFound
	}
	return nil
}

func scanCredentials(rows *sql.Rows) ([]domain.Credential, error) {
	var items []domain.Credential
	for rows.Next() {
		var cred domain.Credential
		var projectID sql.NullString
		var createdAt time.Time
		var updatedAt time.Time
		if err := rows.Scan(
			&cred.ID,
			&cred.UserID,
			&projectID,
			&cred.Provider,
			&cred.Name,
			&cred.DataEncrypted,
			&createdAt,
			&updatedAt,
		); err != nil {
			return nil, err
		}
		if projectID.Valid {
			cred.ProjectID = projectID.String
		}
		cred.CreatedAt = createdAt
		cred.UpdatedAt = updatedAt
		items = append(items, cred)
	}
	return items, rows.Err()
}
