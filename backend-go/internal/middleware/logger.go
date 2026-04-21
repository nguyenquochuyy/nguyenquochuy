package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"unishop/backend/internal/logger"
)

// ZapLogger middleware logs requests using uber-go/zap
func ZapLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery

		c.Next()

		latencyMs := time.Since(start).Milliseconds()
		status := c.Writer.Status()

		fields := []zap.Field{
			zap.Int("status", status),
			zap.String("method", c.Request.Method),
			zap.String("path", path),
			zap.String("ip", c.ClientIP()),
			zap.Int64("latency_ms", latencyMs),
		}
		if query != "" {
			fields = append(fields, zap.String("query", query))
		}
		if rid, ok := c.Get("requestId"); ok {
			fields = append(fields, zap.Any("request_id", rid))
		}
		if uid, ok := c.Get("userId"); ok && uid != "" {
			fields = append(fields, zap.Any("user_id", uid))
		}

		if len(c.Errors) > 0 {
			for _, e := range c.Errors.Errors() {
				logger.Log.Error(e, fields...)
			}
		} else if status >= 500 {
			logger.Log.Error("Server error", fields...)
		} else if status >= 400 {
			logger.Log.Warn("Client error", fields...)
		} else {
			logger.Log.Info("Request", fields...)
		}
	}
}
