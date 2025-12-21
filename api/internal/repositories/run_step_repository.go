package repositories

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"flowcraft-api/internal/entities"
	"flowcraft-api/internal/utils"
)

type RunStepRepository struct {
	db *sql.DB
}

func NewRunStepRepository(db *sql.DB) *RunStepRepository {
	return &RunStepRepository{db: db}
}

func (r *RunStepRepository) CreateMany(ctx context.Context, steps []entities.RunStep) error {
	if len(steps) == 0 {
		return nil
	}

	var b strings.Builder
	b.WriteString(`
        INSERT INTO run_steps (
            id, run_id, step_key, name, status, node_id, node_type,
            inputs_json, outputs_json, log, error
        ) VALUES
    `)

	args := make([]any, 0, len(steps)*11)
	for i, s := range steps {
		if s.ID == "" {
			s.ID = utils.NewUUID()
		}

		if i > 0 {
			b.WriteString(",")
		}
		base := i*11 + 1
		b.WriteString(fmt.Sprintf("($%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d,$%d)",
			base, base+1, base+2, base+3, base+4, base+5, base+6, base+7, base+8, base+9, base+10,
		))
		args = append(args,
			s.ID,
			s.RunID,
			s.StepKey,
			s.Name,
			s.Status,
			nullString(s.NodeID),
			nullString(s.NodeType),
			nullJSON(s.InputsJSON),
			nullJSON(s.OutputsJSON),
			nullString(s.Log),
			nullString(s.Error),
		)
	}

	b.WriteString(`
        ON CONFLICT (id) DO UPDATE SET
            step_key=EXCLUDED.step_key,
            name=EXCLUDED.name,
            status=EXCLUDED.status,
            node_id=EXCLUDED.node_id,
            node_type=EXCLUDED.node_type,
            inputs_json=EXCLUDED.inputs_json,
            outputs_json=EXCLUDED.outputs_json,
            log=EXCLUDED.log,
            error=EXCLUDED.error,
            started_at=NULL,
            finished_at=NULL,
            updated_at=NOW()
    `)

	_, err := r.db.ExecContext(ctx, b.String(), args...)
	return err
}

func (r *RunStepRepository) ListByRunID(ctx context.Context, runID string) ([]entities.RunStep, error) {
	rows, err := r.db.QueryContext(ctx, `
        SELECT id, run_id, step_key, name, status, node_id, node_type,
               inputs_json, outputs_json, log, error, started_at, finished_at, created_at, updated_at
        FROM run_steps
        WHERE run_id=$1
        ORDER BY step_key ASC
    `, runID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []entities.RunStep
	for rows.Next() {
		var step entities.RunStep
		var nodeID sql.NullString
		var nodeType sql.NullString
		var inputs []byte
		var outputs []byte
		var logText sql.NullString
		var errText sql.NullString
		var startedAt sql.NullTime
		var finishedAt sql.NullTime
		var createdAt time.Time
		var updatedAt time.Time

		if err := rows.Scan(
			&step.ID,
			&step.RunID,
			&step.StepKey,
			&step.Name,
			&step.Status,
			&nodeID,
			&nodeType,
			&inputs,
			&outputs,
			&logText,
			&errText,
			&startedAt,
			&finishedAt,
			&createdAt,
			&updatedAt,
		); err != nil {
			return nil, err
		}

		if nodeID.Valid {
			step.NodeID = nodeID.String
		}
		if nodeType.Valid {
			step.NodeType = nodeType.String
		}
		if len(inputs) > 0 {
			step.InputsJSON = inputs
		}
		if len(outputs) > 0 {
			step.OutputsJSON = outputs
		}
		if logText.Valid {
			step.Log = logText.String
		}
		if errText.Valid {
			step.Error = errText.String
		}
		if startedAt.Valid {
			t := startedAt.Time
			step.StartedAt = &t
		}
		if finishedAt.Valid {
			t := finishedAt.Time
			step.FinishedAt = &t
		}
		step.CreatedAt = createdAt
		step.UpdatedAt = updatedAt

		items = append(items, step)
	}
	return items, rows.Err()
}

func (r *RunStepRepository) Get(ctx context.Context, runID string, stepIDOrKey string) (*entities.RunStep, error) {
	var step entities.RunStep
	var nodeID sql.NullString
	var nodeType sql.NullString
	var inputs []byte
	var outputs []byte
	var logText sql.NullString
	var errText sql.NullString
	var startedAt sql.NullTime
	var finishedAt sql.NullTime
	var createdAt time.Time
	var updatedAt time.Time

	err := r.db.QueryRowContext(ctx, `
        SELECT id, run_id, step_key, name, status, node_id, node_type,
               inputs_json, outputs_json, log, error, started_at, finished_at, created_at, updated_at
        FROM run_steps
        WHERE run_id=$1 AND (id::text=$2 OR step_key=$2)
        LIMIT 1
    `, runID, stepIDOrKey).Scan(
		&step.ID,
		&step.RunID,
		&step.StepKey,
		&step.Name,
		&step.Status,
		&nodeID,
		&nodeType,
		&inputs,
		&outputs,
		&logText,
		&errText,
		&startedAt,
		&finishedAt,
		&createdAt,
		&updatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, utils.ErrNotFound
	}
	if err != nil {
		return nil, err
	}

	if nodeID.Valid {
		step.NodeID = nodeID.String
	}
	if nodeType.Valid {
		step.NodeType = nodeType.String
	}
	if len(inputs) > 0 {
		step.InputsJSON = inputs
	}
	if len(outputs) > 0 {
		step.OutputsJSON = outputs
	}
	if logText.Valid {
		step.Log = logText.String
	}
	if errText.Valid {
		step.Error = errText.String
	}
	if startedAt.Valid {
		t := startedAt.Time
		step.StartedAt = &t
	}
	if finishedAt.Valid {
		t := finishedAt.Time
		step.FinishedAt = &t
	}
	step.CreatedAt = createdAt
	step.UpdatedAt = updatedAt
	return &step, nil
}

func (r *RunStepRepository) UpdateState(ctx context.Context, id string, status string, inputsJSON []byte, outputsJSON []byte, logText string, errText string) error {
	res, err := r.db.ExecContext(ctx, `
        UPDATE run_steps
        SET status=$2,
            log=$3,
            error=$4,
            inputs_json = COALESCE($5::jsonb, inputs_json),
            outputs_json = COALESCE($6::jsonb, outputs_json),
            started_at = CASE WHEN $2 = 'running' AND started_at IS NULL THEN NOW() ELSE started_at END,
            finished_at = CASE
                WHEN ($2 = 'success' OR $2 = 'failed' OR $2 = 'canceled' OR $2 = 'skipped') AND finished_at IS NULL THEN NOW()
                ELSE finished_at
            END,
            updated_at=NOW()
        WHERE id=$1
    `, id, status, nullString(logText), nullString(errText), nullJSON(inputsJSON), nullJSON(outputsJSON))
	if err != nil {
		return err
	}
	count, _ := res.RowsAffected()
	if count == 0 {
		return utils.ErrNotFound
	}
	return nil
}

func (r *RunStepRepository) CancelOpenSteps(ctx context.Context, runID string, message string) error {
	_, err := r.db.ExecContext(ctx, `
        UPDATE run_steps
        SET status='canceled',
            error=CASE WHEN status='running' THEN $2 ELSE error END,
            finished_at=NOW(),
            updated_at=NOW()
        WHERE run_id=$1 AND status IN ('queued', 'running')
    `, runID, message)
	return err
}

func nullString(s string) any {
	if strings.TrimSpace(s) == "" {
		return nil
	}
	return s
}

func nullJSON(b []byte) any {
	if len(b) == 0 {
		return nil
	}
	return b
}
