package user

import (
	"alemongo/src/apps/token"
	"alemongo/src/users"
	"net/http"

	"github.com/gin-gonic/gin"
)

// 获取用户信息
func Info(ctx *gin.Context) {
	username, exists := token.GetUserName(ctx)
	if !exists {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "错误请求",
			"data": nil,
		})
		return
	}
	// 是否是超级管理员
	if users.IsSuperAdmin(username) {
		// 得到超级管理员信息
		userInfo := users.GetAdminAccount()
		userInfo.PassWord = "******" // 隐藏密码
		ctx.JSON(http.StatusOK, gin.H{
			"code": http.StatusOK,
			"msg":  "请求成功",
			"data": userInfo,
		})
		return
	}

	userInfo, exists := users.GetUserByUserName(username)
	if !exists {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "用户不存在",
			"data": nil,
		})
		return
	}
	userInfo.PassWord = "******" // 隐藏密码
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "请求成功",
		"data": userInfo,
	})
}
