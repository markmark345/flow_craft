package repositories

import (
	"context"
	"database/sql"
	"time"

	"flowcraft-api/internal/entities"
	"flowcraft-api/internal/utils"
)

type VariableRepository struct {
	db *sql.DB
}

func NewVariableRepository(db *sql.DB) *VariableRepository {
	return &VariableRepository{db: db}
}

func (r *VariableRepository) Create(ctx context.Context, variable entities.Variable) error {
	var projectID any
	if variable.ProjectID != "" {
		projectID = variable.ProjectID
	}
	_, err := r.db.ExecContext(ctx, `
        INSERT INTO variables (id, user_id, project_id, key, value)
        VALUES ($1, $2, $3, $4, $5)
    `, variable.ID, variable.UserID, projectID, variable.Key, variable.Value)
	return err
}

func (r *VariableRepository) ListForUser(ctx context.Context, userID string) ([]entities.Variable, error) {
	rows, err := r.db.QueryContext(ctx, `
        SELECT id, user_id, project_id, key, value, created_at, updated_at
        FROM variables
        WHERE user_id = $1 AND project_id IS NULL
        ORDER BY updated_at DESC
    `, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanVariables(rows)
}

func (r *VariableRepository) ListForProject(ctx context.Context, projectID string) ([]entities.Variable, error) {
	rows, err := r.db.QueryContext(ctx, `
        SELECT id, user_id, project_id, key, value, created_at, updated_at
        FROM variables
        WHERE project_id = $1
        ORDER BY updated_at DESC
    `, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanVariables(rows)
}

func (r *VariableRepository) Get(ctx context.Context, id string) (*entities.Variable, error) {
	var variable entities.Variable
	var projectID sql.NullString
	var createdAt time.Time
	var updatedAt time.Time
	err := r.db.QueryRowContext(ctx, `
        SELECT id, user_id, project_id, key, value, created_at, updated_at
        FROM variables
        WHERE id = $1
    `, id).Scan(&variable.ID, &variable.UserID, &projectID, &variable.Key, &variable.Value, &createdAt, &updatedAt)
	if err == sql.ErrNoRows {
		return nil, utils.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	if projectID.Valid {
		variable.ProjectID = projectID.String
	}
	variable.CreatedAt = createdAt
	variable.UpdatedAt = updatedAt
	return &variable, nil
}

func (r *VariableRepository) Update(ctx context.Context, variable entities.Variable) error {
	var projectID any
	if variable.ProjectID != "" {
		projectID = variable.ProjectID
	}
	res, err := r.db.ExecContext(ctx, `
        UPDATE variables
        SET user_id = $2,
            project_id = $3,
            key = $4,
            value = $5,
            updated_at = NOW()
        WHERE id = $1
    `, variable.ID, variable.UserID, projectID, variable.Key, variable.Value)
	if err != nil {
		return err
	}
	count, _ := res.RowsAffected()
	if count == 0 {
		return utils.ErrNotFound
	}
	return nil
}

func (r *VariableRepository) Delete(ctx context.Context, id string) error {
	res, err := r.db.ExecContext(ctx, `
        DELETE FROM variables WHERE id = $1
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

func scanVariables(rows *sql.Rows) ([]entities.Variable, error) {
	var items []entities.Variable
	for rows.Next() {
		var variable entities.Variable
		var projectID sql.NullString
		var createdAt time.Time
		var updatedAt time.Time
		if err := rows.Scan(
			&variable.ID,
			&variable.UserID,
			&projectID,
			&variable.Key,
			&variable.Value,
			&createdAt,
			&updatedAt,
		); err != nil {
			return nil, err
		}
		if projectID.Valid {
			variable.ProjectID = projectID.String
		}
		variable.CreatedAt = createdAt
		variable.UpdatedAt = updatedAt
		items = append(items, variable)
	}
	return items, rows.Err()
}
