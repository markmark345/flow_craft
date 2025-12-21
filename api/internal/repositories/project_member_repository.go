package repositories

import (
	"context"
	"database/sql"
	"strings"

	"flowcraft-api/internal/entities"
	"flowcraft-api/internal/utils"
)

type ProjectMemberRepository struct {
	db *sql.DB
}

func NewProjectMemberRepository(db *sql.DB) *ProjectMemberRepository {
	return &ProjectMemberRepository{db: db}
}

func (r *ProjectMemberRepository) Upsert(ctx context.Context, projectID string, userID string, role string) error {
	role = strings.TrimSpace(role)
	if role == "" {
		role = "member"
	}
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO project_members (project_id, user_id, role)
		VALUES ($1, $2, $3)
		ON CONFLICT (project_id, user_id) DO UPDATE SET role = EXCLUDED.role
	`, projectID, userID, role)
	return err
}

func (r *ProjectMemberRepository) Remove(ctx context.Context, projectID string, userID string) error {
	_, err := r.db.ExecContext(ctx, `
		DELETE FROM project_members WHERE project_id=$1 AND user_id=$2
	`, projectID, userID)
	return err
}

func (r *ProjectMemberRepository) GetRole(ctx context.Context, projectID string, userID string) (string, error) {
	var role string
	err := r.db.QueryRowContext(ctx, `
		SELECT role FROM project_members
		WHERE project_id=$1 AND user_id=$2
	`, projectID, userID).Scan(&role)
	if err == sql.ErrNoRows {
		return "", utils.ErrNotFound
	}
	if err != nil {
		return "", err
	}
	return role, nil
}

func (r *ProjectMemberRepository) ListMembers(ctx context.Context, projectID string) ([]entities.ProjectMember, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT pm.user_id, pm.role, pm.created_at, u.name, u.email
		FROM project_members pm
		JOIN users u ON u.id = pm.user_id
		WHERE pm.project_id = $1
		ORDER BY pm.created_at ASC
	`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []entities.ProjectMember
	for rows.Next() {
		var m entities.ProjectMember
		var name sql.NullString
		var email sql.NullString
		if err := rows.Scan(&m.UserID, &m.Role, &m.CreatedAt, &name, &email); err != nil {
			return nil, err
		}
		m.ProjectID = projectID
		if name.Valid || email.Valid {
			m.User = &entities.UserRef{ID: m.UserID, Name: name.String, Email: email.String}
		}
		out = append(out, m)
	}
	return out, rows.Err()
}

