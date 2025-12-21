package repositories

import (
	"context"
	"database/sql"

	"flowcraft-api/internal/database"
)

type SystemRepository struct {
	db *sql.DB
}

func NewSystemRepository(db *sql.DB) *SystemRepository {
	return &SystemRepository{db: db}
}

func (r *SystemRepository) ResetWorkspace(ctx context.Context) error {
	return database.RunInTx(r.db, func(tx *sql.Tx) error {
		if _, err := tx.ExecContext(ctx, `DELETE FROM runs`); err != nil {
			return err
		}
		if _, err := tx.ExecContext(ctx, `DELETE FROM flows`); err != nil {
			return err
		}
		return nil
	})
}

