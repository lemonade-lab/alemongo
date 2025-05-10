package user

import (
	"alemongo/src/apps/token"
	"alemongo/src/permission"
	"alemongo/src/users"
	"net/http"

	"github.com/gin-gonic/gin"
)

// method: PUT
func Identity(ctx *gin.Context) {
	identity := ctx.Query("identity")
	if identity == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "身份不能为空",
			"data": nil,
		})
		return
	}
	exist := permission.ExistIdentity(identity)
	if !exist {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "参数错误",
			"data": nil,
		})
		return
	}
	// 用户更新权限
	message := token.Permission(ctx, permission.UserUpdate)
	if message != "" {
		ctx.JSON(200, gin.H{
			"code": 200,
			"msg":  message,
			"data": nil,
		})
		ctx.Abort()
		return
	}
	username := ctx.Query("username")
	if users.IsSuperAdmin(username) {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "禁止修改超级账户",
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
	ok := users.SetUserIdentityByUserName(user.UserName, identity)
	if !ok {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"code": http.StatusBadRequest,
			"msg":  "修改失败",
			"data": nil,
		})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{
		"code": 200,
		"msg":  "请求成功",
		"data": nil,
	})
	ctx.Abort()
}

// method: Get
func IdentityList(ctx *gin.Context) {
	ctx.JSON(200, gin.H{
		"code": 200,
		"msg":  "获取成功",
		"data": permission.Identities,
	})
	ctx.Abort()
}
