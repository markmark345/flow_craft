package main

import (
    "log"

    "flowcraft-api/internal/config"
    "flowcraft-api/internal/database"
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

    worker, err := temporal.NewWorker(cfg, logger, db)
    if err != nil {
        log.Fatalf("failed to start worker: %v", err)
    }
    if err := worker.Run(); err != nil {
        log.Fatalf("worker stopped: %v", err)
    }
}
