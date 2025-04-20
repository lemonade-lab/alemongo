package users

import (
	"alemongo/src/apps/token"
	"alemongo/src/config"
	"net/http"

	"github.com/gin-gonic/gin"
)

// 登录
func Login(ctx *gin.Context) {
	password := ctx.PostForm("password")
	username := ctx.PostForm("username")

	user, exist := config.GetUserByUserName(username)
	if !exist {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "用户不存在",
			"data": nil,
		})
		return
	}

	// 密码不对
	if password != user.PassWord {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "密码错误",
			"data": nil,
		})
		return
	}

	// 生产token
	tokenValue, err := token.Create(username)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "生成token失败",
			"data": nil,
		})
		return
	}

	// 反馈
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "请求成功",
		"data": tokenValue,
	})
}
