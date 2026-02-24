package temporal

import (
	"github.com/uber-go/tally/v4"
	"github.com/uber-go/tally/v4/prometheus"
	"go.temporal.io/sdk/client"

	"flowcraft-api/internal/config"
)

func NewClient(cfg config.Config) (client.Client, error) {
	// Configure Prometheus Tally Scope
	reporter := prometheus.NewReporter(prometheus.Options{})
	scope, _ := tally.NewRootScope(tally.ScopeOptions{
		Prefix:    "temporal",
		Reporter:  reporter,
		Separator: prometheus.DefaultSeparator,
	})

	// Use a lazy client so the API/worker can start even if Temporal isn't ready yet.
	// The connection will be established on first use and retried by the underlying gRPC client.
	return client.NewLazyClient(client.Options{
		HostPort:       cfg.TemporalAddress,
		Namespace:      cfg.TemporalNamespace,
		MetricsHandler: temporaltally.NewMetricsHandler(scope),
	})
}
