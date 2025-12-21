package repositories

import (
	"context"
	"database/sql"
	"strings"

	"flowcraft-api/internal/entities"
	"flowcraft-api/internal/utils"
)

type FlowRepository struct {
	db *sql.DB
}

func NewFlowRepository(db *sql.DB) *FlowRepository {
	return &FlowRepository{db: db}
}

func (r *FlowRepository) Create(ctx context.Context, flow entities.Flow) error {
	var createdBy any
	if strings.TrimSpace(flow.CreatedBy) != "" {
		createdBy = flow.CreatedBy
	}
	var updatedBy any
	if strings.TrimSpace(flow.UpdatedBy) != "" {
		updatedBy = flow.UpdatedBy
	}
	var ownerUserID any
	if strings.TrimSpace(flow.OwnerUserID) != "" {
		ownerUserID = flow.OwnerUserID
	}
	var projectID any
	if strings.TrimSpace(flow.ProjectID) != "" {
		projectID = flow.ProjectID
	}

	_, err := r.db.ExecContext(ctx, `
        INSERT INTO flows (id, name, description, scope, project_id, owner_user_id, status, version, definition_json, created_by, updated_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11)
    `, flow.ID, flow.Name, flow.Description, flow.Scope, projectID, ownerUserID, flow.Status, flow.Version, flow.DefinitionJSON, createdBy, updatedBy)
	return err
}

func (r *FlowRepository) List(ctx context.Context) ([]entities.Flow, error) {
	rows, err := r.db.QueryContext(ctx, `
        SELECT f.id, f.name, f.description, f.scope, f.owner_user_id, f.project_id,
               f.status, f.version, f.definition_json, f.updated_at, f.created_by, f.updated_by,
               u.id, u.name, u.email,
               p.id, p.name
        FROM flows f
        LEFT JOIN users u ON u.id = f.created_by
        LEFT JOIN projects p ON p.id = f.project_id
        ORDER BY f.updated_at DESC
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var flows []entities.Flow
	for rows.Next() {
		var f entities.Flow
		var createdBy sql.NullString
		var updatedBy sql.NullString
		var ownerUserID sql.NullString
		var projectID sql.NullString
		var ownerID sql.NullString
		var ownerName sql.NullString
		var ownerEmail sql.NullString
		var projID sql.NullString
		var projName sql.NullString
		if err := rows.Scan(
			&f.ID,
			&f.Name,
			&f.Description,
			&f.Scope,
			&ownerUserID,
			&projectID,
			&f.Status,
			&f.Version,
			&f.DefinitionJSON,
			&f.UpdatedAt,
			&createdBy,
			&updatedBy,
			&ownerID,
			&ownerName,
			&ownerEmail,
			&projID,
			&projName,
		); err != nil {
			return nil, err
		}
		if createdBy.Valid {
			f.CreatedBy = createdBy.String
		}
		if updatedBy.Valid {
			f.UpdatedBy = updatedBy.String
		}
		if ownerUserID.Valid {
			f.OwnerUserID = ownerUserID.String
		}
		if projectID.Valid {
			f.ProjectID = projectID.String
		}
		if ownerID.Valid {
			f.Owner = &entities.UserRef{
				ID:    ownerID.String,
				Name:  ownerName.String,
				Email: ownerEmail.String,
			}
		}
		if projID.Valid {
			f.Project = &entities.ProjectRef{ID: projID.String, Name: projName.String}
		}
		flows = append(flows, f)
	}
	return flows, rows.Err()
}

func (r *FlowRepository) ListByOwner(ctx context.Context, userID string) ([]entities.Flow, error) {
	rows, err := r.db.QueryContext(ctx, `
        SELECT f.id, f.name, f.description, f.scope, f.owner_user_id, f.project_id,
               f.status, f.version, f.definition_json, f.updated_at, f.created_by, f.updated_by,
               u.id, u.name, u.email,
               p.id, p.name
        FROM flows f
        LEFT JOIN users u ON u.id = f.created_by
        LEFT JOIN projects p ON p.id = f.project_id
        WHERE f.scope = 'personal' AND (f.owner_user_id = $1 OR (f.owner_user_id IS NULL AND f.created_by = $1))
        ORDER BY f.updated_at DESC
    `, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var flows []entities.Flow
	for rows.Next() {
		var f entities.Flow
		var createdBy sql.NullString
		var updatedBy sql.NullString
		var ownerUserID sql.NullString
		var projectID sql.NullString
		var ownerID sql.NullString
		var ownerName sql.NullString
		var ownerEmail sql.NullString
		var projID sql.NullString
		var projName sql.NullString
		if err := rows.Scan(
			&f.ID,
			&f.Name,
			&f.Description,
			&f.Scope,
			&ownerUserID,
			&projectID,
			&f.Status,
			&f.Version,
			&f.DefinitionJSON,
			&f.UpdatedAt,
			&createdBy,
			&updatedBy,
			&ownerID,
			&ownerName,
			&ownerEmail,
			&projID,
			&projName,
		); err != nil {
			return nil, err
		}
		if createdBy.Valid {
			f.CreatedBy = createdBy.String
		}
		if updatedBy.Valid {
			f.UpdatedBy = updatedBy.String
		}
		if ownerUserID.Valid {
			f.OwnerUserID = ownerUserID.String
		}
		if projectID.Valid {
			f.ProjectID = projectID.String
		}
		if ownerID.Valid {
			f.Owner = &entities.UserRef{
				ID:    ownerID.String,
				Name:  ownerName.String,
				Email: ownerEmail.String,
			}
		}
		if projID.Valid {
			f.Project = &entities.ProjectRef{ID: projID.String, Name: projName.String}
		}
		flows = append(flows, f)
	}
	return flows, rows.Err()
}

func (r *FlowRepository) ListByProject(ctx context.Context, projectID string) ([]entities.Flow, error) {
	rows, err := r.db.QueryContext(ctx, `
        SELECT f.id, f.name, f.description, f.scope, f.owner_user_id, f.project_id,
               f.status, f.version, f.definition_json, f.updated_at, f.created_by, f.updated_by,
               u.id, u.name, u.email,
               p.id, p.name
        FROM flows f
        LEFT JOIN users u ON u.id = f.created_by
        LEFT JOIN projects p ON p.id = f.project_id
        WHERE f.scope = 'project' AND f.project_id = $1
        ORDER BY f.updated_at DESC
    `, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var flows []entities.Flow
	for rows.Next() {
		var f entities.Flow
		var createdBy sql.NullString
		var updatedBy sql.NullString
		var ownerUserID sql.NullString
		var flowProjectID sql.NullString
		var ownerID sql.NullString
		var ownerName sql.NullString
		var ownerEmail sql.NullString
		var projID sql.NullString
		var projName sql.NullString
		if err := rows.Scan(
			&f.ID,
			&f.Name,
			&f.Description,
			&f.Scope,
			&ownerUserID,
			&flowProjectID,
			&f.Status,
			&f.Version,
			&f.DefinitionJSON,
			&f.UpdatedAt,
			&createdBy,
			&updatedBy,
			&ownerID,
			&ownerName,
			&ownerEmail,
			&projID,
			&projName,
		); err != nil {
			return nil, err
		}
		if createdBy.Valid {
			f.CreatedBy = createdBy.String
		}
		if updatedBy.Valid {
			f.UpdatedBy = updatedBy.String
		}
		if ownerUserID.Valid {
			f.OwnerUserID = ownerUserID.String
		}
		if flowProjectID.Valid {
			f.ProjectID = flowProjectID.String
		}
		if projID.Valid {
			f.Project = &entities.ProjectRef{ID: projID.String, Name: projName.String}
		}
		if ownerID.Valid {
			f.Owner = &entities.UserRef{
				ID:    ownerID.String,
				Name:  ownerName.String,
				Email: ownerEmail.String,
			}
		}
		flows = append(flows, f)
	}
	return flows, rows.Err()
}

func (r *FlowRepository) Get(ctx context.Context, id string) (*entities.Flow, error) {
	var f entities.Flow
	var createdBy sql.NullString
	var updatedBy sql.NullString
	var ownerUserID sql.NullString
	var projectID sql.NullString
	var ownerID sql.NullString
	var ownerName sql.NullString
	var ownerEmail sql.NullString
	var projID sql.NullString
	var projName sql.NullString
	err := r.db.QueryRowContext(ctx, `
        SELECT f.id, f.name, f.description, f.scope, f.owner_user_id, f.project_id,
               f.status, f.version, f.definition_json, f.updated_at, f.created_by, f.updated_by,
               u.id, u.name, u.email,
               p.id, p.name
        FROM flows f
        LEFT JOIN users u ON u.id = f.created_by
        LEFT JOIN projects p ON p.id = f.project_id
        WHERE f.id = $1
    `, id).Scan(
		&f.ID,
		&f.Name,
		&f.Description,
		&f.Scope,
		&ownerUserID,
		&projectID,
		&f.Status,
		&f.Version,
		&f.DefinitionJSON,
		&f.UpdatedAt,
		&createdBy,
		&updatedBy,
		&ownerID,
		&ownerName,
		&ownerEmail,
		&projID,
		&projName,
	)
	if err == sql.ErrNoRows {
		return nil, utils.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	if createdBy.Valid {
		f.CreatedBy = createdBy.String
	}
	if updatedBy.Valid {
		f.UpdatedBy = updatedBy.String
	}
	if ownerUserID.Valid {
		f.OwnerUserID = ownerUserID.String
	}
	if projectID.Valid {
		f.ProjectID = projectID.String
	}
	if ownerID.Valid {
		f.Owner = &entities.UserRef{
			ID:    ownerID.String,
			Name:  ownerName.String,
			Email: ownerEmail.String,
		}
	}
	if projID.Valid {
		f.Project = &entities.ProjectRef{ID: projID.String, Name: projName.String}
	}
	return &f, nil
}

func (r *FlowRepository) Update(ctx context.Context, flow entities.Flow) error {
	var updatedBy any
	if strings.TrimSpace(flow.UpdatedBy) != "" {
		updatedBy = flow.UpdatedBy
	}
	res, err := r.db.ExecContext(ctx, `
        UPDATE flows
        SET name=$2,
            description=$3,
            status=$4,
            version=$5,
            definition_json=$6::jsonb,
            updated_by=$7,
            updated_at=NOW()
        WHERE id=$1
    `, flow.ID, flow.Name, flow.Description, flow.Status, flow.Version, flow.DefinitionJSON, updatedBy)
	if err != nil {
		return err
	}
	count, _ := res.RowsAffected()
	if count == 0 {
		return utils.ErrNotFound
	}
	return nil
}

func (r *FlowRepository) Delete(ctx context.Context, id string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM flows WHERE id = $1`, id)
	return err
}

func (r *FlowRepository) DeleteByProject(ctx context.Context, projectID string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM flows WHERE project_id = $1`, projectID)
	return err
}
