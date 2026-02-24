package main

import (
	"context"
	"flowcraft-api/internal/adapters/database/postgres"
	httpadapter "flowcraft-api/internal/adapters/http"
	"flowcraft-api/internal/adapters/realtime"
	"flowcraft-api/internal/adapters/websocket"
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

	// Realtime
	hub := websocket.NewHub(logger)
	go hub.Run()

	pgListener, err := realtime.NewPostgresListener(cfg.DatabaseURL, hub, logger)
	if err != nil {
		logger.Fatal().Err(err).Msg("failed to initialize postgres listener")
	}
	go func() {
		if err := pgListener.Listen(context.Background()); err != nil {
			logger.Error().Err(err).Msg("postgres listener stopped")
		}
	}()

	router := httpadapter.NewRouter(cfg, db, logger, temporalClient, hub)
	logger.Info().Msgf("api server listening on :%s", cfg.AppPort)
	if err := router.Run(":" + cfg.AppPort); err != nil {
		logger.Fatal().Err(err).Msg("server error")
	}
}
