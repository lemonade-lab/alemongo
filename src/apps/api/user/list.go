package user

import (
	"alemongo/src/users"
	"net/http"

	"github.com/gin-gonic/gin"
)

// 获取用户信息
func List(ctx *gin.Context) {
	user := users.GetList()
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "请求成功",
		"data": user,
	})
}
