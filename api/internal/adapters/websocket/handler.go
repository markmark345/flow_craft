package websocket

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins for now (dev mode)
	},
}

// ValidateTokenFunc validates a bearer token and returns an error if invalid.
// Injected at construction time to keep this package free of auth dependencies.
type ValidateTokenFunc func(ctx context.Context, token string) error

// Handler manages WebSocket upgrade and client registration.
type Handler struct {
	hub           *Hub
	validateToken ValidateTokenFunc
}

// NewHandler creates a Handler. validateToken is called before upgrading each connection.
func NewHandler(hub *Hub, validateToken ValidateTokenFunc) *Handler {
	return &Handler{hub: hub, validateToken: validateToken}
}

// HandleWS upgrades an HTTP connection to WebSocket after validating the bearer
// token supplied as a ?token= query param (browsers cannot set WS headers).
func (h *Handler) HandleWS(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
		return
	}
	if err := h.validateToken(c.Request.Context(), token); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		h.hub.logger.Error().Err(err).Msg("failed to upgrade websocket")
		return
	}
	client := &Client{hub: h.hub, conn: conn, send: make(chan []byte, 256)}
	client.hub.register <- client

	go client.writePump()
	go client.readPump()
}
