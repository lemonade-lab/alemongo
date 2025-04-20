package users

import (
	"alemongo/src/config"
	"net/http"

	"github.com/gin-gonic/gin"
)

// 获取用户信息
func Info(ctx *gin.Context) {
	user := config.Get().User
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "请求成功",
		"data": user,
	})
}
