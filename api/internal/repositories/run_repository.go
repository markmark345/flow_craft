package repositories

import (
	"context"
	"database/sql"
	"time"

	"flowcraft-api/internal/entities"
	"flowcraft-api/internal/utils"
)

type RunRepository struct {
	db *sql.DB
}

func NewRunRepository(db *sql.DB) *RunRepository {
	return &RunRepository{db: db}
}

func (r *RunRepository) Create(ctx context.Context, run entities.Run) error {
	_, err := r.db.ExecContext(ctx, `
        INSERT INTO runs (id, flow_id, status, started_at, finished_at, log, temporal_workflow_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, run.ID, run.FlowID, run.Status, run.StartedAt, run.FinishedAt, run.Log, run.TemporalWorkflow)
	return err
}

func (r *RunRepository) List(ctx context.Context) ([]entities.Run, error) {
	rows, err := r.db.QueryContext(ctx, `
        SELECT id, flow_id, status, started_at, finished_at, log, temporal_workflow_id, created_at, updated_at
        FROM runs ORDER BY created_at DESC
    `)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanRunRows(rows)
}

func (r *RunRepository) ListForUser(ctx context.Context, userID string) ([]entities.Run, error) {
	rows, err := r.db.QueryContext(ctx, `
        SELECT r.id, r.flow_id, r.status, r.started_at, r.finished_at, r.log, r.temporal_workflow_id, r.created_at, r.updated_at
        FROM runs r
        JOIN flows f ON f.id = r.flow_id
        LEFT JOIN project_members pm ON pm.project_id = f.project_id AND pm.user_id = $1
        WHERE
          (f.scope = 'personal' AND (f.owner_user_id = $1 OR (f.owner_user_id IS NULL AND f.created_by = $1)))
          OR (f.scope = 'project' AND pm.user_id IS NOT NULL)
        ORDER BY r.created_at DESC
    `, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanRunRows(rows)
}

func (r *RunRepository) ListByOwner(ctx context.Context, userID string) ([]entities.Run, error) {
	rows, err := r.db.QueryContext(ctx, `
        SELECT r.id, r.flow_id, r.status, r.started_at, r.finished_at, r.log, r.temporal_workflow_id, r.created_at, r.updated_at
        FROM runs r
        JOIN flows f ON f.id = r.flow_id
        WHERE f.scope = 'personal' AND (f.owner_user_id = $1 OR (f.owner_user_id IS NULL AND f.created_by = $1))
        ORDER BY r.created_at DESC
    `, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanRunRows(rows)
}

func (r *RunRepository) ListByProject(ctx context.Context, projectID string) ([]entities.Run, error) {
	rows, err := r.db.QueryContext(ctx, `
        SELECT r.id, r.flow_id, r.status, r.started_at, r.finished_at, r.log, r.temporal_workflow_id, r.created_at, r.updated_at
        FROM runs r
        JOIN flows f ON f.id = r.flow_id
        WHERE f.scope = 'project' AND f.project_id = $1
        ORDER BY r.created_at DESC
    `, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return scanRunRows(rows)
}

func (r *RunRepository) Get(ctx context.Context, id string) (*entities.Run, error) {
	var run entities.Run
	var startedAt sql.NullTime
	var finishedAt sql.NullTime
	var createdAt time.Time
	var updatedAt time.Time
	err := r.db.QueryRowContext(ctx, `
        SELECT id, flow_id, status, started_at, finished_at, log, temporal_workflow_id, created_at, updated_at
        FROM runs WHERE id=$1
    `, id).Scan(&run.ID, &run.FlowID, &run.Status, &startedAt, &finishedAt, &run.Log, &run.TemporalWorkflow, &createdAt, &updatedAt)
	if err == sql.ErrNoRows {
		return nil, utils.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	if startedAt.Valid {
		t := startedAt.Time
		run.StartedAt = &t
	}
	if finishedAt.Valid {
		t := finishedAt.Time
		run.FinishedAt = &t
	}
	run.CreatedAt = createdAt
	run.UpdatedAt = updatedAt
	return &run, nil
}

func (r *RunRepository) GetForUser(ctx context.Context, id string, userID string) (*entities.Run, error) {
	var run entities.Run
	var startedAt sql.NullTime
	var finishedAt sql.NullTime
	var createdAt time.Time
	var updatedAt time.Time
	err := r.db.QueryRowContext(ctx, `
        SELECT r.id, r.flow_id, r.status, r.started_at, r.finished_at, r.log, r.temporal_workflow_id, r.created_at, r.updated_at
        FROM runs r
        JOIN flows f ON f.id = r.flow_id
        LEFT JOIN project_members pm ON pm.project_id = f.project_id AND pm.user_id = $2
        WHERE r.id=$1 AND (
          (f.scope = 'personal' AND (f.owner_user_id = $2 OR (f.owner_user_id IS NULL AND f.created_by = $2)))
          OR (f.scope = 'project' AND pm.user_id IS NOT NULL)
        )
    `, id, userID).Scan(&run.ID, &run.FlowID, &run.Status, &startedAt, &finishedAt, &run.Log, &run.TemporalWorkflow, &createdAt, &updatedAt)
	if err == sql.ErrNoRows {
		return nil, utils.ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	if startedAt.Valid {
		t := startedAt.Time
		run.StartedAt = &t
	}
	if finishedAt.Valid {
		t := finishedAt.Time
		run.FinishedAt = &t
	}
	run.CreatedAt = createdAt
	run.UpdatedAt = updatedAt
	return &run, nil
}

func (r *RunRepository) UpdateStatus(ctx context.Context, id string, status string, log string) error {
	res, err := r.db.ExecContext(ctx, `
        UPDATE runs
        SET status=$2,
            log=$3,
            started_at = CASE WHEN $2 = 'running' AND started_at IS NULL THEN NOW() ELSE started_at END,
            finished_at = CASE
                WHEN ($2 = 'success' OR $2 = 'failed' OR $2 = 'canceled') AND finished_at IS NULL THEN NOW()
                ELSE finished_at
            END,
            updated_at=NOW()
        WHERE id=$1
    `, id, status, log)
	if err != nil {
		return err
	}
	count, _ := res.RowsAffected()
	if count == 0 {
		return utils.ErrNotFound
	}
	return nil
}

func scanRunRows(rows *sql.Rows) ([]entities.Run, error) {
	var items []entities.Run
	for rows.Next() {
		var rItem entities.Run
		var startedAt sql.NullTime
		var finishedAt sql.NullTime
		var createdAt time.Time
		var updatedAt time.Time
		if err := rows.Scan(&rItem.ID, &rItem.FlowID, &rItem.Status, &startedAt, &finishedAt, &rItem.Log, &rItem.TemporalWorkflow, &createdAt, &updatedAt); err != nil {
			return nil, err
		}
		if startedAt.Valid {
			t := startedAt.Time
			rItem.StartedAt = &t
		}
		if finishedAt.Valid {
			t := finishedAt.Time
			rItem.FinishedAt = &t
		}
		rItem.CreatedAt = createdAt
		rItem.UpdatedAt = updatedAt
		items = append(items, rItem)
	}
	return items, rows.Err()
}
