package user

import (
	"alemongo/src/apps/token"
	"alemongo/src/users"
	"net/http"

	"github.com/gin-gonic/gin"
)

// method: PUT
func PassWord(ctx *gin.Context) {
	oldPassword := ctx.PostForm("old_assword")
	password := ctx.PostForm("password")
	// 相同
	if password == oldPassword {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "新密码不能和旧密码相同",
			"data": nil,
		})
		return
	}
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
		admin := users.GetAdminAccount()
		if oldPassword != admin.PassWord {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"code": http.StatusBadRequest,
				"msg":  "密码错误",
				"data": nil,
			})
			return
		}
		// 修改密码
		ok := users.SetAdminPassword(password)
		if !ok {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"code": http.StatusBadRequest,
				"msg":  "修改密码失败",
				"data": nil,
			})
			return
		}
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
		if oldPassword != user.PassWord {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"code": http.StatusBadRequest,
				"msg":  "密码错误",
				"data": nil,
			})
			return
		}
		// 修改密码
		ok := users.SetUserByUserName(username, password)
		if !ok {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"code": http.StatusBadRequest,
				"msg":  "修改密码失败",
				"data": nil,
			})
			return
		}
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "请求成功",
		"data": nil,
	})
}
