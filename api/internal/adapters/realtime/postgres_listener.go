package realtime

import (
	"context"
	"encoding/json"
	"time"

	"flowcraft-api/internal/adapters/websocket"
	"flowcraft-api/internal/core/domain"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/rs/zerolog"
)

type PostgresListener struct {
	connConfig *pgx.ConnConfig
	hub        *websocket.Hub
	logger     zerolog.Logger
}

func NewPostgresListener(databaseURL string, hub *websocket.Hub, logger zerolog.Logger) (*PostgresListener, error) {
	config, err := pgx.ParseConfig(databaseURL)
	if err != nil {
		return nil, err
	}
	return &PostgresListener{
		connConfig: config,
		hub:        hub,
		logger:     logger,
	}, nil
}

func (l *PostgresListener) Listen(ctx context.Context) error {
	conn, err := pgx.ConnectConfig(ctx, l.connConfig)
	if err != nil {
		return err
	}
	defer conn.Close(ctx)

	_, err = conn.Exec(ctx, "LISTEN run_updates")
	if err != nil {
		return err
	}

	l.logger.Info().Msg("Started listening for postgres notifications on channel: run_updates")

	for {
		if ctx.Err() != nil {
			return ctx.Err()
		}

		notification, err := conn.WaitForNotification(ctx)
		if err != nil {
			if pgconn.Timeout(err) {
				continue
			}
			l.logger.Error().Err(err).Msg("error waiting for notification")
			// Try to reconnect? For now, just return
			return err
		}

		l.handleNotification(notification)
	}
}

// ListenWithRetry runs Listen in a loop with exponential backoff on failure.
// It stops only when ctx is cancelled. Use this instead of Listen directly.
func (l *PostgresListener) ListenWithRetry(ctx context.Context) {
	const maxBackoff = 30 * time.Second
	backoff := 1 * time.Second

	for {
		if ctx.Err() != nil {
			return
		}
		if err := l.Listen(ctx); err != nil {
			if ctx.Err() != nil {
				return
			}
			l.logger.Error().Err(err).Dur("retry_in", backoff).Msg("postgres listener disconnected, retrying")
			select {
			case <-ctx.Done():
				return
			case <-time.After(backoff):
			}
			backoff *= 2
			if backoff > maxBackoff {
				backoff = maxBackoff
			}
		}
	}
}

func (l *PostgresListener) handleNotification(n *pgconn.Notification) {
	l.logger.Debug().Str("channel", n.Channel).Str("payload", n.Payload).Msg("received notification")

	if n.Channel == "run_updates" {
		var update domain.RunUpdateEvent
		if err := json.Unmarshal([]byte(n.Payload), &update); err != nil {
			l.logger.Error().Err(err).Msg("failed to unmarshal run update payload")
			return
		}
		// Broadcast to all connected WS clients
		l.hub.Broadcast("run_update", update)
	}
}
