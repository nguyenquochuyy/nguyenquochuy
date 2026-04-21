package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	validator "github.com/go-playground/validator/v10"

	"unishop/backend/pkg/utils"
)

var validate = validator.New()

// ValidateJSON validate request body struct
func ValidateJSON(obj any) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.Method == http.MethodGet || c.Request.Method == http.MethodDelete {
			c.Next()
			return
		}

		if err := c.ShouldBindJSON(obj); err != nil {
			utils.BadRequest(c, "Dữ liệu không hợp lệ: "+err.Error())
			c.Abort()
			return
		}

		if err := validate.Struct(obj); err != nil {
			var msgs []string
			for _, e := range err.(validator.ValidationErrors) {
				msgs = append(msgs, formatValidation(e))
			}
			utils.BadRequest(c, strings.Join(msgs, "; "))
			c.Abort()
			return
		}

		c.Next()
	}
}

func formatValidation(e validator.FieldError) string {
	field := e.Field()
	switch e.Tag() {
	case "required":
		return field + " là bắt buộc"
	case "email":
		return field + " phải là email hợp lệ"
	case "min":
		return field + " phải có ít nhất " + e.Param() + " ký tự"
	case "max":
		return field + " không được quá " + e.Param() + " ký tự"
	case "len":
		return field + " phải đúng " + e.Param() + " ký tự"
	default:
		return field + " không hợp lệ"
	}
}
