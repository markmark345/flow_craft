package main

import (
	"flowcraft-api/internal/adapters/database/postgres"
	httpadapter "flowcraft-api/internal/adapters/http"
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

	temporalClient, err := temporal.NewClient(cfg)
	if err != nil {
		logger.Fatal().Err(err).Msg("failed to connect temporal")
	}
	defer temporalClient.Close()

	router := httpadapter.NewRouter(cfg, db, logger, temporalClient)
	logger.Info().Msgf("api server listening on :%s", cfg.AppPort)
	if err := router.Run(":" + cfg.AppPort); err != nil {
		logger.Fatal().Err(err).Msg("server error")
	}
}
