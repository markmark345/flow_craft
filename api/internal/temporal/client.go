package temporal

import (
	"go.temporal.io/sdk/client"

	"flowcraft-api/internal/config"
)

// NewClient creates a lazy Temporal client.
// The connection is established on first use and retried by the underlying gRPC client.
func NewClient(cfg config.Config) (client.Client, error) {
	return client.NewLazyClient(client.Options{
		HostPort:  cfg.TemporalAddress,
		Namespace: cfg.TemporalNamespace,
	})
}
