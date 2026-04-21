package events

import (
	"sync"

	"github.com/gorilla/websocket"
	"go.uber.org/zap"
	"unishop/backend/internal/logger"
)

// Event sent to all connected WebSocket clients
type Event struct {
	Type       string `json:"type"`       // "data_changed"
	Collection string `json:"collection"` // "orders" | "products" | "customers" | "*"
}

// Hub manages all active WebSocket clients
type Hub struct {
	mu      sync.RWMutex
	clients map[*websocket.Conn]bool
}

var Global = &Hub{
	clients: make(map[*websocket.Conn]bool),
}

func (h *Hub) Register(conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clients[conn] = true
	logger.Log.Info("WebSocket client connected", zap.Int("total_clients", len(h.clients)))
}

func (h *Hub) Unregister(conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if _, ok := h.clients[conn]; ok {
		delete(h.clients, conn)
		conn.Close()
		logger.Log.Info("WebSocket client disconnected", zap.Int("total_clients", len(h.clients)))
	}
}

// Broadcast sends a JSON event to every connected WebSocket client
func (h *Hub) Broadcast(collection string) {
	event := Event{Type: "data_changed", Collection: collection}

	h.mu.RLock()
	defer h.mu.RUnlock()
	for conn := range h.clients {
		err := conn.WriteJSON(event)
		if err != nil {
			logger.Log.Warn("Failed to send WebSocket message", zap.Error(err))
			// Do not remove here to avoid map iteration issues.
			// The read pump will catch the error and unregister.
			conn.Close()
		}
	}
}
