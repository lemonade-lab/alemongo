package requests

import "github.com/gin-gonic/gin"

// GetUserName 获取存在context中的username
func GetUserName(c *gin.Context) (string, bool) {
	name, exists := c.Get("username")
	if !exists {
		return "", exists
	}
	return name.(string), exists
}
