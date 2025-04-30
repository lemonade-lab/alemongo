package user

import (
	"alemongo/src/apps/token"
	"alemongo/src/users"
	"net/http"

	"github.com/gin-gonic/gin"
)

// 登录
func Login(ctx *gin.Context) {
	username := ctx.PostForm("username")
	password := ctx.PostForm("password")

	userInfo := users.User{}
	if users.IsSuperAdmin(username) {
		// 得到超级管理员信息
		userInfo = users.GetAdminAccount()
	} else {
		user, exist := users.GetUserByUserName(username)
		if !exist {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"code": http.StatusBadRequest,
				"msg":  "用户不存在",
				"data": nil,
			})
			return
		}
		userInfo = user
	}

	// 密码不对
	if password != userInfo.PassWord {
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
