package handlers

import (
	"io"
	"time"

	"github.com/gin-gonic/gin"
	"unishop/backend/internal/events"
)

// GET /api/events — SSE stream
func StreamEvents(c *gin.Context) {
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("X-Accel-Buffering", "no")
	c.Header("Access-Control-Allow-Origin", "*")

	client := make(chan string, 16)
	events.Global.Register(client)
	defer events.Global.Unregister(client)

	// Heartbeat ticker to keep connection alive
	ticker := time.NewTicker(25 * time.Second)
	defer ticker.Stop()

	c.Stream(func(w io.Writer) bool {
		select {
		case msg, ok := <-client:
			if !ok {
				return false
			}
			c.SSEvent("message", msg)
			return true
		case <-ticker.C:
			c.SSEvent("heartbeat", "ping")
			return true
		case <-c.Request.Context().Done():
			return false
		}
	})
}
