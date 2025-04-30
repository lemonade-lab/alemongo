package user

import (
	"alemongo/src/apps/token"
	"alemongo/src/config"
	"alemongo/src/users"
	"net/http"

	"github.com/gin-gonic/gin"
)

// method: PUT
func PassWord(ctx *gin.Context) {
	oldPassword := ctx.PostForm("old_assword")
	password := ctx.PostForm("password")
	username, exists := token.GetUserName(ctx)
	if !exists {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "错误请求",
			"data": nil,
		})
		return
	}
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
			"msg":  "旧密码错误",
			"data": nil,
		})
		return
	}
	// 相同
	if password == oldPassword {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "新密码不能和旧密码相同",
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
	config.Save()
	ctx.JSON(http.StatusOK, gin.H{
		"code": http.StatusOK,
		"msg":  "请求成功",
		"data": nil,
	})
}
