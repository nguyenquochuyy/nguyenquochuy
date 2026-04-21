package middleware

import (
	"strings"

	"github.com/gin-gonic/gin"
	jwt "github.com/golang-jwt/jwt/v5"
)

// Roles
const (
	RoleOwner      = "OWNER"
	RoleAccountant = "ACCOUNTANT"
	RoleStaff      = "STAFF"
	RoleCustomer   = "CUSTOMER"
)

type Claims struct {
	UserID string `json:"userId"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

// Auth xác thực JWT access token
func Auth(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			c.JSON(401, gin.H{"success": false, "message": "Thiếu token xác thực"})
			c.Abort()
			return
		}

		tokenStr := strings.TrimPrefix(header, "Bearer ")
		claims := &Claims{}

		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (any, error) {
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(jwtSecret), nil
		})
		if err != nil || !token.Valid {
			c.JSON(401, gin.H{"success": false, "message": "Token không hợp lệ hoặc đã hết hạn"})
			c.Abort()
			return
		}

		c.Set("userId", claims.UserID)
		c.Set("role", claims.Role)
		c.Next()
	}
}

// RequireRole kiểm tra role khớp với danh sách cho phép
func RequireRole(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, _ := c.Get("role")
		for _, r := range roles {
			if r == role {
				c.Next()
				return
			}
		}
		c.JSON(403, gin.H{"success": false, "message": "Không có quyền truy cập"})
		c.Abort()
	}
}

// RequireEmployee — tất cả nhân viên (OWNER, STAFF, ACCOUNTANT)
func RequireEmployee() gin.HandlerFunc {
	return RequireRole(RoleOwner, RoleStaff, RoleAccountant)
}

// RequireOwner — chỉ OWNER
func RequireOwner() gin.HandlerFunc {
	return RequireRole(RoleOwner)
}

// RequireFinance — OWNER hoặc ACCOUNTANT được xem/sửa tài chính
func RequireFinance() gin.HandlerFunc {
	return RequireRole(RoleOwner, RoleAccountant)
}

// RequireCustomer — chỉ CUSTOMER
func RequireCustomer() gin.HandlerFunc {
	return RequireRole(RoleCustomer)
}

// GetUserID lấy userID từ context
func GetUserID(c *gin.Context) string {
	v, _ := c.Get("userId")
	id, _ := v.(string)
	return id
}

// GetRole lấy role từ context
func GetRole(c *gin.Context) string {
	v, _ := c.Get("role")
	role, _ := v.(string)
	return role
}
