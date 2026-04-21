package middleware

import (
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// UserRateLimiter giới hạn rate theo userID thay vì IP
type UserRateLimiter struct {
	users map[string]*rate.Limiter
	mu    sync.RWMutex
	r     rate.Limit
	b     int
}

func NewUserRateLimiter(r rate.Limit, b int) *UserRateLimiter {
	return &UserRateLimiter{
		users: make(map[string]*rate.Limiter),
		mu:    sync.RWMutex{},
		r:     r,
		b:     b,
	}
}

func (u *UserRateLimiter) GetLimiter(userID string) *rate.Limiter {
	u.mu.Lock()
	defer u.mu.Unlock()

	if l, ok := u.users[userID]; ok {
		return l
	}

	l := rate.NewLimiter(u.r, u.b)
	u.users[userID] = l
	return l
}

var userLimiter = NewUserRateLimiter(rate.Limit(50), 100) // 50 req/s, burst 100

// UserRateLimit giới hạn rate theo userID (cho authenticated requests)
func UserRateLimit() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, exists := c.Get("userId")
		if !exists {
			c.Next() // fallback to IP-based rate limit
			return
		}

		l := userLimiter.GetLimiter(userID.(string))
		if !l.Allow() {
			c.JSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"message": "Quá nhiều yêu cầu, vui lòng chờ",
			})
			c.Abort()
			return
		}
		c.Next()
	}
}
