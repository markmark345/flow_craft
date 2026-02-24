package ports

import (
	"context"

	"flowcraft-api/internal/core/domain"
)

type RealtimeService interface {
	BroadcastRunUpdate(ctx context.Context, run domain.Run) error
	Broadcast(channel string, message interface{})
}
