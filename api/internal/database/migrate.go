package database

import (
	"database/sql"
	"fmt"
	"os"

	"github.com/pressly/goose/v3"
)

func Migrate(db *sql.DB) error {
	if err := goose.SetDialect("postgres"); err != nil {
		return err
	}
	if err := goose.Up(db, migrationsDir()); err != nil {
		return fmt.Errorf("migrate: %w", err)
	}
	return nil
}

func migrationsDir() string {
	candidates := []string{
		"./internal/migrations",     // when CWD is api/
		"./api/internal/migrations", // when CWD is repo root
	}
	for _, p := range candidates {
		if _, err := os.Stat(p); err == nil {
			return p
		}
	}
	return "./internal/migrations"
}
