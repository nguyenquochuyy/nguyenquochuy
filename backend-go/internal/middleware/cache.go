package middleware

import (
	"bytes"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"unishop/backend/pkg/cache"
)

type responseWriter struct {
	gin.ResponseWriter
	body *bytes.Buffer
}

func (r responseWriter) Write(b []byte) (int, error) {
	r.body.Write(b)
	return r.ResponseWriter.Write(b)
}

// CacheResponse cache GET response với TTL nhất định
// Key = full URL path + query string
func CacheResponse(c cache.Cache, ttl time.Duration) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		if ctx.Request.Method != http.MethodGet {
			ctx.Next()
			return
		}

		key := "resp:" + ctx.Request.URL.RequestURI()

		if data, ok := c.Get(key); ok {
			ctx.Data(http.StatusOK, "application/json; charset=utf-8", data)
			ctx.Abort()
			return
		}

		rw := &responseWriter{body: &bytes.Buffer{}, ResponseWriter: ctx.Writer}
		ctx.Writer = rw

		ctx.Next()

		if ctx.Writer.Status() == http.StatusOK {
			c.Set(key, rw.body.Bytes(), ttl)
		}
	}
}
