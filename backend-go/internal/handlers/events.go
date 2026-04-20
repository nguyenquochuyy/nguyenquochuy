package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"unishop/backend/internal/events"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // allow all origins for now (CORS is handled at middleware layer)
	},
}

// GET /api/events — WebSocket stream
func StreamEvents(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}

	// Register the new websocket client
	events.Global.Register(conn)
	defer events.Global.Unregister(conn)

	// Keep the connection open and read messages
	// This read pump is necessary to detect when the client disconnects
	for {
		_, _, err := conn.ReadMessage()
		if err != nil {
			// Error or client closed connection
			break
		}
	}
}
