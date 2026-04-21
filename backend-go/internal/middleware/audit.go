package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"unishop/backend/internal/logger"
)

// AuditLog log các operations nhạy cảm (user changes, financial, etc.)
func AuditLog(action string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, _ := c.Get("userId")
		role, _ := c.Get("role")

		logger.Log.Info("AUDIT",
			zap.String("action", action),
			zap.Any("user_id", userID),
			zap.Any("role", role),
			zap.String("method", c.Request.Method),
			zap.String("path", c.Request.URL.Path),
			zap.String("ip", c.ClientIP()),
			zap.Time("timestamp", time.Now()),
		)
		c.Next()
	}
}

// AuditSensitiveOperations log các operations nhạy cảm
func AuditSensitiveOperations(c *gin.Context) {
	path := c.Request.URL.Path
	method := c.Request.Method

	sensitivePaths := []string{
		"/employees", "/customers", "/transactions",
		"/finance", "/settings", "/vouchers",
	}

	for _, sp := range sensitivePaths {
		if method != "GET" && (path == sp || len(path) > len(sp) && path[:len(sp)] == sp) {
			userID, _ := c.Get("userId")
			role, _ := c.Get("role")

			logger.Log.Info("SENSITIVE_OPERATION",
				zap.String("path", path),
				zap.String("method", method),
				zap.Any("user_id", userID),
				zap.Any("role", role),
				zap.String("ip", c.ClientIP()),
				zap.Time("timestamp", time.Now()),
			)
			break
		}
	}
	c.Next()
}
