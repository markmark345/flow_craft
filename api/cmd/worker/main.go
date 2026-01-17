package main

import (
	"flowcraft-api/internal/adapters/database/postgres"
	"flowcraft-api/internal/config"
	"flowcraft-api/internal/temporal"
	"flowcraft-api/internal/utils"
)

func main() {
	cfg := config.Load()
	logger := utils.NewLogger()

	db, err := postgres.Connect(cfg.DatabaseURL)
	if err != nil {
		logger.Fatal().Err(err).Msg("failed to connect db")
	}
	defer db.Close()

	if err := postgres.Migrate(db); err != nil {
		logger.Fatal().Err(err).Msg("migration failed")
	}

	worker, err := temporal.NewWorker(cfg, logger, db)
	if err != nil {
		logger.Fatal().Err(err).Msg("failed to start worker")
	}
	if err := worker.Run(); err != nil {
		logger.Fatal().Err(err).Msg("worker stopped")
	}
}
