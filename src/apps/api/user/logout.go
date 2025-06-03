package user

import (
	"alemongo/src/pkgs/jwt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// 退出登录
func Logout(ctx *gin.Context) {
	tokenValue, exists := ctx.Get("token")
	if !exists {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "无效token",
			"data": nil,
		})
		return
	}
	err := jwt.DeleteToken(tokenValue.(string))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "退出登录失败",
			"data": nil,
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "请求成功",
		"data": nil,
	})
}
