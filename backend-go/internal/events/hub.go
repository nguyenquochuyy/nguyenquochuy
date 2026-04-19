package events

import (
	"encoding/json"
	"sync"
)

// Event sent to all connected SSE clients
type Event struct {
	Type       string `json:"type"`       // "data_changed"
	Collection string `json:"collection"` // "orders" | "products" | "customers" | "*"
}

// Hub manages all active SSE client channels
type Hub struct {
	mu      sync.RWMutex
	clients map[chan string]bool
}

var Global = &Hub{
	clients: make(map[chan string]bool),
}

func (h *Hub) Register(ch chan string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clients[ch] = true
}

func (h *Hub) Unregister(ch chan string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.clients, ch)
	close(ch)
}

// Broadcast sends a JSON event to every connected SSE client (non-blocking)
func (h *Hub) Broadcast(collection string) {
	payload, _ := json.Marshal(Event{Type: "data_changed", Collection: collection})
	msg := string(payload)

	h.mu.RLock()
	defer h.mu.RUnlock()
	for ch := range h.clients {
		select {
		case ch <- msg:
		default: // skip slow clients
		}
	}
}
