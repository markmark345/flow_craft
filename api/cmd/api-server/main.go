package main

import (
	"log"

	"flowcraft-api/internal/config"
	"flowcraft-api/internal/database"
	"flowcraft-api/internal/handlers"
	"flowcraft-api/internal/temporal"
	"flowcraft-api/internal/utils"
)

func main() {
	cfg := config.Load()
	logger := utils.NewLogger()

	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to connect db: %v", err)
	}
	defer db.Close()

	if err := database.Migrate(db); err != nil {
		log.Fatalf("migration failed: %v", err)
	}

	temporalClient, err := temporal.NewClient(cfg)
	if err != nil {
		log.Fatalf("failed to connect temporal: %v", err)
	}
	defer temporalClient.Close()

	router := handlers.NewRouter(cfg, db, logger, temporalClient)
	logger.Info().Msgf("api server listening on :%s", cfg.AppPort)
	if err := router.Run(":" + cfg.AppPort); err != nil {
		log.Fatalf("server error: %v", err)
	}
}
