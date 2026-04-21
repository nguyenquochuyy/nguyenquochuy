package middleware

import (
	"errors"

	"unishop/backend/internal/logger"
	"unishop/backend/pkg/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.uber.org/zap"
)

// ErrorHandler catch panic và errors, trả về JSON format đồng nhất
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				logger.Log.Error("Panic recovered", zap.Any("error", err))
				utils.InternalError(c, errors.New("Lỗi server nội bộ"))
				c.Abort()
			}
		}()
		c.Next()
	}
}

// ErrorHandlerMiddleware xử lý errors từ c.Errors
func ErrorHandlerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		if len(c.Errors) > 0 {
			err := c.Errors.Last().Err

			// MongoDB errors
			if mongo.IsDuplicateKeyError(err) {
				utils.BadRequest(c, "Dữ liệu đã tồn tại")
				return
			}
			if mongo.IsNetworkError(err) {
				utils.InternalError(c, errors.New("Lỗi kết nối database"))
				return
			}

			// Default
			utils.InternalError(c, err)
		}
	}
}
