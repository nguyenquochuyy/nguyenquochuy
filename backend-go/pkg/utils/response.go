package utils

import "github.com/gin-gonic/gin"

func OK(c *gin.Context, data any) {
	c.JSON(200, gin.H{"success": true, "data": data})
}

func Created(c *gin.Context, data any) {
	c.JSON(201, gin.H{"success": true, "data": data})
}

func BadRequest(c *gin.Context, message string) {
	c.JSON(400, gin.H{"success": false, "message": message})
}

func Unauthorized(c *gin.Context) {
	c.JSON(401, gin.H{"success": false, "message": "Unauthorized"})
}

func Forbidden(c *gin.Context) {
	c.JSON(403, gin.H{"success": false, "message": "Forbidden"})
}

func NotFound(c *gin.Context, message string) {
	c.JSON(404, gin.H{"success": false, "message": message})
}

func InternalError(c *gin.Context, err error) {
	c.JSON(500, gin.H{"success": false, "message": err.Error()})
}
