package temporal

import (
	"go.temporal.io/sdk/client"

	"flowcraft-api/internal/config"
)

func NewClient(cfg config.Config) (client.Client, error) {
	// Use a lazy client so the API/worker can start even if Temporal isn't ready yet.
	// The connection will be established on first use and retried by the underlying gRPC client.
	return client.NewLazyClient(client.Options{
		HostPort:  cfg.TemporalAddress,
		Namespace: cfg.TemporalNamespace,
	})
}
