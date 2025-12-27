package temporal

import (
	"flowcraft-api/internal/config"
	"flowcraft-api/internal/repositories"
)

type stepDependencies struct {
	cfg      config.Config
	creds    *repositories.CredentialRepository
	credsKey []byte
}
