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

	_, err := r.db.ExecContext(ctx, `
        INSERT INTO flows (id, name, status, version, definition_json, created_by, updated_by)
        VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)
    `, flow.ID, flow.Name, flow.Status, flow.Version, flow.DefinitionJSON, createdBy, updatedBy)
	return err
}

func (r *FlowRepository) List(ctx context.Context) ([]entities.Flow, error) {
	rows, err := r.db.QueryContext(ctx, `
        SELECT f.id, f.name, f.status, f.version, f.definition_json, f.updated_at, f.created_by, f.updated_by,
               u.id, u.name, u.email
        FROM flows f
        LEFT JOIN users u ON u.id = f.created_by
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
		var ownerID sql.NullString
		var ownerName sql.NullString
		var ownerEmail sql.NullString
		if err := rows.Scan(
			&f.ID,
			&f.Name,
			&f.Status,
			&f.Version,
			&f.DefinitionJSON,
			&f.UpdatedAt,
			&createdBy,
			&updatedBy,
			&ownerID,
			&ownerName,
			&ownerEmail,
		); err != nil {
			return nil, err
		}
		if createdBy.Valid {
			f.CreatedBy = createdBy.String
		}
		if updatedBy.Valid {
			f.UpdatedBy = updatedBy.String
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
	var ownerID sql.NullString
	var ownerName sql.NullString
	var ownerEmail sql.NullString
	err := r.db.QueryRowContext(ctx, `
        SELECT f.id, f.name, f.status, f.version, f.definition_json, f.updated_at, f.created_by, f.updated_by,
               u.id, u.name, u.email
        FROM flows f
        LEFT JOIN users u ON u.id = f.created_by
        WHERE f.id = $1
    `, id).Scan(&f.ID, &f.Name, &f.Status, &f.Version, &f.DefinitionJSON, &f.UpdatedAt, &createdBy, &updatedBy, &ownerID, &ownerName, &ownerEmail)
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
	if ownerID.Valid {
		f.Owner = &entities.UserRef{
			ID:    ownerID.String,
			Name:  ownerName.String,
			Email: ownerEmail.String,
		}
	}
	return &f, nil
}

func (r *FlowRepository) Update(ctx context.Context, flow entities.Flow) error {
	var updatedBy any
	if strings.TrimSpace(flow.UpdatedBy) != "" {
		updatedBy = flow.UpdatedBy
	}
	res, err := r.db.ExecContext(ctx, `
        UPDATE flows SET name=$2, status=$3, version=$4, definition_json=$5::jsonb, updated_by=$6, updated_at=NOW()
        WHERE id=$1
    `, flow.ID, flow.Name, flow.Status, flow.Version, flow.DefinitionJSON, updatedBy)
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
