package main

import (
	"log"

	"flowcraft-api/internal/config"
	"flowcraft-api/internal/database"
)

func main() {
	cfg := config.Load()
	db, err := database.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("failed to connect db: %v", err)
	}
	defer db.Close()

	if err := database.Migrate(db); err != nil {
		log.Fatalf("migration failed: %v", err)
	}
	log.Println("migrations applied")
}
