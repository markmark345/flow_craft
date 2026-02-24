package ports

// RealtimeService pushes messages to connected WebSocket clients.
// Implemented by the WebSocket Hub; injected into adapters that need
// to broadcast events without importing the websocket package directly.
type RealtimeService interface {
	// Broadcast serialises payload as JSON and sends it to all clients
	// subscribed to the given channel.
	Broadcast(channel string, payload any)
}
