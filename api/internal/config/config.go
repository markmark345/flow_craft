package config

import (
    "os"
)

type Config struct {
    AppPort           string
    DatabaseURL       string
    CORSOrigins       string
    TemporalAddress   string
    TemporalNamespace string
}

func Load() Config {
    return Config{
        AppPort:           env("APP_PORT", "8080"),
        DatabaseURL:       env("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/flowcraft?sslmode=disable"),
        CORSOrigins:       env("CORS_ORIGINS", "*"),
        TemporalAddress:   env("TEMPORAL_ADDRESS", "localhost:7233"),
        TemporalNamespace: env("TEMPORAL_NAMESPACE", "default"),
    }
}

func env(key, fallback string) string {
    if v := os.Getenv(key); v != "" {
        return v
    }
    return fallback
}
