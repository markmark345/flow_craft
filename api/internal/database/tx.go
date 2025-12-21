package database

import "database/sql"

func RunInTx(db *sql.DB, fn func(tx *sql.Tx) error) error {
    tx, err := db.Begin()
    if err != nil {
        return err
    }
    if err := fn(tx); err != nil {
        tx.Rollback()
        return err
    }
    return tx.Commit()
}
