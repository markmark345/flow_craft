package temporal

import (
	"flowcraft-api/internal/config"
	"flowcraft-api/internal/adapters/database/postgres"
)

type stepDependencies struct {
	cfg      config.Config
	creds    *postgres.CredentialRepository
	credsKey []byte
}
