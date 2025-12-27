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

	AppBaseURL         string
	OAuthStateSecret   string
	GoogleClientID     string
	GoogleClientSecret string
	GoogleRedirectURL  string
	GitHubClientID     string
	GitHubClientSecret string
	GitHubRedirectURL  string

	CredentialsEncKey string

	SMTPHost        string
	SMTPPort        string
	SMTPUser        string
	SMTPPass        string
	SMTPFrom        string
	SMTPUseTLS      string
	SMTPUseStartTLS string
	SMTPSupportURL  string
}

func Load() Config {
	return Config{
		AppPort:           env("APP_PORT", "8080"),
		DatabaseURL:       env("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/flowcraft?sslmode=disable"),
		CORSOrigins:       env("CORS_ORIGINS", "*"),
		TemporalAddress:   env("TEMPORAL_ADDRESS", "localhost:7233"),
		TemporalNamespace: env("TEMPORAL_NAMESPACE", "default"),

		AppBaseURL:         env("APP_BASE_URL", "http://localhost:3000"),
		OAuthStateSecret:   env("OAUTH_STATE_SECRET", ""),
		GoogleClientID:     env("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret: env("GOOGLE_CLIENT_SECRET", ""),
		GoogleRedirectURL:  env("GOOGLE_REDIRECT_URL", ""),
		GitHubClientID:     env("GITHUB_CLIENT_ID", ""),
		GitHubClientSecret: env("GITHUB_CLIENT_SECRET", ""),
		GitHubRedirectURL:  env("GITHUB_REDIRECT_URL", ""),

		CredentialsEncKey: env("CREDENTIALS_ENC_KEY", ""),

		SMTPHost:        env("SMTP_HOST", ""),
		SMTPPort:        env("SMTP_PORT", "587"),
		SMTPUser:        env("SMTP_USER", ""),
		SMTPPass:        env("SMTP_PASS", ""),
		SMTPFrom:        env("SMTP_FROM", ""),
		SMTPUseTLS:      env("SMTP_USE_TLS", ""),
		SMTPUseStartTLS: env("SMTP_USE_STARTTLS", ""),
		SMTPSupportURL:  env("SMTP_SUPPORT_URL", ""),
	}
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
