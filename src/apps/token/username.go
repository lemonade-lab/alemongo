package token

import (
	"github.com/gin-gonic/gin"
)

func GetUserName(ctx *gin.Context) (string, bool) {
	// username 从 token 中 获取
	var username string = ""
	var name, exists = ctx.Get("username")
	if !exists {
		return "", exists
	}
	username = name.(string)
	return username, exists
}
