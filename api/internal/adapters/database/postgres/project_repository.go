package postgres

import (
	"context"
	"database/sql"
	"strings"

	"flowcraft-api/internal/core/domain"
	"flowcraft-api/internal/utils"
)

type ProjectRepository struct {
	db *sql.DB
}

func NewProjectRepository(db *sql.DB) *ProjectRepository {
	return &ProjectRepository{db: db}
}

func (r *ProjectRepository) Create(ctx context.Context, project domain.Project) error {
	var createdBy any
	if strings.TrimSpace(project.CreatedBy) != "" {
		createdBy = project.CreatedBy
	}

	_, err := r.db.ExecContext(ctx, `
		INSERT INTO projects (id, name, description, created_by)
		VALUES ($1, $2, $3, $4)
	`, project.ID, project.Name, project.Description, createdBy)
	return err
}

func (r *ProjectRepository) ListByUser(ctx context.Context, userID string) ([]domain.Project, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT p.id, p.name, p.description, p.created_by, p.created_at, p.updated_at, pm.role
		FROM projects p
		JOIN project_members pm ON pm.project_id = p.id
		WHERE pm.user_id = $1
		ORDER BY p.name ASC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []domain.Project
	for rows.Next() {
		var p domain.Project
		var createdBy sql.NullString
		if err := rows.Scan(&p.ID, &p.Name, &p.Description, &createdBy, &p.CreatedAt, &p.UpdatedAt, &p.Role); err != nil {
			return nil, err
		}
		if createdBy.Valid {
			p.CreatedBy = createdBy.String
		}
		out = append(out, p)
	}
	return out, rows.Err()
}

func (r *ProjectRepository) GetForUser(ctx context.Context, projectID string, userID string) (*domain.Project, error) {
	var p domain.Project
	var createdBy sql.NullString
	err := r.db.QueryRowContext(ctx, `
		SELECT p.id, p.name, p.description, p.created_by, p.created_at, p.updated_at, pm.role
		FROM projects p
		JOIN project_members pm ON pm.project_id = p.id
		WHERE p.id = $1 AND pm.user_id = $2
	`, projectID, userID).Scan(&p.ID, &p.Name, &p.Description, &createdBy, &p.CreatedAt, &p.UpdatedAt, &p.Role)
	if err == sql.ErrNoRows {
		return nil, utils.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	if createdBy.Valid {
		p.CreatedBy = createdBy.String
	}
	return &p, nil
}

func (r *ProjectRepository) Update(ctx context.Context, project domain.Project) error {
	res, err := r.db.ExecContext(ctx, `
		UPDATE projects
		SET name=$2, description=$3, updated_at=NOW()
		WHERE id=$1
	`, project.ID, project.Name, project.Description)
	if err != nil {
		return err
	}
	aff, _ := res.RowsAffected()
	if aff == 0 {
		return utils.ErrNotFound
	}
	return nil
}

func (r *ProjectRepository) Delete(ctx context.Context, projectID string) error {
	res, err := r.db.ExecContext(ctx, `DELETE FROM projects WHERE id=$1`, projectID)
	if err != nil {
		return err
	}
	aff, _ := res.RowsAffected()
	if aff == 0 {
		return utils.ErrNotFound
	}
	return nil
}

